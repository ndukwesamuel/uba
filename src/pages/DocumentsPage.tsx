import { useEffect, useState, useRef } from 'react';
import { 
  FolderOpen, 
  Upload, 
  Search,
  FileText,
  Download,
  Trash2,
  MoreVertical,
  Image,
  FileSpreadsheet,
  File
} from 'lucide-react';
import { useAuthStore, useInstructionsStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const fileTypeIcons: Record<string, React.ElementType> = {
  'application/pdf': FileText,
  'image/jpeg': Image,
  'image/png': Image,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileSpreadsheet,
  'application/vnd.ms-excel': FileSpreadsheet,
};

const fileTypeColors: Record<string, string> = {
  'application/pdf': 'bg-red-500',
  'image/jpeg': 'bg-blue-500',
  'image/png': 'bg-blue-500',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'bg-green-500',
  'application/vnd.ms-excel': 'bg-green-500',
};

export default function DocumentsPage() {
  const { user } = useAuthStore();
  const { instructions } = useInstructionsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedBy: string;
    uploadedAt: string;
    instructionId?: string;
  }>>([]);

  useEffect(() => {
    // Collect all documents from instructions
    const allDocs: typeof documents = [];
    instructions.forEach(instruction => {
      instruction.supportingDocuments.forEach(doc => {
        allDocs.push({
          ...doc,
          instructionId: instruction.instructionId,
        });
      });
    });
    
    // Sort by upload date
    allDocs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    
    setDocuments(allDocs);
  }, [instructions]);

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const newDoc = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedBy: user?.name || 'Unknown',
          uploadedAt: new Date().toISOString(),
        };
        setDocuments(prev => [newDoc, ...prev]);
      });
      toast.success('Files uploaded successfully');
    }
  };

  const handleDelete = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    toast.success('Document deleted');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalSize = documents.reduce((acc, doc) => acc + doc.size, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Document Management</h1>
          <p className="text-white/50 mt-1">
            Manage and organize instruction documents
          </p>
        </div>
        <Button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#D92027] hover:bg-[#B51C22] text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{documents.length}</p>
                <p className="text-sm text-white/50">Total Documents</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{formatFileSize(totalSize)}</p>
                <p className="text-sm text-white/50">Total Size</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {documents.filter(d => d.type === 'application/pdf').length}
                </p>
                <p className="text-sm text-white/50">PDF Documents</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-[#1A1A1A] border-white/10">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Search documents by name or uploader..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className="bg-[#1A1A1A] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">All Documents</CardTitle>
          <CardDescription className="text-white/50">
            {filteredDocuments.length} documents found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-white/30" />
                <h3 className="text-lg font-semibold text-white">No documents found</h3>
                <p className="text-white/50 mt-2">Upload documents to get started</p>
              </div>
            ) : (
              filteredDocuments.map((doc) => {
                const Icon = fileTypeIcons[doc.type] || File;
                const colorClass = fileTypeColors[doc.type] || 'bg-gray-500';
                
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", colorClass)}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{doc.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-white/50 mt-1">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>•</span>
                          <span>Uploaded by {doc.uploadedBy}</span>
                          <span>•</span>
                          <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                        {doc.instructionId && (
                          <Badge variant="outline" className="mt-2 text-xs border-white/20 text-white/50">
                            {doc.instructionId}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4 text-white/60" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-white/10">
                        <DropdownMenuItem 
                          className="text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-500 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit
} from 'lucide-react';
import { useAuthStore, useInstructionsStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { InstructionStatus, InstructionType } from '@/types';

// Status colors for reference

const statusLabels: Record<InstructionStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  callback_verification: 'Callback Verification',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  returned: 'Returned',
};

const typeLabels: Record<InstructionType, string> = {
  account_opening: 'Account Opening',
  funds_transfer: 'Funds Transfer',
  trade_settlement: 'Trade Settlement',
};

export default function InstructionsPage() {
  const navigate = useNavigate();
  const { canPerformAction } = useAuthStore();
  const { instructions, isLoading, fetchInstructions } = useInstructionsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InstructionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<InstructionType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchInstructions();
  }, [fetchInstructions]);

  const filteredInstructions = instructions.filter((instruction) => {
    const matchesSearch = 
      instruction.instructionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instruction.clientAccountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instruction.submittedByName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || instruction.status === statusFilter;
    const matchesType = typeFilter === 'all' || instruction.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredInstructions.length / itemsPerPage);
  const paginatedInstructions = filteredInstructions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const canCreateInstruction = canPerformAction('create_instruction');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Instructions</h1>
          <p className="text-white/50 mt-1">
            Manage and track all client instructions
          </p>
        </div>
        {canCreateInstruction && (
          <Button 
            onClick={() => navigate('/instructions/new')}
            className="bg-[#D92027] hover:bg-[#B51C22] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Instruction
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="bg-[#1A1A1A] border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Search by ID, account, or submitter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as InstructionStatus | 'all')}>
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10">
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as InstructionType | 'all')}>
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10">
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Table */}
      <Card className="bg-[#1A1A1A] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">
            All Instructions ({filteredInstructions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full bg-white/10" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-white/60">Instruction ID</TableHead>
                      <TableHead className="text-white/60">Type</TableHead>
                      <TableHead className="text-white/60">Account</TableHead>
                      <TableHead className="text-white/60">Amount</TableHead>
                      <TableHead className="text-white/60">Status</TableHead>
                      <TableHead className="text-white/60">Submitted By</TableHead>
                      <TableHead className="text-white/60">Date</TableHead>
                      <TableHead className="text-white/60 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedInstructions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <FileText className="w-12 h-12 mx-auto mb-3 text-white/30" />
                          <p className="text-white/50">No instructions found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedInstructions.map((instruction) => (
                        <TableRow 
                          key={instruction.id}
                          className="border-white/5 hover:bg-white/5 cursor-pointer"
                          onClick={() => navigate(`/instructions/${instruction.id}`)}
                        >
                          <TableCell className="font-medium text-white">
                            {instruction.instructionId}
                          </TableCell>
                          <TableCell className="text-white/70">
                            {typeLabels[instruction.type]}
                          </TableCell>
                          <TableCell className="text-white/70">
                            {instruction.clientAccountNumber}
                          </TableCell>
                          <TableCell className="text-white/70">
                            {instruction.currency} {instruction.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "capitalize",
                                instruction.status === 'approved' && "border-green-500 text-green-500",
                                instruction.status === 'rejected' && "border-red-500 text-red-500",
                                instruction.status === 'completed' && "border-emerald-500 text-emerald-500",
                                instruction.status === 'under_review' && "border-yellow-500 text-yellow-500",
                                instruction.status === 'callback_verification' && "border-orange-500 text-orange-500",
                                instruction.status === 'returned' && "border-purple-500 text-purple-500",
                                instruction.status === 'submitted' && "border-blue-500 text-blue-500",
                                instruction.status === 'draft' && "border-gray-500 text-gray-500",
                              )}
                            >
                              {statusLabels[instruction.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white/70">
                            {instruction.submittedByName}
                          </TableCell>
                          <TableCell className="text-white/70">
                            {instruction.submittedAt 
                              ? new Date(instruction.submittedAt).toLocaleDateString() 
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Eye className="h-4 w-4 text-white/60" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-white/10">
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/instructions/${instruction.id}`);
                                  }}
                                  className="text-white/70 hover:text-white hover:bg-white/10"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {instruction.status === 'draft' && canPerformAction('edit_draft') && (
                                  <DropdownMenuItem 
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-white/70 hover:text-white hover:bg-white/10"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                  <p className="text-sm text-white/50">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredInstructions.length)} of {filteredInstructions.length} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-white/70">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

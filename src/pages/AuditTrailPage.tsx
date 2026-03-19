import { useEffect, useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter,
  FileText,
  LogIn,
  LogOut,
  CheckCircle,
  XCircle,
  Upload,
  Download
} from 'lucide-react';
import { useInstructionsStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
import type { AuditEvent, AuditAction } from '@/types';

const actionIcons: Record<string, React.ElementType> = {
  login: LogIn,
  logout: LogOut,
  instruction_created: FileText,
  instruction_submitted: Upload,
  instruction_verified: CheckCircle,
  instruction_authorized: CheckCircle,
  instruction_approved: CheckCircle,
  instruction_rejected: XCircle,
  instruction_returned: Upload,
  document_uploaded: Upload,
  document_downloaded: Download,
};

const actionLabels: Record<AuditAction, string> = {
  login: 'User Login',
  logout: 'User Logout',
  instruction_created: 'Instruction Created',
  instruction_submitted: 'Instruction Submitted',
  instruction_verified: 'Instruction Verified',
  instruction_authorized: 'Instruction Authorized',
  instruction_approved: 'Instruction Approved',
  instruction_rejected: 'Instruction Rejected',
  instruction_returned: 'Instruction Returned',
  instruction_completed: 'Instruction Completed',
  document_uploaded: 'Document Uploaded',
  document_downloaded: 'Document Downloaded',
  callback_verified: 'Callback Verified',
  user_created: 'User Created',
  user_updated: 'User Updated',
  user_deactivated: 'User Deactivated',
};

const actionColors: Record<string, string> = {
  login: 'bg-blue-500',
  logout: 'bg-gray-500',
  instruction_created: 'bg-purple-500',
  instruction_submitted: 'bg-blue-500',
  instruction_verified: 'bg-yellow-500',
  instruction_authorized: 'bg-purple-500',
  instruction_approved: 'bg-green-500',
  instruction_rejected: 'bg-red-500',
  instruction_returned: 'bg-orange-500',
  document_uploaded: 'bg-cyan-500',
  document_downloaded: 'bg-cyan-500',
  callback_verified: 'bg-green-500',
  user_created: 'bg-emerald-500',
  user_updated: 'bg-blue-500',
  user_deactivated: 'bg-red-500',
};

export default function AuditTrailPage() {
  const { instructions } = useInstructionsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    // Collect all audit events from instructions
    const events: AuditEvent[] = [];
    instructions.forEach(instruction => {
      events.push(...instruction.auditTrail);
    });
    
    // Add some mock system events
    events.push(
      {
        id: 'sys-1',
        userId: '1',
        userName: 'John Maker',
        userRole: 'maker',
        action: 'login',
        entityType: 'system',
        entityId: 'system',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'sys-2',
        userId: '2',
        userName: 'Sarah Verifier',
        userRole: 'verifier',
        action: 'login',
        entityType: 'system',
        entityId: 'system',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      }
    );

    // Sort by timestamp descending
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setAuditEvents(events);
  }, [instructions]);

  const filteredEvents = auditEvents.filter(event => {
    const matchesSearch = 
      event.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      actionLabels[event.action]?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || event.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Trail</h1>
        <p className="text-white/50 mt-1">
          Complete log of all system activities
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-[#1A1A1A] border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Search by user or action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-white/10">
                <SelectItem value="all">All Actions</SelectItem>
                {Object.entries(actionLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="bg-[#1A1A1A] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#D92027]" />
            Activity Log
          </CardTitle>
          <CardDescription className="text-white/50">
            {filteredEvents.length} events recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-white/60">Action</TableHead>
                  <TableHead className="text-white/60">User</TableHead>
                  <TableHead className="text-white/60">Role</TableHead>
                  <TableHead className="text-white/60">Entity</TableHead>
                  <TableHead className="text-white/60">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <ClipboardList className="w-12 h-12 mx-auto mb-3 text-white/30" />
                      <p className="text-white/50">No audit events found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => {
                    const Icon = actionIcons[event.action] || ClipboardList;
                    return (
                      <TableRow key={event.id} className="border-white/5 hover:bg-white/5">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              actionColors[event.action] || 'bg-gray-500'
                            )}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white font-medium">
                              {actionLabels[event.action] || event.action}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                              <span className="text-xs">{event.userName.charAt(0)}</span>
                            </div>
                            <span className="text-white">{event.userName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize text-white/70 border-white/20">
                            {event.userRole.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white/70 capitalize">
                          {event.entityType}
                        </TableCell>
                        <TableCell className="text-white/50">
                          {new Date(event.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

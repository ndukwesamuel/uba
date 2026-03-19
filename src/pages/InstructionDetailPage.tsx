import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  MessageSquare,
  CheckCircle,
  XCircle,
  RotateCcw,
  PhoneCall,
  User,
  Clock,
  Calendar,
  DollarSign,
  CreditCard
} from 'lucide-react';
import { useAuthStore, useInstructionsStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { InstructionStatus } from '@/types';

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

const typeLabels: Record<string, string> = {
  account_opening: 'Account Opening',
  funds_transfer: 'Funds Transfer',
  trade_settlement: 'Trade Settlement',
};

export default function InstructionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canPerformAction } = useAuthStore();
  const { instructions, getInstructionById, verifyInstruction, authorizeInstruction, processInstruction, addComment } = useInstructionsStore();
  const [instruction, setInstruction] = useState<ReturnType<typeof getInstructionById>>();
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: string }>({ open: false, action: '' });
  const [callbackDialog, setCallbackDialog] = useState(false);
  const [callbackData, setCallbackData] = useState({ status: 'verified' as 'verified' | 'failed', notes: '' });

  useEffect(() => {
    if (id) {
      const found = getInstructionById(id);
      setInstruction(found);
      setIsLoading(false);
    }
  }, [id, getInstructionById, instructions]);

  const handleAddComment = async () => {
    if (!comment.trim() || !id) return;
    await addComment(id, comment);
    setComment('');
    toast.success('Comment added');
  };

  const handleAction = async () => {
    if (!id) return;

    try {
      switch (actionDialog.action) {
        case 'verify':
          await verifyInstruction(id, comment);
          toast.success('Instruction verified');
          break;
        case 'authorize':
          await authorizeInstruction(id, comment);
          toast.success('Instruction authorized');
          break;
        case 'approve':
          await processInstruction(id, 'approve', comment);
          toast.success('Instruction approved');
          break;
        case 'reject':
          await processInstruction(id, 'reject', comment);
          toast.success('Instruction rejected');
          break;
        case 'return':
          await processInstruction(id, 'return', comment);
          toast.success('Instruction returned for correction');
          break;
      }
      setActionDialog({ open: false, action: '' });
      setComment('');
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleCallbackVerification = async () => {
    if (!id) return;
    // In a real app, this would update the callback verification
    toast.success(`Callback marked as ${callbackData.status}`);
    setCallbackDialog(false);
  };

  const canVerify = instruction?.status === 'submitted' && canPerformAction('verify_instruction');
  const canAuthorize = instruction?.status === 'under_review' && canPerformAction('authorize_instruction');
  const canProcess = instruction?.status === 'callback_verification' && canPerformAction('process_instruction');
  const canCallback = instruction?.status === 'callback_verification' && canPerformAction('callback_verify');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-white/10" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 bg-white/10 lg:col-span-2" />
          <Skeleton className="h-96 bg-white/10" />
        </div>
      </div>
    );
  }

  if (!instruction) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto mb-4 text-white/30" />
        <h2 className="text-xl font-semibold text-white">Instruction not found</h2>
        <p className="text-white/50 mt-2">The instruction you're looking for doesn't exist</p>
        <Button onClick={() => navigate('/instructions')} className="mt-4 bg-[#D92027]">
          Back to Instructions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/instructions')}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{instruction.instructionId}</h1>
            <p className="text-white/50 text-sm">
              Created {new Date(instruction.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            "capitalize text-sm px-3 py-1",
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instruction Details */}
          <Card className="bg-[#1A1A1A] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D92027]" />
                Instruction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-white/40" />
                    <div>
                      <p className="text-sm text-white/50">Type</p>
                      <p className="text-white font-medium">{typeLabels[instruction.type]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-white/40" />
                    <div>
                      <p className="text-sm text-white/50">Account Number</p>
                      <p className="text-white font-medium">{instruction.clientAccountNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-white/40" />
                    <div>
                      <p className="text-sm text-white/50">Value Date</p>
                      <p className="text-white font-medium">{instruction.valueDate}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-white/40" />
                    <div>
                      <p className="text-sm text-white/50">Amount</p>
                      <p className="text-white font-medium">
                        {instruction.currency} {instruction.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-white/40" />
                    <div>
                      <p className="text-sm text-white/50">Submitted By</p>
                      <p className="text-white font-medium">{instruction.submittedByName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-white/40" />
                    <div>
                      <p className="text-sm text-white/50">Submitted At</p>
                      <p className="text-white font-medium">
                        {instruction.submittedAt 
                          ? new Date(instruction.submittedAt).toLocaleString() 
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {instruction.description && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-white/50 mb-2">Description</p>
                  <p className="text-white">{instruction.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="bg-[#1A1A1A] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Supporting Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {instruction.supportingDocuments.length === 0 ? (
                <p className="text-white/50 text-center py-4">No documents attached</p>
              ) : (
                <div className="space-y-2">
                  {instruction.supportingDocuments.map((doc) => (
                    <div 
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#D92027]" />
                        <div>
                          <p className="text-sm text-white">{doc.name}</p>
                          <p className="text-xs text-white/50">
                            {(doc.size / 1024).toFixed(2)} KB • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card className="bg-[#1A1A1A] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#D92027]" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {instruction.comments.length === 0 ? (
                  <p className="text-white/50 text-center py-4">No comments yet</p>
                ) : (
                  instruction.comments.map((comment) => (
                    <div key={comment.id} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#D92027]/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-[#D92027]">
                              {comment.authorName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{comment.authorName}</p>
                            <p className="text-xs text-white/50 capitalize">{comment.authorRole.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <span className="text-xs text-white/40">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm">{comment.text}</p>
                    </div>
                  ))
                )}

                {/* Add Comment */}
                <div className="pt-4 border-t border-white/10">
                  <Textarea
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 mb-3"
                  />
                  <Button 
                    onClick={handleAddComment}
                    disabled={!comment.trim()}
                    className="bg-[#D92027] hover:bg-[#B51C22] text-white"
                  >
                    Add Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Workflow Actions */}
          <Card className="bg-[#1A1A1A] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Actions</CardTitle>
              <CardDescription className="text-white/50">
                Available actions for this instruction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {canVerify && (
                <Button 
                  onClick={() => setActionDialog({ open: true, action: 'verify' })}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Instruction
                </Button>
              )}

              {canAuthorize && (
                <Button 
                  onClick={() => setActionDialog({ open: true, action: 'authorize' })}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Authorize Instruction
                </Button>
              )}

              {canCallback && (
                <Button 
                  onClick={() => setCallbackDialog(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <PhoneCall className="w-4 h-4 mr-2" />
                  Perform Callback
                </Button>
              )}

              {canProcess && (
                <>
                  <Button 
                    onClick={() => setActionDialog({ open: true, action: 'approve' })}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    onClick={() => setActionDialog({ open: true, action: 'reject' })}
                    variant="outline"
                    className="w-full border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    onClick={() => setActionDialog({ open: true, action: 'return' })}
                    variant="outline"
                    className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Return for Correction
                  </Button>
                </>
              )}

              {!canVerify && !canAuthorize && !canProcess && !canCallback && (
                <p className="text-white/50 text-center py-4">
                  No actions available at this stage
                </p>
              )}
            </CardContent>
          </Card>

          {/* Workflow Timeline */}
          <Card className="bg-[#1A1A1A] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Workflow Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {instruction.submittedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Submitted</p>
                      <p className="text-xs text-white/50">{instruction.submittedByName}</p>
                      <p className="text-xs text-white/40">{new Date(instruction.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {instruction.verifiedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Verified</p>
                      <p className="text-xs text-white/50">{instruction.verifiedBy}</p>
                      <p className="text-xs text-white/40">{new Date(instruction.verifiedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {instruction.authorizedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Authorized</p>
                      <p className="text-xs text-white/50">{instruction.authorizedBy}</p>
                      <p className="text-xs text-white/40">{new Date(instruction.authorizedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {instruction.processedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Processed</p>
                      <p className="text-xs text-white/50">{instruction.processedBy}</p>
                      <p className="text-xs text-white/40">{new Date(instruction.processedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ open, action: '' })}>
        <DialogContent className="bg-[#1A1A1A] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white capitalize">
              {actionDialog.action} Instruction
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Are you sure you want to {actionDialog.action} this instruction?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Add a comment (optional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setActionDialog({ open: false, action: '' })}
              className="border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAction}
              className="bg-[#D92027] hover:bg-[#B51C22] text-white"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Callback Dialog */}
      <Dialog open={callbackDialog} onOpenChange={setCallbackDialog}>
        <DialogContent className="bg-[#1A1A1A] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Callback Verification</DialogTitle>
            <DialogDescription className="text-white/50">
              Record the outcome of the callback verification
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-4">
              <button
                onClick={() => setCallbackData(prev => ({ ...prev, status: 'verified' }))}
                className={cn(
                  "flex-1 p-4 rounded-lg border-2 transition-all",
                  callbackData.status === 'verified'
                    ? "border-green-500 bg-green-500/10"
                    : "border-white/10 hover:border-white/30"
                )}
              >
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-white text-center font-medium">Verified</p>
              </button>
              <button
                onClick={() => setCallbackData(prev => ({ ...prev, status: 'failed' }))}
                className={cn(
                  "flex-1 p-4 rounded-lg border-2 transition-all",
                  callbackData.status === 'failed'
                    ? "border-red-500 bg-red-500/10"
                    : "border-white/10 hover:border-white/30"
                )}
              >
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-white text-center font-medium">Failed</p>
              </button>
            </div>
            <Textarea
              placeholder="Add notes about the callback..."
              value={callbackData.notes}
              onChange={(e) => setCallbackData(prev => ({ ...prev, notes: e.target.value }))}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCallbackDialog(false)}
              className="border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCallbackVerification}
              className="bg-[#D92027] hover:bg-[#B51C22] text-white"
            >
              Record Callback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

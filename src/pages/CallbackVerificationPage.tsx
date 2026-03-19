import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PhoneCall, 
  CheckCircle, 
  XCircle, 
  Search,
  FileText,
  User,
  Calendar
} from 'lucide-react';
import { useAuthStore, useInstructionsStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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

export default function CallbackVerificationPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { instructions, fetchInstructions, processInstruction } = useInstructionsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstruction, setSelectedInstruction] = useState<typeof instructions[0] | null>(null);
  const [callbackDialog, setCallbackDialog] = useState(false);
  const [callbackData, setCallbackData] = useState({ 
    status: 'verified' as 'verified' | 'failed', 
    notes: '',
    officerName: user?.name || ''
  });

  useEffect(() => {
    fetchInstructions();
  }, [fetchInstructions]);

  const pendingCallbacks = instructions.filter(
    i => i.status === 'callback_verification'
  );

  const filteredCallbacks = pendingCallbacks.filter(
    i => 
      i.instructionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.clientAccountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.submittedByName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCallbackSubmit = async () => {
    if (!selectedInstruction) return;

    try {
      if (callbackData.status === 'verified') {
        await processInstruction(selectedInstruction.id, 'approve', callbackData.notes);
        toast.success('Callback verified and instruction approved');
      } else {
        await processInstruction(selectedInstruction.id, 'reject', callbackData.notes);
        toast.success('Callback failed and instruction rejected');
      }
      setCallbackDialog(false);
      setSelectedInstruction(null);
      setCallbackData({ status: 'verified', notes: '', officerName: user?.name || '' });
    } catch (error) {
      toast.error('Failed to process callback');
    }
  };

  const openCallbackDialog = (instruction: typeof instructions[0]) => {
    setSelectedInstruction(instruction);
    setCallbackDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Callback Verification</h1>
          <p className="text-white/50 mt-1">
            Verify high-value instructions through callback
          </p>
        </div>
        <Badge variant="outline" className="border-orange-500 text-orange-500 px-4 py-2">
          <PhoneCall className="w-4 h-4 mr-2" />
          {pendingCallbacks.length} Pending
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{pendingCallbacks.length}</p>
                <p className="text-sm text-white/50">Pending Callbacks</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <PhoneCall className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {instructions.filter(i => i.status === 'approved').length}
                </p>
                <p className="text-sm text-white/50">Verified Today</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {instructions.filter(i => i.status === 'rejected').length}
                </p>
                <p className="text-sm text-white/50">Failed Callbacks</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
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
              placeholder="Search by instruction ID, account, or submitter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pending Callbacks List */}
      <Card className="bg-[#1A1A1A] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Pending Callback Verifications</CardTitle>
          <CardDescription className="text-white/50">
            Instructions waiting for callback verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredCallbacks.length === 0 ? (
              <div className="text-center py-12">
                <PhoneCall className="w-16 h-16 mx-auto mb-4 text-white/30" />
                <h3 className="text-lg font-semibold text-white">No pending callbacks</h3>
                <p className="text-white/50 mt-2">All instructions have been verified</p>
              </div>
            ) : (
              filteredCallbacks.map((instruction) => (
                <div
                  key={instruction.id}
                  className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                        <PhoneCall className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-white">{instruction.instructionId}</h3>
                          <Badge variant="outline" className="border-orange-500 text-orange-500">
                            Callback Required
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {instruction.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {instruction.submittedByName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {instruction.valueDate}
                          </span>
                        </div>
                        <p className="text-lg font-semibold text-[#D92027] mt-2">
                          {instruction.currency} {instruction.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => navigate(`/instructions/${instruction.id}`)}
                        variant="outline"
                        className="border-white/10 text-white hover:bg-white/10"
                      >
                        View Details
                      </Button>
                      <Button
                        onClick={() => openCallbackDialog(instruction)}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        <PhoneCall className="w-4 h-4 mr-2" />
                        Perform Callback
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Callback Dialog */}
      <Dialog open={callbackDialog} onOpenChange={setCallbackDialog}>
        <DialogContent className="bg-[#1A1A1A] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-orange-500" />
              Callback Verification
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Record the outcome of the callback for {selectedInstruction?.instructionId}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Instruction Summary */}
            {selectedInstruction && (
              <div className="bg-white/5 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/50">Amount:</span>
                  <span className="text-white font-semibold">
                    {selectedInstruction.currency} {selectedInstruction.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Account:</span>
                  <span className="text-white">{selectedInstruction.clientAccountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Submitted By:</span>
                  <span className="text-white">{selectedInstruction.submittedByName}</span>
                </div>
              </div>
            )}

            {/* Officer Name */}
            <div className="space-y-2">
              <label className="text-sm text-white/70">Officer Name</label>
              <Input
                value={callbackData.officerName}
                onChange={(e) => setCallbackData(prev => ({ ...prev, officerName: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Enter your name"
              />
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <label className="text-sm text-white/70">Callback Result</label>
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
                  <p className="text-white/50 text-xs text-center mt-1">Callback successful</p>
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
                  <p className="text-white/50 text-xs text-center mt-1">Callback unsuccessful</p>
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm text-white/70">Notes</label>
              <Textarea
                value={callbackData.notes}
                onChange={(e) => setCallbackData(prev => ({ ...prev, notes: e.target.value }))}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                placeholder="Enter notes about the callback..."
                rows={3}
              />
            </div>
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
              onClick={handleCallbackSubmit}
              disabled={!callbackData.officerName}
              className={cn(
                callbackData.status === 'verified'
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600",
                "text-white"
              )}
            >
              {callbackData.status === 'verified' ? 'Verify & Approve' : 'Mark as Failed'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

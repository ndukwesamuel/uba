import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Upload, 
  X,
  DollarSign,
  Calendar,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { useInstructionsStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { InstructionType } from '@/types';

const instructionTypes = [
  { value: 'account_opening', label: 'Account Opening', icon: CreditCard },
  { value: 'funds_transfer', label: 'Funds Transfer', icon: DollarSign },
  { value: 'trade_settlement', label: 'Trade Settlement', icon: Briefcase },
];

const currencies = ['USD', 'EUR', 'GBP', 'NGN', 'JPY', 'AUD', 'CAD'];

export default function NewInstructionPage() {
  const navigate = useNavigate();
  const { createInstruction, uploadDocument } = useInstructionsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    type: '' as InstructionType | '',
    clientAccountNumber: '',
    currency: 'USD',
    amount: '',
    valueDate: '',
    description: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).filter(file => file.type === 'application/pdf');
      if (newFiles.length !== files.length) {
        toast.error('Only PDF files are allowed');
      }
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.type) {
          toast.error('Please select an instruction type');
          return false;
        }
        return true;
      case 2:
        if (!formData.clientAccountNumber) {
          toast.error('Please enter the client account number');
          return false;
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
          toast.error('Please enter a valid amount');
          return false;
        }
        if (!formData.valueDate) {
          toast.error('Please select a value date');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (saveAsDraft: boolean = false) => {
    if (!validateStep(2)) return;

    setIsSubmitting(true);

    try {
      const instruction = await createInstruction({
        type: formData.type as InstructionType,
        clientAccountNumber: formData.clientAccountNumber,
        currency: formData.currency,
        amount: parseFloat(formData.amount),
        valueDate: formData.valueDate,
        description: formData.description,
      });

      // Upload documents
      for (const file of uploadedFiles) {
        await uploadDocument(instruction.id, file);
      }

      if (!saveAsDraft) {
        // Submit the instruction
        const { submitInstruction } = useInstructionsStore.getState();
        await submitInstruction(instruction.id);
        toast.success('Instruction submitted successfully!');
      } else {
        toast.success('Instruction saved as draft');
      }

      navigate('/instructions');
    } catch (error) {
      toast.error('Failed to create instruction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-white mb-4 block">Select Instruction Type</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {instructionTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleInputChange('type', type.value)}
                    className={cn(
                      "p-6 rounded-xl border-2 transition-all duration-300 text-left group",
                      formData.type === type.value
                        ? "border-[#D92027] bg-[#D92027]/10"
                        : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                    )}
                  >
                    <type.icon className={cn(
                      "w-8 h-8 mb-4 transition-colors",
                      formData.type === type.value ? "text-[#D92027]" : "text-white/50 group-hover:text-white"
                    )} />
                    <h3 className={cn(
                      "font-semibold text-lg",
                      formData.type === type.value ? "text-white" : "text-white/70"
                    )}>
                      {type.label}
                    </h3>
                    <p className="text-sm text-white/50 mt-2">
                      Create a new {type.label.toLowerCase()} instruction
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-white">
                  Client Account Number <span className="text-[#D92027]">*</span>
                </Label>
                <Input
                  id="accountNumber"
                  placeholder="Enter account number"
                  value={formData.clientAccountNumber}
                  onChange={(e) => handleInputChange('clientAccountNumber', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valueDate" className="text-white">
                  Value Date <span className="text-[#D92027]">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="valueDate"
                    type="date"
                    value={formData.valueDate}
                    onChange={(e) => handleInputChange('valueDate', e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-white">Currency</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(v) => handleInputChange('currency', v)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-white/10">
                    {currencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">
                  Amount <span className="text-[#D92027]">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter additional details about this instruction..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-white mb-4 block">Supporting Documents</Label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-[#D92027]/50 hover:bg-[#D92027]/5 transition-all"
              >
                <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white font-medium">Click to upload PDF documents</p>
                <p className="text-white/50 text-sm mt-2">or drag and drop files here</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <Label className="text-white">Uploaded Files</Label>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#D92027]" />
                        <div>
                          <p className="text-sm text-white">{file.name}</p>
                          <p className="text-xs text-white/50">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-white/50" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="bg-white/5 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-white">Instruction Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/50">Type</p>
                  <p className="text-white capitalize">{formData.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-white/50">Account</p>
                  <p className="text-white">{formData.clientAccountNumber}</p>
                </div>
                <div>
                  <p className="text-white/50">Amount</p>
                  <p className="text-white">{formData.currency} {parseFloat(formData.amount || '0').toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-white/50">Value Date</p>
                  <p className="text-white">{formData.valueDate}</p>
                </div>
              </div>
              {formData.description && (
                <div>
                  <p className="text-white/50 text-sm">Description</p>
                  <p className="text-white text-sm mt-1">{formData.description}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <h1 className="text-2xl font-bold text-white">New Instruction</h1>
          <p className="text-white/50 text-sm">Create a new client instruction</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
              currentStep >= step 
                ? "bg-[#D92027] text-white" 
                : "bg-white/10 text-white/50"
            )}>
              {step}
            </div>
            {step < 3 && (
              <div className={cn(
                "w-16 h-1 rounded-full transition-colors",
                currentStep > step ? "bg-[#D92027]" : "bg-white/10"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <Card className="bg-[#1A1A1A] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">
            {currentStep === 1 && 'Select Instruction Type'}
            {currentStep === 2 && 'Enter Instruction Details'}
            {currentStep === 3 && 'Review and Submit'}
          </CardTitle>
          <CardDescription className="text-white/50">
            {currentStep === 1 && 'Choose the type of instruction you want to create'}
            {currentStep === 2 && 'Fill in the required information for this instruction'}
            {currentStep === 3 && 'Review your instruction and add any supporting documents'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}

          {/* Actions */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            <div>
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              {currentStep === 3 && (
                <Button
                  variant="outline"
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  Save as Draft
                </Button>
              )}
              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  className="bg-[#D92027] hover:bg-[#B51C22] text-white"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className="bg-[#D92027] hover:bg-[#B51C22] text-white"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Submit Instruction'
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

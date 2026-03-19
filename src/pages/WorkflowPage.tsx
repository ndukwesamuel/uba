import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GitBranch, 
  User, 
  CheckCircle, 
  ArrowRight,
  FileText,
  Shield
} from 'lucide-react';
import { useAuthStore, useInstructionsStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  role: string;
  icon: React.ElementType;
  color: string;
  actions: string[];
}

const workflowSteps: WorkflowStep[] = [
  {
    id: 'maker',
    title: 'Maker',
    description: 'Client user creates and submits the instruction',
    role: 'Client Maker',
    icon: User,
    color: 'bg-blue-500',
    actions: ['Create instruction', 'Upload documents', 'Submit for review'],
  },
  {
    id: 'verifier',
    title: 'Verifier',
    description: 'Reviews instruction for accuracy and completeness',
    role: 'Client Verifier',
    icon: CheckCircle,
    color: 'bg-yellow-500',
    actions: ['Review details', 'Verify documents', 'Add comments'],
  },
  {
    id: 'authorizer',
    title: 'Authorizer',
    description: 'Final client approval before GIS processing',
    role: 'Client Authorizer',
    icon: Shield,
    color: 'bg-purple-500',
    actions: ['Final approval', 'Authorize submission', 'Confirm details'],
  },
  {
    id: 'gis',
    title: 'GIS Processor',
    description: 'UBA GIS team processes the instruction',
    role: 'GIS Processor',
    icon: GitBranch,
    color: 'bg-green-500',
    actions: ['Process instruction', 'Callback verification', 'Approve/Reject/Return'],
  },
];

export default function WorkflowPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { instructions, fetchInstructions } = useInstructionsStore();
  const [activeStep, setActiveStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchInstructions();
  }, [fetchInstructions]);

  const getInstructionsForStep = (stepId: string) => {
    const statusMap: Record<string, string[]> = {
      maker: ['draft'],
      verifier: ['submitted'],
      authorizer: ['under_review'],
      gis: ['callback_verification', 'approved', 'rejected', 'completed'],
    };
    return instructions.filter(i => statusMap[stepId]?.includes(i.status));
  };

  return (
    <div className={cn("space-y-6", mounted && "animate-in fade-in duration-500")}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Workflow Visualization</h1>
        <p className="text-white/50 mt-1">
          Understand the instruction approval process
        </p>
      </div>

      {/* Workflow Diagram */}
      <Card className="bg-[#1A1A1A] border-white/10 overflow-hidden">
        <CardContent className="p-8">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-16 left-0 right-0 h-1 bg-white/10 hidden lg:block" />
            
            {/* Steps */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {workflowSteps.map((step, index) => {
                const stepInstructions = getInstructionsForStep(step.id);
                const isActive = activeStep === index;
                
                return (
                  <div 
                    key={step.id}
                    className="relative"
                    onMouseEnter={() => setActiveStep(index)}
                  >
                    {/* Connector Arrow */}
                    {index < workflowSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-12 -right-4 z-10">
                        <ArrowRight className="w-6 h-6 text-white/30" />
                      </div>
                    )}

                    {/* Step Card */}
                    <div className={cn(
                      "bg-white/5 rounded-xl p-6 border-2 transition-all duration-300 cursor-pointer",
                      isActive ? "border-[#D92027] bg-[#D92027]/5" : "border-transparent hover:border-white/20"
                    )}>
                      {/* Icon */}
                      <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto transition-transform",
                        step.color,
                        isActive && "scale-110"
                      )}>
                        <step.icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Content */}
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                        <Badge variant="outline" className="mb-3 text-white/70 border-white/20">
                          {step.role}
                        </Badge>
                        <p className="text-sm text-white/50 mb-4">{step.description}</p>

                        {/* Actions */}
                        <div className="space-y-1">
                          {step.actions.map((action) => (
                            <div key={action} className="flex items-center justify-center gap-2 text-xs text-white/40">
                              <CheckCircle className="w-3 h-3" />
                              {action}
                            </div>
                          ))}
                        </div>

                        {/* Pending Count */}
                        {stepInstructions.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-sm">
                              <span className="text-[#D92027] font-semibold">{stepInstructions.length}</span>
                              <span className="text-white/50"> pending</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Instructions Awaiting Your Action</CardTitle>
            <CardDescription className="text-white/50">
              Instructions that require your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {instructions
                .filter(i => {
                  if (user?.role === 'verifier') return i.status === 'submitted';
                  if (user?.role === 'authorizer') return i.status === 'under_review';
                  if (user?.role === 'gis_processor') return i.status === 'callback_verification';
                  return false;
                })
                .slice(0, 5)
                .map((instruction) => (
                  <div
                    key={instruction.id}
                    onClick={() => navigate(`/instructions/${instruction.id}`)}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#D92027]" />
                      <div>
                        <p className="font-medium text-white">{instruction.instructionId}</p>
                        <p className="text-sm text-white/50">
                          {instruction.type.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                      Action Required
                    </Badge>
                  </div>
                ))}
              
              {instructions.filter(i => {
                if (user?.role === 'verifier') return i.status === 'submitted';
                if (user?.role === 'authorizer') return i.status === 'under_review';
                if (user?.role === 'gis_processor') return i.status === 'callback_verification';
                return false;
              }).length === 0 && (
                <div className="text-center py-8 text-white/50">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No pending actions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Workflow Statistics</CardTitle>
            <CardDescription className="text-white/50">
              Overview of instruction flow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflowSteps.map((step) => {
                const count = getInstructionsForStep(step.id).length;
                const percentage = instructions.length > 0 
                  ? Math.round((count / instructions.length) * 100) 
                  : 0;
                
                return (
                  <div key={step.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", step.color)} />
                        <span className="text-sm text-white">{step.title}</span>
                      </div>
                      <span className="text-sm text-white/50">{count} instructions</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", step.color)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

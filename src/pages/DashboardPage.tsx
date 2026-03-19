import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  PhoneCall,
  TrendingUp,
  ArrowRight,
  Activity
} from 'lucide-react';
import { useAuthStore, useDashboardStore, useInstructionsStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  submitted: 'bg-blue-500',
  under_review: 'bg-yellow-500',
  callback_verification: 'bg-orange-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  completed: 'bg-emerald-500',
  returned: 'bg-purple-500',
};

const COLORS = ['#D92027', '#28A745', '#FFC107', '#6C757D', '#17A2B8'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { metrics, isLoading, fetchMetrics } = useDashboardStore();
  const { instructions } = useInstructionsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchMetrics();
  }, [fetchMetrics]);

  const statsCards = [
    {
      title: 'Total Instructions',
      value: metrics?.totalInstructions || 0,
      icon: FileText,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'Pending Approval',
      value: metrics?.pendingApproval || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      trend: '+5%',
    },
    {
      title: 'Approved',
      value: metrics?.approvedInstructions || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      trend: '+18%',
    },
    {
      title: 'Rejected',
      value: metrics?.rejectedInstructions || 0,
      icon: XCircle,
      color: 'bg-red-500',
      trend: '-3%',
    },
    {
      title: 'Callback Pending',
      value: metrics?.callbackPending || 0,
      icon: PhoneCall,
      color: 'bg-orange-500',
      trend: '+2%',
    },
    {
      title: 'Completed',
      value: metrics?.completedInstructions || 0,
      icon: Activity,
      color: 'bg-emerald-500',
      trend: '+24%',
    },
  ];

  const recentInstructions = instructions.slice(0, 5);

  return (
    <div className={cn("space-y-6", mounted && "animate-in fade-in duration-500")}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white/50 mt-1">
            Welcome back, <span className="text-[#D92027]">{user?.name}</span>
          </p>
        </div>
        <div className="flex gap-3">
          {user?.role === 'maker' && (
            <Button 
              onClick={() => navigate('/instructions/new')}
              className="bg-[#D92027] hover:bg-[#B51C22] text-white"
            >
              New Instruction
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => navigate('/instructions')}
            className="border-white/10 text-white hover:bg-white/10"
          >
            View All
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((stat, index) => (
          <Card 
            key={stat.title}
            className="bg-[#1A1A1A] border-white/10 hover:border-[#D92027]/30 transition-all duration-300 group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className={cn("p-2 rounded-lg", stat.color, "bg-opacity-20")}>
                  <stat.icon className={cn("w-5 h-5", stat.color.replace('bg-', 'text-'))} />
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  stat.trend.startsWith('+') ? "text-green-500" : "text-red-500"
                )}>
                  {stat.trend}
                </span>
              </div>
              <div className="mt-3">
                {isLoading ? (
                  <Skeleton className="h-8 w-16 bg-white/10" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                )}
                <p className="text-sm text-white/50 mt-1">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#D92027]" />
              Monthly Trend
            </CardTitle>
            <CardDescription className="text-white/50">
              Instructions submitted vs completed over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-[250px] w-full bg-white/10" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics?.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1A1A1A', 
                        border: '1px solid #333',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="submitted" 
                      stroke="#D92027" 
                      strokeWidth={2}
                      name="Submitted"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#28A745" 
                      strokeWidth={2}
                      name="Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions by Type */}
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#D92027]" />
              Instructions by Type
            </CardTitle>
            <CardDescription className="text-white/50">
              Distribution across different instruction types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-[250px] w-full bg-white/10 rounded-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics?.instructionsByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="type"
                    >
                      {metrics?.instructionsByType.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1A1A1A', 
                        border: '1px solid #333',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Instructions & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Instructions */}
        <Card className="bg-[#1A1A1A] border-white/10 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Recent Instructions</CardTitle>
              <CardDescription className="text-white/50">
                Latest instruction submissions
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/instructions')}
              className="text-[#D92027] hover:text-[#D92027] hover:bg-[#D92027]/10"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInstructions.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No instructions yet</p>
                </div>
              ) : (
                recentInstructions.map((instruction: typeof recentInstructions[0]) => (
                  <div
                    key={instruction.id}
                    onClick={() => navigate(`/instructions/${instruction.id}`)}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        statusColors[instruction.status]
                      )}>
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white group-hover:text-[#D92027] transition-colors">
                          {instruction.instructionId}
                        </p>
                        <p className="text-sm text-white/50">
                          {instruction.type.replace('_', ' ').toUpperCase()} • {instruction.currency} {instruction.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "capitalize",
                          instruction.status === 'approved' && "border-green-500 text-green-500",
                          instruction.status === 'rejected' && "border-red-500 text-red-500",
                          instruction.status === 'submitted' && "border-yellow-500 text-yellow-500",
                        )}
                      >
                        {instruction.status.replace('_', ' ')}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Status Breakdown</CardTitle>
            <CardDescription className="text-white/50">
              Instructions by current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {isLoading ? (
                <Skeleton className="h-full w-full bg-white/10" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics?.instructionsByStatus} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                    <XAxis type="number" stroke="#666" />
                    <YAxis dataKey="status" type="category" stroke="#666" width={100} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1A1A1A', 
                        border: '1px solid #333',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="#D92027" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

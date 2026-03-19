import { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar,
  FileText,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { useDashboardStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
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
  Legend
} from 'recharts';

const COLORS = ['#D92027', '#28A745', '#FFC107', '#6C757D', '#17A2B8', '#6610F2'];

export default function ReportsPage() {
  const { metrics, isLoading, fetchMetrics } = useDashboardStore();
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('summary');

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleExport = (format: 'csv' | 'excel') => {
    // Simulate export
    toast.success(`Report exported as ${format.toUpperCase()}`);
  };

  const reportTypes = [
    { value: 'summary', label: 'Summary Report', icon: FileText },
    { value: 'trend', label: 'Trend Analysis', icon: TrendingUp },
    { value: 'breakdown', label: 'Status Breakdown', icon: PieChartIcon },
    { value: 'performance', label: 'Performance Metrics', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-white/50 mt-1">
            Generate and export system reports
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => handleExport('csv')}
            className="border-white/10 text-white hover:bg-white/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={() => handleExport('excel')}
            className="bg-[#D92027] hover:bg-[#B51C22] text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-[#1A1A1A] border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full sm:w-[250px] bg-white/5 border-white/10 text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-white/10">
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-[200px] bg-white/5 border-white/10 text-white">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-white/10">
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 bg-white/10" />
                ) : (
                  <p className="text-2xl font-bold text-white">{metrics?.totalInstructions || 0}</p>
                )}
                <p className="text-sm text-white/50">Total Instructions</p>
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
                {isLoading ? (
                  <Skeleton className="h-8 w-16 bg-white/10" />
                ) : (
                  <p className="text-2xl font-bold text-green-500">{metrics?.completedInstructions || 0}</p>
                )}
                <p className="text-sm text-white/50">Completed</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 bg-white/10" />
                ) : (
                  <p className="text-2xl font-bold text-yellow-500">{metrics?.pendingApproval || 0}</p>
                )}
                <p className="text-sm text-white/50">Pending</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 bg-white/10" />
                ) : (
                  <p className="text-2xl font-bold text-red-500">{metrics?.rejectedInstructions || 0}</p>
                )}
                <p className="text-sm text-white/50">Rejected</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Monthly Trend</CardTitle>
            <CardDescription className="text-white/50">
              Instructions submitted vs completed over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoading ? (
                <Skeleton className="h-full w-full bg-white/10" />
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
            <CardTitle className="text-white">Instructions by Type</CardTitle>
            <CardDescription className="text-white/50">
              Distribution across different instruction types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoading ? (
                <Skeleton className="h-full w-full bg-white/10 rounded-full" />
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

      {/* Status Breakdown */}
      <Card className="bg-[#1A1A1A] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Status Breakdown</CardTitle>
          <CardDescription className="text-white/50">
            Instructions by current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {isLoading ? (
              <Skeleton className="h-full w-full bg-white/10" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.instructionsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="status" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1A1A1A', 
                      border: '1px solid #333',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="#D92027" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card className="bg-[#1A1A1A] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Report Templates</CardTitle>
          <CardDescription className="text-white/50">
            Pre-built report templates for quick generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((report) => (
              <div
                key={report.value}
                className={cn(
                  "p-4 rounded-lg border-2 cursor-pointer transition-all",
                  reportType === report.value
                    ? "border-[#D92027] bg-[#D92027]/5"
                    : "border-white/10 hover:border-white/30 bg-white/5"
                )}
                onClick={() => setReportType(report.value)}
              >
                <report.icon className={cn(
                  "w-8 h-8 mb-3",
                  reportType === report.value ? "text-[#D92027]" : "text-white/50"
                )} />
                <h3 className="font-semibold text-white">{report.label}</h3>
                <p className="text-sm text-white/50 mt-1">
                  Generate {report.label.toLowerCase()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

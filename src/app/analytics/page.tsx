'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Users, 
  Target, 
  Activity, 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Settings,
  MoreVertical
} from 'lucide-react';
import Header from '@/components/oxlas/Header';
import Sidebar from '@/components/oxlas/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  type: string;
  summary: any;
  breakdown?: any;
  trends?: any;
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface DashboardWidget {
  id: string;
  name: string;
  type: string;
  widgetType: string;
  title: string;
  description?: string;
  config: any;
  position: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('task_completion');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [isCreateWidgetOpen, setIsCreateWidgetOpen] = useState(false);
  const [newWidget, setNewWidget] = useState({
    name: '',
    type: 'chart',
    widgetType: 'line_chart',
    title: '',
    description: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
    fetchDashboardWidgets();
  }, [selectedType, selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/analytics?type=${selectedType}&period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch analytics data',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardWidgets = async () => {
    try {
      const response = await fetch('/api/dashboard/widgets');
      if (response.ok) {
        const data = await response.json();
        setDashboardWidgets(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard widgets:', error);
    }
  };

  const createWidget = async () => {
    try {
      const response = await fetch('/api/dashboard/widgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWidget),
      });

      if (response.ok) {
        const createdWidget = await response.json();
        setDashboardWidgets([...dashboardWidgets, createdWidget]);
        setNewWidget({
          name: '',
          type: 'chart',
          widgetType: 'line_chart',
          title: '',
          description: '',
        });
        setIsCreateWidgetOpen(false);
        toast({
          title: 'Success',
          description: 'Widget created successfully',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to create widget',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create widget',
        variant: 'destructive',
      });
    }
  };

  const getAnalyticsIcon = (type: string) => {
    switch (type) {
      case 'task_completion':
        return <Target className="h-5 w-5" />;
      case 'team_productivity':
        return <Users className="h-5 w-5" />;
      case 'project_progress':
        return <BarChart3 className="h-5 w-5" />;
      case 'user_activity':
        return <Activity className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getAnalyticsTitle = (type: string) => {
    switch (type) {
      case 'task_completion':
        return 'Task Completion Analytics';
      case 'team_productivity':
        return 'Team Productivity Analytics';
      case 'project_progress':
        return 'Project Progress Analytics';
      case 'user_activity':
        return 'User Activity Analytics';
      default:
        return 'Analytics Dashboard';
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar className="hidden lg:flex" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 oxlas-main">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="hidden lg:flex" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 oxlas-main">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Track performance and productivity metrics</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select analytics type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task_completion">Task Completion</SelectItem>
                  <SelectItem value="team_productivity">Team Productivity</SelectItem>
                  <SelectItem value="project_progress">Project Progress</SelectItem>
                  <SelectItem value="user_activity">User Activity</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={fetchAnalyticsData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Dialog open={isCreateWidgetOpen} onOpenChange={setIsCreateWidgetOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Widget
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Dashboard Widget</DialogTitle>
                    <DialogDescription>
                      Add a new widget to your analytics dashboard.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Widget Name</Label>
                      <Input
                        id="name"
                        value={newWidget.name}
                        onChange={(e) => setNewWidget({ ...newWidget, name: e.target.value })}
                        placeholder="Enter widget name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="title">Widget Title</Label>
                      <Input
                        id="title"
                        value={newWidget.title}
                        onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
                        placeholder="Enter widget title"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="type">Widget Type</Label>
                        <Select value={newWidget.type} onValueChange={(value) => setNewWidget({ ...newWidget, type: value as any })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="chart">Chart</SelectItem>
                            <SelectItem value="metric">Metric</SelectItem>
                            <SelectItem value="table">Table</SelectItem>
                            <SelectItem value="list">List</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="widgetType">Chart Type</Label>
                        <Select value={newWidget.widgetType} onValueChange={(value) => setNewWidget({ ...newWidget, widgetType: value as any })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="line_chart">Line Chart</SelectItem>
                            <SelectItem value="bar_chart">Bar Chart</SelectItem>
                            <SelectItem value="pie_chart">Pie Chart</SelectItem>
                            <SelectItem value="metric_card">Metric Card</SelectItem>
                            <SelectItem value="data_table">Data Table</SelectItem>
                            <SelectItem value="activity_list">Activity List</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newWidget.description}
                        onChange={(e) => setNewWidget({ ...newWidget, description: e.target.value })}
                        placeholder="Enter widget description"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={createWidget} disabled={!newWidget.name.trim() || !newWidget.title.trim()}>
                      Create Widget
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Summary Cards */}
          {analyticsData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Object.entries(analyticsData.summary).map(([key, value]: [string, any]) => {
                if (typeof value === 'number' && key !== 'totalTeams') {
                  return (
                    <Card key={key}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </CardTitle>
                        {getAnalyticsIcon(selectedType)}
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {key.includes('Rate') || key.includes('Score') || key.includes('efficiency') 
                            ? formatPercentage(value) 
                            : formatNumber(value)
                          }
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {selectedPeriod} overview
                        </p>
                      </CardContent>
                    </Card>
                  );
                }
                return null;
              })}
            </div>
          )}

          {/* Main Analytics Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="widgets">Custom Widgets</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getAnalyticsIcon(selectedType)}
                    <span>{getAnalyticsTitle(selectedType)}</span>
                  </CardTitle>
                  <CardDescription>
                    {analyticsData?.period} analytics from {new Date(analyticsData?.dateRange.start).toLocaleDateString()} to {new Date(analyticsData?.dateRange.end).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart Placeholder */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Performance Chart</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                          <div className="text-center">
                            <LineChart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Interactive chart will be rendered here</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Key Metrics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Key Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {analyticsData && Object.entries(analyticsData.summary).map(([key, value]: [string, any]) => {
                            if (typeof value === 'number') {
                              return (
                                <div key={key} className="flex items-center justify-between">
                                  <span className="text-sm font-medium capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </span>
                                  <Badge variant="secondary">
                                    {key.includes('Rate') || key.includes('Score') || key.includes('efficiency') 
                                      ? formatPercentage(value) 
                                      : formatNumber(value)
                                    }
                                  </Badge>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trends Analysis</CardTitle>
                  <CardDescription>Historical data trends and patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">Trend Analysis Chart</p>
                      <p className="text-sm text-muted-foreground">
                        Interactive trend visualization will be displayed here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-6">
              {analyticsData?.breakdown && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.entries(analyticsData.breakdown).map(([breakdownType, data]: [string, any]) => (
                    <Card key={breakdownType}>
                      <CardHeader>
                        <CardTitle className="text-lg capitalize">
                          {breakdownType.replace(/([A-Z])/g, ' $1').trim()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Array.isArray(data) && data.map((item: any) => (
                            <div key={item[Object.keys(item)[0]]} className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                {item[Object.keys(item)[0]]}
                              </span>
                              <Badge variant="outline">
                                {item._count?.[Object.keys(item)[0]] || 0}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="widgets" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Custom Dashboard Widgets</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your personalized analytics widgets
                  </p>
                </div>
                <Dialog open={isCreateWidgetOpen} onOpenChange={setIsCreateWidgetOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Widget
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Dashboard Widget</DialogTitle>
                      <DialogDescription>
                        Add a new widget to your analytics dashboard.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Widget Name</Label>
                        <Input
                          id="name"
                          value={newWidget.name}
                          onChange={(e) => setNewWidget({ ...newWidget, name: e.target.value })}
                          placeholder="Enter widget name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="title">Widget Title</Label>
                        <Input
                          id="title"
                          value={newWidget.title}
                          onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
                          placeholder="Enter widget title"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="type">Widget Type</Label>
                          <Select value={newWidget.type} onValueChange={(value) => setNewWidget({ ...newWidget, type: value as any })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="chart">Chart</SelectItem>
                              <SelectItem value="metric">Metric</SelectItem>
                              <SelectItem value="table">Table</SelectItem>
                              <SelectItem value="list">List</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="widgetType">Chart Type</Label>
                          <Select value={newWidget.widgetType} onValueChange={(value) => setNewWidget({ ...newWidget, widgetType: value as any })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="line_chart">Line Chart</SelectItem>
                              <SelectItem value="bar_chart">Bar Chart</SelectItem>
                              <SelectItem value="pie_chart">Pie Chart</SelectItem>
                              <SelectItem value="metric_card">Metric Card</SelectItem>
                              <SelectItem value="data_table">Data Table</SelectItem>
                              <SelectItem value="activity_list">Activity List</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newWidget.description}
                          onChange={(e) => setNewWidget({ ...newWidget, description: e.target.value })}
                          placeholder="Enter widget description"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={createWidget} disabled={!newWidget.name.trim() || !newWidget.title.trim()}>
                        Create Widget
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {dashboardWidgets.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No widgets found</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Create your first widget to customize your analytics dashboard.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardWidgets.map((widget) => (
                    <Card key={widget.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{widget.title}</CardTitle>
                            <CardDescription className="text-sm">
                              {widget.widgetType.replace(/_/g, ' ')}
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-32 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg mb-4">
                          <div className="text-center">
                            {widget.widgetType === 'line_chart' && <LineChart className="h-8 w-8 mx-auto text-muted-foreground mb-1" />}
                            {widget.widgetType === 'bar_chart' && <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground mb-1" />}
                            {widget.widgetType === 'pie_chart' && <PieChart className="h-8 w-8 mx-auto text-muted-foreground mb-1" />}
                            {widget.widgetType === 'metric_card' && <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-1" />}
                            <p className="text-xs text-muted-foreground">Widget preview</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Position: {widget.position}</span>
                          <Badge variant={widget.isVisible ? "default" : "secondary"}>
                            {widget.isVisible ? "Visible" : "Hidden"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
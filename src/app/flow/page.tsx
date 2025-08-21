'use client';

import { useState, useEffect } from 'react';
import { Plus, Play, Pause, Trash2, Edit, Clock, CheckCircle, XCircle, AlertCircle, Settings, Zap } from 'lucide-react';
import Header from '@/components/oxlas/Header';
import Sidebar from '@/components/oxlas/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Automation {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger: {
    type: string;
    condition: Record<string, any>;
  };
  actions: Array<{
    type: string;
    config: Record<string, any>;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Execution {
  id: string;
  automationId: string;
  triggerData?: any;
  actionResults: any[];
  status: 'success' | 'failed' | 'running' | 'skipped';
  error?: string;
  executedAt: string;
}

export default function FlowPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  useEffect(() => {
    loadAutomations();
    loadExecutions();
  }, []);

  const loadAutomations = async () => {
    try {
      const response = await fetch('/api/automations');
      if (response.ok) {
        const data = await response.json();
        setAutomations(data.automations || []);
      }
    } catch (error) {
      console.error('Failed to load automations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExecutions = async () => {
    try {
      const response = await fetch('/api/automations/executions/recent');
      if (response.ok) {
        const data = await response.json();
        setExecutions(data.executions || []);
      }
    } catch (error) {
      console.error('Failed to load executions:', error);
    }
  };

  const handleToggleAutomation = async (automation: Automation) => {
    try {
      const response = await fetch(`/api/automations/${automation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...automation, enabled: !automation.enabled }),
      });

      if (response.ok) {
        await loadAutomations();
      }
    } catch (error) {
      console.error('Failed to toggle automation:', error);
    }
  };

  const handleDeleteAutomation = async (automation: Automation) => {
    if (!confirm(`Are you sure you want to delete "${automation.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/automations/${automation.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadAutomations();
      }
    } catch (error) {
      console.error('Failed to delete automation:', error);
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'schedule': return '⏰';
      case 'webhook': return '🔗';
      case 'interval': return '🔄';
      default: return '⚡';
    }
  };

  const getTriggerLabel = (type: string) => {
    switch (type) {
      case 'schedule': return 'Schedule';
      case 'webhook': return 'Webhook';
      case 'interval': return 'Interval';
      default: return type;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'skipped': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'skipped': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Oxlas Flow" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Oxlas Flow</h1>
                <p className="text-muted-foreground">
                  No-code automation engine for your workspace
                </p>
              </div>
              <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Automation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Automation</DialogTitle>
                    <DialogDescription>
                      Build your automation workflow by configuring triggers and actions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Automation builder coming soon!</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Automations</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{automations.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {automations.filter(a => a.enabled).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Executions</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{executions.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {executions.length > 0 
                      ? Math.round((executions.filter(e => e.status === 'success').length / executions.length) * 100)
                      : 0}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="automations" className="space-y-4">
              <TabsList>
                <TabsTrigger value="automations">Automations</TabsTrigger>
                <TabsTrigger value="executions">Recent Executions</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>

              <TabsContent value="automations" className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading automations...</p>
                  </div>
                ) : automations.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No automations yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first automation to get started with Oxlas Flow
                      </p>
                      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Automation
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Create Automation</DialogTitle>
                            <DialogDescription>
                              Build your automation workflow by configuring triggers and actions
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="text-center py-8">
                              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">Automation builder coming soon!</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {automations.map((automation) => (
                      <Card key={automation.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getTriggerIcon(automation.trigger.type)}</span>
                                <div>
                                  <CardTitle className="text-lg">{automation.name}</CardTitle>
                                  <CardDescription>{automation.description}</CardDescription>
                                </div>
                              </div>
                              <Badge variant={automation.enabled ? "default" : "secondary"}>
                                {automation.enabled ? "Enabled" : "Disabled"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleAutomation(automation)}
                              >
                                {automation.enabled ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsBuilderOpen(true)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAutomation(automation)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Trigger:</span>
                                <Badge variant="outline">
                                  {getTriggerLabel(automation.trigger.type)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Actions:</span>
                                <Badge variant="outline">
                                  {automation.actions.length} actions
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="executions" className="space-y-4">
                {executions.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No executions yet</h3>
                      <p className="text-muted-foreground">
                        Executions will appear here when your automations run
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {executions.map((execution) => (
                      <Card key={execution.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {getStatusIcon(execution.status)}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Automation ID:</span>
                                  <code className="text-sm bg-muted px-2 py-1 rounded">
                                    {execution.automationId}
                                  </code>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {formatTime(execution.executedAt)}
                                </p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(execution.status)}>
                              {execution.status}
                            </Badge>
                          </div>
                          {execution.error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-800">{execution.error}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="templates" className="space-y-4">
                <Card>
                  <CardContent className="text-center py-12">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Templates Coming Soon</h3>
                    <p className="text-muted-foreground">
                      Pre-built automation templates will be available here
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
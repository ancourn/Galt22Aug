'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Plus, 
  Search, 
  BarChart3, 
  Users, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  responses: number;
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
  updatedAt: string;
  author: string;
}

interface FormResponse {
  id: string;
  formId: string;
  submittedAt: string;
  data: Record<string, any>;
  submitter: string;
}

export default function FormsPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [newForm, setNewForm] = useState({
    title: '',
    description: '',
    fields: [] as FormField[]
  });
  const [formResponses, setFormResponses] = useState<{ [key: string]: FormResponse[] }>({});

  // Mock forms data
  const forms: Form[] = [
    {
      id: '1',
      title: 'Project Feedback Survey',
      description: 'Collect feedback on project progress and team satisfaction',
      fields: [
        { id: '1', type: 'text', label: 'Project Name', required: true, placeholder: 'Enter project name' },
        { id: '2', type: 'select', label: 'Overall Satisfaction', required: true, options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'] },
        { id: '3', type: 'textarea', label: 'Comments', required: false, placeholder: 'Any additional feedback...' }
      ],
      responses: 15,
      status: 'published',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      author: 'Admin'
    },
    {
      id: '2',
      title: 'Team Meeting Agenda',
      description: 'Submit agenda items for upcoming team meetings',
      fields: [
        { id: '1', type: 'text', label: 'Agenda Item', required: true, placeholder: 'What would you like to discuss?' },
        { id: '2', type: 'select', label: 'Priority', required: true, options: ['High', 'Medium', 'Low'] },
        { id: '3', type: 'textarea', label: 'Description', required: true, placeholder: 'Provide details about this agenda item' }
      ],
      responses: 8,
      status: 'published',
      createdAt: '2024-01-16T09:00:00Z',
      updatedAt: '2024-01-22T11:15:00Z',
      author: 'Admin'
    },
    {
      id: '3',
      title: 'Bug Report Form',
      description: 'Report bugs and issues encountered during development',
      fields: [
        { id: '1', type: 'text', label: 'Bug Title', required: true, placeholder: 'Brief description of the bug' },
        { id: '2', type: 'select', label: 'Severity', required: true, options: ['Critical', 'High', 'Medium', 'Low'] },
        { id: '3', type: 'textarea', label: 'Steps to Reproduce', required: true, placeholder: 'Describe how to reproduce the bug' },
        { id: '4', type: 'textarea', label: 'Expected Behavior', required: true, placeholder: 'What should have happened?' }
      ],
      responses: 3,
      status: 'published',
      createdAt: '2024-01-17T13:00:00Z',
      updatedAt: '2024-01-21T16:45:00Z',
      author: 'Admin'
    },
    {
      id: '4',
      title: 'Employee Satisfaction Survey',
      description: 'Annual employee satisfaction and engagement survey',
      fields: [
        { id: '1', type: 'radio', label: 'Overall Job Satisfaction', required: true, options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'] },
        { id: '2', type: 'checkbox', label: 'What do you value most?', required: true, options: ['Work-Life Balance', 'Career Growth', 'Compensation', 'Team Culture', 'Management'] },
        { id: '3', type: 'textarea', label: 'Suggestions for Improvement', required: false, placeholder: 'Any suggestions for making the workplace better?' }
      ],
      responses: 0,
      status: 'draft',
      createdAt: '2024-01-18T15:00:00Z',
      updatedAt: '2024-01-19T10:20:00Z',
      author: 'Admin'
    }
  ];

  // Mock form responses
  const mockResponses: FormResponse[] = [
    {
      id: '1',
      formId: '1',
      submittedAt: '2024-01-22T10:30:00Z',
      data: {
        'Project Name': 'AI-Powered Workspace',
        'Overall Satisfaction': 'Very Satisfied',
        'Comments': 'Great project, love the AI features!'
      },
      submitter: 'Alice Johnson'
    },
    {
      id: '2',
      formId: '1',
      submittedAt: '2024-01-22T11:15:00Z',
      data: {
        'Project Name': 'Knowledge Graph Implementation',
        'Overall Satisfaction': 'Satisfied',
        'Comments': 'Good progress, would like more documentation'
      },
      submitter: 'Bob Smith'
    }
  ];

  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateForm = () => {
    if (newForm.title && newForm.description) {
      // In a real app, this would call an API to create the form
      console.log('Creating form:', newForm);
      setIsCreateFormOpen(false);
      setNewForm({ title: '', description: '', fields: [] });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'closed':
        return <Badge className="bg-red-100 text-red-800">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'closed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forms & Surveys</h1>
          <p className="text-muted-foreground">
            Create and manage forms, surveys, and collect responses
          </p>
        </div>
        <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Form
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Form</DialogTitle>
              <DialogDescription>
                Create a new form or survey to collect responses
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Form Title</label>
                <Input
                  placeholder="Enter form title..."
                  value={newForm.title}
                  onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe what this form is for..."
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateForm} disabled={!newForm.title || !newForm.description}>
                  Create Form
                </Button>
                <Button variant="outline" onClick={() => setIsCreateFormOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search forms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Forms</p>
                <p className="text-2xl font-bold">{forms.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{forms.filter(f => f.status === 'published').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                <p className="text-2xl font-bold">{forms.reduce((sum, form) => sum + form.responses, 0)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Responses</p>
                <p className="text-2xl font-bold">
                  {Math.round(forms.reduce((sum, form) => sum + form.responses, 0) / forms.length)}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forms Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredForms.map((form) => (
          <Card key={form.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {form.title}
                    {getStatusIcon(form.status)}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {form.description}
                  </CardDescription>
                </div>
                {getStatusBadge(form.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Fields</span>
                  <span>{form.fields.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Responses</span>
                  <span>{form.responses}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="flex-1">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Results
                  </Button>
                  <Button size="sm" variant="outline">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredForms.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No forms found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No forms match your search query.' : 'Get started by creating your first form.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Form
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Search, Plus, Edit, Eye, Calendar, User } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface WikiPage {
  id: string;
  title: string;
  content: string;
  path: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export default function WikiPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPage, setNewPage] = useState({
    title: '',
    content: '',
    path: '',
    tags: [] as string[]
  });

  // Mock wiki pages data
  const wikiPages: WikiPage[] = [
    {
      id: '1',
      title: 'Getting Started',
      content: 'Welcome to the Oxx AI-Powered Workspace! This guide will help you get started with all the features and capabilities of our platform.',
      path: '/getting-started',
      author: 'System',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      tags: ['guide', 'introduction', 'basics']
    },
    {
      id: '2',
      title: 'Project Management',
      content: 'Learn how to effectively manage your projects using the Oxx workspace. Create projects, track progress, and collaborate with your team.',
      path: '/project-management',
      author: 'Admin',
      createdAt: '2024-01-16T09:00:00Z',
      updatedAt: '2024-01-22T11:15:00Z',
      tags: ['projects', 'management', 'collaboration']
    },
    {
      id: '3',
      title: 'AI Assistant Features',
      content: 'Discover the power of AI in your workspace. Learn about content generation, summarization, task creation, and intelligent recommendations.',
      path: '/ai-features',
      author: 'Admin',
      createdAt: '2024-01-17T13:00:00Z',
      updatedAt: '2024-01-21T16:45:00Z',
      tags: ['ai', 'assistant', 'features']
    },
    {
      id: '4',
      title: 'Knowledge Graph',
      content: 'Understand how the knowledge graph connects your content and provides intelligent recommendations across all modules.',
      path: '/knowledge-graph',
      author: 'System',
      createdAt: '2024-01-18T15:00:00Z',
      updatedAt: '2024-01-19T10:20:00Z',
      tags: ['knowledge-graph', 'ai', 'recommendations']
    },
    {
      id: '5',
      title: 'Automation Workflows',
      content: 'Set up automated workflows to streamline your work processes. Learn about triggers, actions, and creating custom automations.',
      path: '/automation',
      author: 'Admin',
      createdAt: '2024-01-19T11:00:00Z',
      updatedAt: '2024-01-23T09:30:00Z',
      tags: ['automation', 'workflows', 'efficiency']
    }
  ];

  const filteredPages = wikiPages.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreatePage = () => {
    if (newPage.title && newPage.content) {
      // In a real app, this would call an API to create the page
      console.log('Creating wiki page:', newPage);
      setIsCreateDialogOpen(false);
      setNewPage({ title: '', content: '', path: '', tags: [] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wiki</h1>
          <p className="text-muted-foreground">
            Documentation and knowledge base for your workspace
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Wiki Page</DialogTitle>
              <DialogDescription>
                Create a new documentation page for the wiki
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Enter page title..."
                  value={newPage.title}
                  onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Path</label>
                <Input
                  placeholder="/page-path"
                  value={newPage.path}
                  onChange={(e) => setNewPage({ ...newPage, path: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder="Write your documentation here..."
                  value={newPage.content}
                  onChange={(e) => setNewPage({ ...newPage, content: e.target.value })}
                  className="min-h-[200px]"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreatePage} disabled={!newPage.title || !newPage.content}>
                  Create Page
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
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
          placeholder="Search wiki pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pages</p>
                <p className="text-2xl font-bold">{wikiPages.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contributors</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-2xl font-bold">2d</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wiki Pages Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPages.map((page) => (
          <Card key={page.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{page.title}</CardTitle>
                  <CardDescription className="text-sm">
                    /wiki{page.path}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {session?.user?.role === 'admin' && (
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {page.content}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {page.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>By {page.author}</span>
                <span>
                  {new Date(page.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPages.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No wiki pages found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No pages match your search query.' : 'Get started by creating your first wiki page.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Page
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
'use client';

import Header from '@/components/oxlas/Header';
import Sidebar from '@/components/oxlas/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileEdit, Plus, Search, Star, Clock, Download, Share, MoreVertical, FileText, Image, File, Settings } from 'lucide-react';

export default function DocsPage() {
  const documents = [
    {
      id: 1,
      title: 'Q4 Financial Report',
      type: 'document',
      lastModified: '2 hours ago',
      modifiedBy: 'Sarah Johnson',
      size: '2.4 MB',
      starred: true,
      shared: true,
      status: 'published',
    },
    {
      id: 2,
      title: 'Product Requirements',
      type: 'document',
      lastModified: '1 day ago',
      modifiedBy: 'Michael Chen',
      size: '1.8 MB',
      starred: false,
      shared: true,
      status: 'draft',
    },
    {
      id: 3,
      title: 'Meeting Notes - Standup',
      type: 'note',
      lastModified: '3 hours ago',
      modifiedBy: 'Emily Rodriguez',
      size: '245 KB',
      starred: false,
      shared: false,
      status: 'published',
    },
    {
      id: 4,
      title: 'Design System Guidelines',
      type: 'document',
      lastModified: '2 days ago',
      modifiedBy: 'David Kim',
      size: '5.2 MB',
      starred: true,
      shared: true,
      status: 'published',
    },
    {
      id: 5,
      title: 'Project Timeline',
      type: 'spreadsheet',
      lastModified: '1 week ago',
      modifiedBy: 'Lisa Thompson',
      size: '890 KB',
      starred: false,
      shared: true,
      status: 'published',
    },
    {
      id: 6,
      title: 'User Research Report',
      type: 'document',
      lastModified: '3 days ago',
      modifiedBy: 'James Wilson',
      size: '3.6 MB',
      starred: true,
      shared: true,
      status: 'draft',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'document': return FileText;
      case 'note': return FileEdit;
      case 'spreadsheet': return File;
      case 'image': return Image;
      default: return FileText;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Docs" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Docs</h1>
                <p className="text-muted-foreground">
                  Create and manage documents with OnlyOffice integration
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Document
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Documents</CardTitle>
                  <FileText className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {documents.filter(d => d.type === 'document').length}
                  </div>
                  <p className="text-xs text-muted-foreground">documents</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Published</CardTitle>
                  <Star className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {documents.filter(d => d.status === 'published').length}
                  </div>
                  <p className="text-xs text-muted-foreground">published</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Shared</CardTitle>
                  <Share className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {documents.filter(d => d.shared).length}
                  </div>
                  <p className="text-xs text-muted-foreground">shared</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage</CardTitle>
                  <FileEdit className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">14.2 MB</div>
                  <p className="text-xs text-muted-foreground">total size</p>
                </CardContent>
              </Card>
            </div>

            {/* Document Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Create New</CardTitle>
                <CardDescription>
                  Choose a document template to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button variant="outline" className="h-32 flex flex-col gap-2">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <span className="font-medium">Blank Document</span>
                    <span className="text-xs text-muted-foreground">Start with a blank page</span>
                  </Button>
                  <Button variant="outline" className="h-32 flex flex-col gap-2">
                    <FileEdit className="h-8 w-8 text-green-600" />
                    <span className="font-medium">From Template</span>
                    <span className="text-xs text-muted-foreground">Use pre-designed templates</span>
                  </Button>
                  <Button variant="outline" className="h-32 flex flex-col gap-2">
                    <Download className="h-8 w-8 text-purple-600" />
                    <span className="font-medium">Import File</span>
                    <span className="text-xs text-muted-foreground">Upload existing documents</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search documents..."
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline">All</Button>
                    <Button variant="outline">Documents</Button>
                    <Button variant="outline">Notes</Button>
                    <Button variant="outline">Published</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
                <CardDescription>
                  Your recently edited documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {documents.map((doc) => {
                    const DocumentIcon = getDocumentIcon(doc.type);
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50"
                      >
                        <div className="p-2 rounded-lg bg-muted">
                          <DocumentIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{doc.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {doc.type}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${getStatusColor(doc.status)}`}>
                              {doc.status}
                            </Badge>
                            {doc.starred && (
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            )}
                            {doc.shared && (
                              <Share className="h-3 w-3 text-purple-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{doc.size}</span>
                            <span>Modified by {doc.modifiedBy}</span>
                            <span>{doc.lastModified}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Share className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* OnlyOffice Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileEdit className="h-5 w-5 text-green-600" />
                  OnlyOffice Integration
                </CardTitle>
                <CardDescription>
                  Document editing service status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">Service Online</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Connected to OnlyOffice Document Server
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
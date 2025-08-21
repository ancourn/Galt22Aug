'use client';

import Header from '@/components/oxlas/Header';
import Sidebar from '@/components/oxlas/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { HardDrive, Upload, Download, Share, Star, Clock, File, Image, FileText, Music, Video, Folder, FolderOpen, Search, Grid, List, Input } from 'lucide-react';

export default function DrivePage() {
  const files = [
    {
      id: 1,
      name: 'Q4 Financial Report.pdf',
      type: 'pdf',
      size: '2.4 MB',
      modified: '2 hours ago',
      starred: true,
      shared: true,
      icon: FileText,
    },
    {
      id: 2,
      name: 'Product Presentation.pptx',
      type: 'presentation',
      size: '5.8 MB',
      modified: '1 day ago',
      starred: false,
      shared: true,
      icon: FileText,
    },
    {
      id: 3,
      name: 'Team Photo.jpg',
      type: 'image',
      size: '3.2 MB',
      modified: '3 days ago',
      starred: true,
      shared: false,
      icon: Image,
    },
    {
      id: 4,
      name: 'Project Timeline.xlsx',
      type: 'spreadsheet',
      size: '1.2 MB',
      modified: '1 week ago',
      starred: false,
      shared: true,
      icon: FileText,
    },
    {
      id: 5,
      name: 'Demo Recording.mp4',
      type: 'video',
      size: '45.6 MB',
      modified: '2 weeks ago',
      starred: false,
      shared: true,
      icon: Video,
    },
    {
      id: 6,
      name: 'Background Music.mp3',
      type: 'audio',
      size: '4.8 MB',
      modified: '3 weeks ago',
      starred: false,
      shared: false,
      icon: Music,
    },
  ];

  const folders = [
    {
      id: 1,
      name: 'Documents',
      items: 24,
      size: '156 MB',
      modified: '1 day ago',
      icon: Folder,
    },
    {
      id: 2,
      name: 'Images',
      items: 142,
      size: '892 MB',
      modified: '3 days ago',
      icon: Folder,
    },
    {
      id: 3,
      name: 'Videos',
      items: 18,
      size: '2.4 GB',
      modified: '1 week ago',
      icon: Folder,
    },
    {
      id: 4,
      name: 'Audio',
      items: 67,
      size: '456 MB',
      modified: '2 weeks ago',
      icon: Folder,
    },
  ];

  const getFileColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'text-red-600';
      case 'image': return 'text-green-600';
      case 'video': return 'text-purple-600';
      case 'audio': return 'text-blue-600';
      case 'spreadsheet': return 'text-green-700';
      case 'presentation': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Drive" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Drive</h1>
                <p className="text-muted-foreground">
                  Manage your files and documents
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>

            {/* Storage Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Storage Overview</CardTitle>
                <CardDescription>
                  Your storage usage across different file types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Storage</span>
                      <span className="font-medium">7.2 GB / 15 GB</span>
                    </div>
                    <Progress value={48} className="h-2" />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Documents</span>
                        <span className="font-medium">2.1 GB</span>
                      </div>
                      <Progress value={30} className="h-1" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Images</span>
                        <span className="font-medium">3.8 GB</span>
                      </div>
                      <Progress value={53} className="h-1" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Videos</span>
                        <span className="font-medium">1.3 GB</span>
                      </div>
                      <Progress value={18} className="h-1" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Other</span>
                        <span className="font-medium">0.8 GB</span>
                      </div>
                      <Progress value={11} className="h-1" />
                    </div>
                  </div>
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
                      placeholder="Search files and folders..."
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Folders */}
            <Card>
              <CardHeader>
                <CardTitle>Folders</CardTitle>
                <CardDescription>
                  Organize your files in folders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className="p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <folder.icon className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-medium">{folder.name}</h3>
                          <p className="text-xs text-muted-foreground">{folder.items} items</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{folder.size}</span>
                        <span>{folder.modified}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Files */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Files</CardTitle>
                <CardDescription>
                  Your recently accessed files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50"
                    >
                      <div className="p-2 rounded-lg bg-muted">
                        <file.icon className={`h-6 w-6 ${getFileColor(file.type)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          {file.starred && (
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          )}
                          {file.shared && (
                            <Share className="h-3 w-3 text-blue-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{file.size}</span>
                          <span>{file.modified}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Share className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
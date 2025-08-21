'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/oxlas/Header';
import Sidebar from '@/components/oxlas/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Upload, 
  File, 
  FileText, 
  Image, 
  Download, 
  Share, 
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Filter,
  Tag,
  Calendar,
  User,
  Building,
  FolderOpen,
  CheckSquare,
  Star,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useDocuments } from '@/hooks/use-api';
import { useSocket } from '@/hooks/use-socket';

interface Document {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  status: 'uploading' | 'processing' | 'ready' | 'failed' | 'archived';
  visibility: 'private' | 'team' | 'public';
  userId: string;
  teamId?: string;
  projectId?: string;
  taskId?: string;
  tags?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  team?: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    title: string;
  };
  task?: {
    id: string;
    title: string;
  };
  analyses: Array<{
    id: string;
    type: string;
    createdAt: string;
  }>;
  versions: Array<{
    id: string;
    version: number;
    createdAt: string;
  }>;
}

export default function DocumentsPage() {
  const { data: documentsData, loading, refetch } = useDocuments();
  const documents = documentsData?.documents || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('document_processed', (data) => {
        console.log('Document processed:', data);
        refetch();
      });

      socket.on('document_shared', (data) => {
        console.log('Document shared:', data);
        refetch();
      });

      return () => {
        socket.off('document_processed');
        socket.off('document_shared');
      };
    }
  }, [socket, refetch]);

  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesVisibility = visibilityFilter === 'all' || doc.visibility === visibilityFilter;
    return matchesSearch && matchesStatus && matchesVisibility;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading': return Upload;
      case 'processing': return RefreshCw;
      case 'ready': return CheckCircle;
      case 'failed': return XCircle;
      case 'archived': return File;
      default: return File;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'private': return 'bg-red-100 text-red-800';
      case 'team': return 'bg-blue-100 text-blue-800';
      case 'public': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('word')) return FileText;
    if (mimeType.includes('excel')) return FileText;
    if (mimeType.includes('powerpoint')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadDialogOpen(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', selectedFile.name);
    formData.append('visibility', 'private');

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadProgress(100);
        setTimeout(() => {
          setUploadDialogOpen(false);
          setSelectedFile(null);
          setUploadProgress(0);
          setIsUploading(false);
          refetch();
        }, 1000);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setIsUploading(false);
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = ''; // The filename will be set by the Content-Disposition header
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const stats = {
    total: documents.length,
    uploading: documents.filter(d => d.status === 'uploading').length,
    processing: documents.filter(d => d.status === 'processing').length,
    ready: documents.filter(d => d.status === 'ready').length,
    failed: documents.filter(d => d.status === 'failed').length,
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Documents" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                <p className="text-muted-foreground">
                  Intelligent document management with AI-powered analysis
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                />
                <Button asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </label>
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                  <File className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">in your workspace</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Uploading</CardTitle>
                  <Upload className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.uploading}</div>
                  <p className="text-xs text-muted-foreground">in progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Processing</CardTitle>
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
                  <p className="text-xs text-muted-foreground">AI analysis</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ready</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
                  <p className="text-xs text-muted-foreground">processed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Failed</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                  <p className="text-xs text-muted-foreground">need attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search documents..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="uploading">Uploading</option>
                      <option value="processing">Processing</option>
                      <option value="ready">Ready</option>
                      <option value="failed">Failed</option>
                      <option value="archived">Archived</option>
                    </select>
                    <select
                      value={visibilityFilter}
                      onChange={(e) => setVisibilityFilter(e.target.value)}
                      className="px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="all">All Visibility</option>
                      <option value="private">Private</option>
                      <option value="team">Team</option>
                      <option value="public">Public</option>
                    </select>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading documents...</p>
                </div>
              ) : filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => {
                  const FileIcon = getFileIcon(doc.mimeType);
                  const StatusIcon = getStatusIcon(doc.status);
                  return (
                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <FileIcon className="h-5 w-5 text-muted-foreground" />
                              {doc.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {doc.description || 'No description available'}
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Status and Visibility */}
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${getStatusColor(doc.status)}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {doc.status}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${getVisibilityColor(doc.visibility)}`}>
                              {doc.visibility}
                            </Badge>
                          </div>

                          {/* File Info */}
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <File className="h-3 w-3" />
                              <span>{doc.originalName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>{formatFileSize(doc.fileSize)}</span>
                              <span>•</span>
                              <span>{doc.mimeType}</span>
                            </div>
                          </div>

                          {/* Meta Info */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{doc.user.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(doc.createdAt)}</span>
                            </div>
                          </div>

                          {/* Context Info */}
                          {(doc.team || doc.project || doc.task) && (
                            <div className="flex items-center gap-2 text-xs">
                              {doc.team && (
                                <div className="flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  <span>{doc.team.name}</span>
                                </div>
                              )}
                              {doc.project && (
                                <div className="flex items-center gap-1">
                                  <FolderOpen className="h-3 w-3" />
                                  <span>{doc.project.title}</span>
                                </div>
                              )}
                              {doc.task && (
                                <div className="flex items-center gap-1">
                                  <CheckSquare className="h-3 w-3" />
                                  <span>{doc.task.title}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-2">
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleDownload(doc.id)}
                              disabled={doc.status !== 'ready'}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                              <Share className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-8">
                  <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No documents found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'No documents match your search.' : 'Get started by uploading your first document.'}
                  </p>
                  <input
                    type="file"
                    id="file-upload-empty"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  />
                  <Button asChild>
                    <label htmlFor="file-upload-empty" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </label>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Upload Dialog */}
      {uploadDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                {selectedFile?.name} ({formatFileSize(selectedFile?.size || 0)})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex-1"
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUploadDialogOpen(false);
                      setSelectedFile(null);
                      setUploadProgress(0);
                    }}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
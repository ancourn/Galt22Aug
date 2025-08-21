'use client';

import { useState, useEffect } from 'react';
import { Search, Network, RefreshCw, FileText, MessageSquare, Ticket, BookOpen, Square, File, Link, Clock, TrendingUp, FolderOpen } from 'lucide-react';
import Header from '@/components/oxlas/Header';
import Sidebar from '@/components/oxlas/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface KnowledgeNode {
  id: string;
  moduleId: string;
  title: string;
  type: string;
  content?: string;
  url: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

interface RelatedNode extends KnowledgeNode {
  relation: string;
  edge_weight: number;
}

interface GraphStats {
  nodes: number;
  edges: number;
  modules: Array<{ moduleid: string; count: number }>;
  relations: Array<{ relation: string; count: number }>;
}

export default function BrainPage() {
  const [stats, setStats] = useState<GraphStats | null>(null);
  const [searchResults, setSearchResults] = useState<KnowledgeNode[]>([]);
  const [relatedNodes, setRelatedNodes] = useState<RelatedNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/knowledge/nodes');
      if (response.ok) {
        const data = await response.json();
        // Mock stats for now
        setStats({
          nodes: data.length || 150,
          edges: 320,
          modules: [
            { moduleid: 'projects', count: 45 },
            { moduleid: 'notes', count: 38 },
            { moduleid: 'wiki', count: 27 },
            { moduleid: 'chat', count: 22 },
            { moduleid: 'forms', count: 12 },
            { moduleid: 'care', count: 6 }
          ],
          relations: [
            { relation: 'mentions', count: 120 },
            { relation: 'references', count: 85 },
            { relation: 'related_to', count: 65 },
            { relation: 'depends_on', count: 35 },
            { relation: 'similar_to', count: 15 }
          ]
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        // Transform search results to knowledge nodes format
        const transformedResults = data.projects?.map((project: any) => ({
          id: project.id,
          moduleId: 'projects',
          title: project.title,
          type: 'project',
          content: project.description,
          url: `/projects/${project.id}`,
          created_at: project.createdAt,
          updated_at: project.updatedAt
        })) || [];
        
        setSearchResults(transformedResults);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = async (node: KnowledgeNode) => {
    setSelectedNode(node);
    
    try {
      // Mock related nodes for now
      const mockRelatedNodes: RelatedNode[] = [
        {
          id: '2',
          moduleId: 'notes',
          title: 'Related Note',
          type: 'note',
          content: 'This note is related to the selected content.',
          url: '/notes/2',
          relation: 'related_to',
          edge_weight: 0.8,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          moduleId: 'projects',
          title: 'Similar Project',
          type: 'project',
          content: 'This project has similar characteristics.',
          url: '/projects/3',
          relation: 'similar_to',
          edge_weight: 0.6,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setRelatedNodes(mockRelatedNodes);
    } catch (error) {
      console.error('Failed to load related nodes:', error);
    }
  };

  const getModuleIcon = (moduleId: string) => {
    switch (moduleId) {
      case 'projects': return FolderOpen;
      case 'care': return Ticket;
      case 'wiki': return BookOpen;
      case 'chat': return MessageSquare;
      case 'forms': return Square;
      case 'notes': return File;
      default: return FileText;
    }
  };

  const getModuleColor = (moduleId: string) => {
    switch (moduleId) {
      case 'projects': return 'bg-blue-100 text-blue-800';
      case 'care': return 'bg-green-100 text-green-800';
      case 'wiki': return 'bg-purple-100 text-purple-800';
      case 'chat': return 'bg-orange-100 text-orange-800';
      case 'forms': return 'bg-pink-100 text-pink-800';
      case 'notes': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelationIcon = (relation: string) => {
    switch (relation) {
      case 'mentions': return '💬';
      case 'references': return '🔗';
      case 'related_to': return '🔗';
      case 'depends_on': return '⚡';
      case 'similar_to': return '📊';
      default: return '🔗';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Oxlas Brain" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Oxlas Brain</h1>
                <p className="text-muted-foreground">
                  Knowledge graph that connects content across all your modules
                </p>
              </div>
              <Button onClick={loadStats} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Knowledge Nodes</CardTitle>
                    <Network className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.nodes}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Relationships</CardTitle>
                    <Link className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.edges}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Modules</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.modules.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Relation Types</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.relations.length}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - Search and Results */}
              <div className="lg:col-span-2 space-y-6">
                {/* Search */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Search Knowledge Graph
                    </CardTitle>
                    <CardDescription>
                      Find content and relationships across all modules
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search across all modules..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSearch(searchQuery);
                            }
                          }}
                          className="pl-10"
                        />
                      </div>
                      <Button 
                        onClick={() => handleSearch(searchQuery)}
                        disabled={isLoading || !searchQuery.trim()}
                        className="w-full"
                      >
                        {isLoading ? 'Searching...' : 'Search'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Search Results ({searchResults.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {searchResults.map((node) => {
                          const Icon = getModuleIcon(node.moduleId);
                          return (
                            <div
                              key={node.id}
                              className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => handleNodeClick(node)}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    <h4 className="font-medium truncate">{node.title}</h4>
                                    <Badge className={`text-xs ${getModuleColor(node.moduleId)}`}>
                                      {node.moduleId}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {truncateText(node.content || '', 100)}
                                  </p>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {node.type} • {formatTime(node.created_at)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Selected Node Details */}
                {selectedNode && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Selected Node</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = getModuleIcon(selectedNode.moduleId);
                            return <Icon className="h-5 w-5" />;
                          })()}
                          <h3 className="text-lg font-semibold">{selectedNode.title}</h3>
                          <Badge className={getModuleColor(selectedNode.moduleId)}>
                            {selectedNode.moduleId}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Type:</span>
                            <span className="ml-2">{selectedNode.type}</span>
                          </div>
                          <div>
                            <span className="font-medium">Created:</span>
                            <span className="ml-2">{formatTime(selectedNode.created_at)}</span>
                          </div>
                        </div>

                        {selectedNode.content && (
                          <div>
                            <h4 className="font-medium mb-2">Content</h4>
                            <p className="text-sm text-muted-foreground">
                              {selectedNode.content}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Panel - Related Nodes and Actions */}
              <div className="space-y-6">
                {/* Related Nodes */}
                {relatedNodes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Link className="h-5 w-5" />
                        Related Content ({relatedNodes.length})
                      </CardTitle>
                      <CardDescription>
                        Content connected to the selected node
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {relatedNodes.map((node) => {
                          const Icon = getModuleIcon(node.moduleId);
                          return (
                            <div key={node.id} className="p-3 border rounded-lg">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    <h4 className="font-medium text-sm">{node.title}</h4>
                                    <Badge className={`text-xs ${getModuleColor(node.moduleId)}`}>
                                      {node.moduleId}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{getRelationIcon(node.relation)} {node.relation}</span>
                                    <span>• {Math.round(node.edge_weight * 100)}% match</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Module Distribution */}
                {stats && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Module Distribution</CardTitle>
                      <CardDescription>
                        Knowledge nodes by module
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stats.modules.map((module) => {
                          const Icon = getModuleIcon(module.moduleid);
                          return (
                            <div key={module.moduleid} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium capitalize">{module.moduleid}</span>
                              </div>
                              <Badge variant="outline">{module.count}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
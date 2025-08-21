'use client';

import { useState, useEffect } from 'react';
import { Search, Network, RefreshCw, FileText, MessageSquare, Project, Ticket, BookOpen, Form as FormIcon, Note, Link, Clock, TrendingUp } from 'lucide-react';
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
      const response = await fetch('/api/brain/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
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
      const response = await fetch(`/api/brain/search?q=${encodeURIComponent(query)}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
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
      const response = await fetch(`/api/brain/nodes/${node.id}/related`);
      if (response.ok) {
        const data = await response.json();
        setRelatedNodes(data);
      }
    } catch (error) {
      console.error('Failed to load related nodes:', error);
    }
  };

  const handleSync = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/brain/sync/${moduleId}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Synced ${data.synced} items for ${moduleId}`);
        await loadStats();
      }
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed. Please try again.');
    }
  };

  const getModuleIcon = (moduleId: string) => {
    switch (moduleId) {
      case 'projects': return Project;
      case 'care': return Ticket;
      case 'wiki': return BookOpen;
      case 'chat': return MessageSquare;
      case 'forms': return FormIcon;
      case 'notes': return Note;
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

                        {selectedNode.url && (
                          <div>
                            <h4 className="font-medium mb-2">URL</h4>
                            <a 
                              href={selectedNode.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {selectedNode.url}
                            </a>
                          </div>
                        )}

                        {selectedNode.metadata?.keywords && (
                          <div>
                            <h4 className="font-medium mb-2">Keywords</h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedNode.metadata.keywords.slice(0, 8).map((keyword: any, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {keyword.original}
                                </Badge>
                              ))}
                            </div>
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
                                    <span className="text-lg">{getRelationIcon(node.relation)}</span>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    <h4 className="font-medium text-sm truncate">{node.title}</h4>
                                  </div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge className={`text-xs ${getModuleColor(node.moduleId)}`}>
                                      {node.moduleId}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {node.relation}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {truncateText(node.content || '', 80)}
                                  </p>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Strength: {Math.round(node.edge_weight * 100)}%
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

                {/* Module Sync */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5" />
                      Sync Modules
                    </CardTitle>
                    <CardDescription>
                      Update knowledge graph with latest content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { id: 'projects', name: 'Projects', icon: Project },
                        { id: 'care', name: 'Customer Care', icon: Ticket },
                        { id: 'wiki', name: 'Wiki', icon: BookOpen },
                        { id: 'chat', name: 'Chat', icon: MessageSquare },
                        { id: 'forms', name: 'Forms', icon: FormIcon },
                        { id: 'notes', name: 'Notes', icon: Note },
                      ].map((module) => (
                        <Button
                          key={module.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSync(module.id)}
                          className="w-full justify-start"
                        >
                          <module.icon className="h-4 w-4 mr-2" />
                          {module.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Graph Statistics */}
                {stats && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Graph Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">By Module</h4>
                          <div className="space-y-1">
                            {stats.modules.map((module) => (
                              <div key={module.moduleid} className="flex justify-between text-sm">
                                <span className="capitalize">{module.moduleid}</span>
                                <span>{module.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">By Relation</h4>
                          <div className="space-y-1">
                            {stats.relations.map((relation) => (
                              <div key={relation.relation} className="flex justify-between text-sm">
                                <span className="capitalize">{relation.relation.replace('_', ' ')}</span>
                                <span>{relation.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
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
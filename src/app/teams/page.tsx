'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Settings, MoreVertical, Search, Filter } from 'lucide-react';
import Header from '@/components/oxlas/Header';
import Sidebar from '@/components/oxlas/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/hooks/use-socket-realtime';

interface TeamMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface Team {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  owner: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  members: TeamMember[];
  _count: {
    projects: number;
    tasks: number;
    members: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { toast } = useToast();

  // Get current user ID for socket connection
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const session = await response.json();
          if (session?.user?.email) {
            // Get user ID from email
            const userResponse = await fetch(`/api/user/by-email?email=${session.user.email}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setCurrentUserId(userData.id);
            }
          }
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };
    
    getCurrentUser();
  }, []);

  // Set up real-time updates
  const teamIds = teams.map(team => team.id);
  useSocket({
    userId: currentUserId,
    teamIds,
    onTeamUpdate: (data) => {
      handleTeamUpdate(data);
    },
  });

  const handleTeamUpdate = (data: any) => {
    switch (data.type) {
      case 'created':
        setTeams(prev => [data.team, ...prev]);
        toast({
          title: 'New Team',
          description: `Team "${data.team.name}" has been created`,
        });
        break;
      case 'updated':
        setTeams(prev => prev.map(team => 
          team.id === data.teamId 
            ? { ...team, ...data.updates, updatedAt: data.timestamp }
            : team
        ));
        break;
      case 'member_added':
        setTeams(prev => prev.map(team => 
          team.id === data.teamId 
            ? { 
                ...team, 
                members: [...team.members, data.member],
                _count: { ...team._count, members: team._count.members + 1 }
              }
            : team
        ));
        toast({
          title: 'New Team Member',
          description: `${data.member.user.name} joined the team`,
        });
        break;
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch teams',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch teams',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTeam),
      });

      if (response.ok) {
        const createdTeam = await response.json();
        setTeams([createdTeam, ...teams]);
        setNewTeam({ name: '', description: '' });
        setIsCreateDialogOpen(false);
        toast({
          title: 'Success',
          description: 'Team created successfully',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to create team',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create team',
        variant: 'destructive',
      });
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'member':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              <h1 className="text-3xl font-bold">Teams</h1>
              <p className="text-muted-foreground">Manage your team collaborations</p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                  <DialogDescription>
                    Create a new team to collaborate on projects and tasks.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Team Name</Label>
                    <Input
                      id="name"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                      placeholder="Enter team name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={newTeam.description}
                      onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                      placeholder="Enter team description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={createTeam} disabled={!newTeam.name.trim()}>
                    Create Team
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Teams Grid */}
          {filteredTeams.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No teams found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm ? 'No teams match your search.' : 'Create your first team to get started.'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Team
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <Card key={team.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={team.avatar} alt={team.name} />
                          <AvatarFallback>{team.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <CardDescription className="text-sm">
                            Created by {team.owner.name}
                          </CardDescription>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {team.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {team.description}
                      </p>
                    )}
                    
                    {/* Team Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{team._count.projects}</div>
                        <div className="text-xs text-muted-foreground">Projects</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{team._count.tasks}</div>
                        <div className="text-xs text-muted-foreground">Tasks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{team._count.members}</div>
                        <div className="text-xs text-muted-foreground">Members</div>
                      </div>
                    </div>

                    {/* Team Members Preview */}
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {team.members.slice(0, 3).map((member) => (
                          <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                            <AvatarImage src={member.user.avatar} alt={member.user.name} />
                            <AvatarFallback className="text-xs">
                              {member.user.name?.slice(0, 1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {team.members.length > 3 && (
                          <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium">+{team.members.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3 mr-1" />
                        Manage
                      </Button>
                    </div>

                    {/* Owner Badge */}
                    <div className="mt-3">
                      <Badge className={getRoleBadgeColor('owner')}>
                        Owner: {team.owner.name}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
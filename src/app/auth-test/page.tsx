'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, User, Crown, Settings, FileText, Users, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/toast-provider';

interface Permission {
  name: string;
  description: string;
  roles: string[];
}

const permissions: Permission[] = [
  {
    name: 'Dashboard Access',
    description: 'View the main dashboard',
    roles: ['admin', 'user', 'guest']
  },
  {
    name: 'User Management',
    description: 'Create, edit, and delete users',
    roles: ['admin']
  },
  {
    name: 'Project Management',
    description: 'Create and manage projects',
    roles: ['admin', 'user']
  },
  {
    name: 'System Settings',
    description: 'Access system configuration',
    roles: ['admin']
  },
  {
    name: 'View Reports',
    description: 'Access analytics and reports',
    roles: ['admin', 'user']
  },
  {
    name: 'Content Management',
    description: 'Manage content and files',
    roles: ['admin', 'user']
  }
];

export default function AuthTest() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [testResults, setTestResults] = useState<string[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  const testPermission = (permission: Permission) => {
    const hasPermission = session?.user?.role && permission.roles.includes(session.user.role);
    const result = `${permission.name}: ${hasPermission ? '✓ ALLOWED' : '✗ DENIED'} (${session?.user?.role || 'no role'})`;
    
    setTestResults(prev => [...prev, result]);
    
    addToast({
      type: hasPermission ? 'success' : 'error',
      title: 'Permission Test',
      description: result,
    });
  };

  const runAllTests = () => {
    setTestResults([]);
    addToast({
      type: 'info',
      title: 'Running Tests',
      description: 'Testing all permissions for current user role...',
    });
    
    permissions.forEach((permission, index) => {
      setTimeout(() => testPermission(permission), index * 500);
    });
  };

  const simulateRoleChange = (newRole: string) => {
    addToast({
      type: 'info',
      title: 'Role Simulation',
      description: `Simulating role change to: ${newRole}`,
    });
    
    // In a real app, this would update the user's role in the database
    // For testing, we'll just show a toast
    setTimeout(() => {
      addToast({
        type: 'success',
        title: 'Role Updated',
        description: `User role is now: ${newRole}`,
      });
    }, 1000);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to sign-in
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'user': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Authentication & Authorization Test
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Test different user roles and permissions
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Current User Info */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Current User
                </CardTitle>
                <CardDescription>
                  Your current session and role information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {session.user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{session.user?.name}</p>
                      <p className="text-sm text-gray-600">{session.user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getRoleIcon(session.user?.role || '')}
                    <span className="font-medium">Role:</span>
                    <Badge className={getRoleColor(session.user?.role || '')}>
                      {session.user?.role || 'No Role'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">User ID:</span>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      {session.user?.id}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button 
                      onClick={runAllTests} 
                      className="w-full"
                      variant="outline"
                    >
                      Run All Permission Tests
                    </Button>
                    <Button 
                      onClick={() => router.push('/profile')} 
                      className="w-full"
                      variant="outline"
                    >
                      Edit Profile
                    </Button>
                    <Button 
                      onClick={() => router.push('/dashboard')} 
                      className="w-full"
                    >
                      View Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role Simulation */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Role Simulation
                </CardTitle>
                <CardDescription>
                  Test different user roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    This is a simulation for testing purposes. In a real application, role changes would require database updates and proper authorization.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h4 className="font-medium">Available Roles:</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Crown className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium">Administrator</p>
                          <p className="text-xs text-gray-600">Full system access</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => simulateRoleChange('admin')}
                      >
                        Simulate
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">User</p>
                          <p className="text-xs text-gray-600">Standard access</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => simulateRoleChange('user')}
                      >
                        Simulate
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium">Guest</p>
                          <p className="text-xs text-gray-600">Limited access</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => simulateRoleChange('guest')}
                      >
                        Simulate
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Results */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Test Results
                </CardTitle>
                <CardDescription>
                  Permission test results for current user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {testResults.length === 0 ? (
                  <div className="text-center py-8">
                    <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No tests run yet</p>
                    <p className="text-xs text-gray-500">Click "Run All Permission Tests" to start</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {testResults.map((result, index) => (
                      <div 
                        key={index} 
                        className={`p-2 rounded text-sm font-mono ${
                          result.includes('✓ ALLOWED') 
                            ? 'bg-green-50 text-green-800 border border-green-200' 
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Permission Matrix</h4>
                  <div className="space-y-2 text-xs">
                    {permissions.map((permission, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{permission.name}</p>
                          <p className="text-gray-600">{permission.description}</p>
                        </div>
                        <div className="flex gap-1">
                          {permission.roles.map(role => (
                            <Badge 
                              key={role} 
                              variant="outline" 
                              className={`text-xs ${getRoleColor(role)}`}
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Test Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Authentication Flow Test</CardTitle>
              <CardDescription>
                Test the complete authentication flow and session management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                >
                  Refresh Page
                </Button>
                <Button 
                  onClick={() => {
                    window.location.href = '/';
                    setTimeout(() => {
                      window.location.href = '/auth-test';
                    }, 1000);
                  }} 
                  variant="outline"
                >
                  Navigate Away & Back
                </Button>
                <Button 
                  onClick={() => {
                    window.open('/auth-test', '_blank');
                  }} 
                  variant="outline"
                >
                  Open in New Tab
                </Button>
                <Button 
                  onClick={() => router.push('/auth/signin')} 
                  variant="outline"
                >
                  Test Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
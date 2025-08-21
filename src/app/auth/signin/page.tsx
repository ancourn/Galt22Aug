'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, User, Mail, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/toast-provider';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: email,
        password: password,
        redirect: false,
      });

      if (result?.error) {
        const errorMessage = 'Invalid email or password. Please try again.';
        setError(errorMessage);
        addToast({
          type: 'error',
          title: 'Sign In Failed',
          description: errorMessage,
        });
      } else {
        addToast({
          type: 'success',
          title: 'Welcome Back!',
          description: 'You have been successfully signed in.',
        });
        
        // Refresh session and redirect
        await getSession();
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      const errorMessage = 'An error occurred during sign in. Please try again.';
      setError(errorMessage);
      addToast({
        type: 'error',
        title: 'Sign In Error',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeveloperLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: 'dev@oxx.local',
        password: 'developer',
        redirect: false,
      });

      if (result?.error) {
        const errorMessage = 'Developer login failed. Please try again.';
        setError(errorMessage);
        addToast({
          type: 'error',
          title: 'Login Failed',
          description: errorMessage,
        });
      } else {
        addToast({
          type: 'success',
          title: 'Developer Login Successful!',
          description: 'You have been signed in as Developer User.',
        });
        
        await getSession();
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      const errorMessage = 'An error occurred during developer login.';
      setError(errorMessage);
      addToast({
        type: 'error',
        title: 'Login Error',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-950 dark:to-indigo-950">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">O</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to Oxx
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to your AI-powered workspace
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={handleDeveloperLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    Developer Login
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Don't have an account?{' '}
            <a href="/auth/signup" className="font-medium text-purple-600 hover:text-purple-500">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
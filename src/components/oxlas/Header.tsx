'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Bell, Search, Settings, User, Command, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SearchDialog } from '@/components/ui/search-dialog';
import { useToast } from '@/components/ui/toast-provider';

interface HeaderProps {
  title?: string;
}

export default function Header({ title = 'Oxlas' }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: session, status } = useSession();
  const { addToast } = useToast();

  // Handle keyboard shortcut for global search
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      setIsSearchOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/auth/signin' });
      addToast({
        type: 'success',
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Sign Out Error',
        description: 'Failed to sign out. Please try again.',
      });
    }
  };

  return (
    <>
      <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-full items-center px-6 gap-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full pl-10 pr-4 py-2 text-left bg-muted/50 border-0 rounded-md text-sm text-muted-foreground hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 transition-colors"
              >
                Search across all modules...
              </button>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <Command className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">K</span>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Search Button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="relative"
              title="Global Search (⌘K)"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            {status === 'loading' ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/user.png" alt="User" />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user?.name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email || 'user@oxlas.com'}
                      </p>
                      {session.user?.role && (
                        <p className="text-xs leading-none text-muted-foreground">
                          Role: {session.user.role}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/auth/signin'}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Dialog */}
      <SearchDialog 
        open={isSearchOpen} 
        onOpenChange={setIsSearchOpen} 
      />
    </>
  );
}
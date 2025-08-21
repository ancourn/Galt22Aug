'use client';

import { useState } from 'react';
import { X, Home, Inbox, Calendar, HardDrive, Video, Users, FileText, Bot, FolderOpen, Heart, BookOpen, MessageSquare, File as FormIcon, Notebook, Brain, Zap, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath?: string;
}

export default function MobileSidebar({ isOpen, onClose, currentPath = '/' }: MobileSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      current: currentPath === '/',
    },
    {
      name: 'Inbox',
      href: '/inbox',
      icon: Inbox,
      current: currentPath === '/inbox',
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      current: currentPath === '/calendar',
    },
    {
      name: 'Drive',
      href: '/drive',
      icon: HardDrive,
      current: currentPath === '/drive',
    },
    {
      name: 'Meet',
      href: '/meet',
      icon: Video,
      current: currentPath === '/meet',
    },
    {
      name: 'Team',
      href: '/team',
      icon: Users,
      current: currentPath === '/team',
    },
    {
      name: 'Docs',
      href: '/docs',
      icon: FileText,
      current: currentPath === '/docs',
    },
    {
      name: 'AI Co-Pilot',
      href: '/ai',
      icon: Bot,
      current: currentPath === '/ai',
      badge: 'NEW',
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: FolderOpen,
      current: currentPath === '/projects',
    },
    {
      name: 'Customer Care',
      href: '/care',
      icon: Heart,
      current: currentPath === '/care',
    },
    {
      name: 'Wiki',
      href: '/wiki',
      icon: BookOpen,
      current: currentPath === '/wiki',
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: MessageSquare,
      current: currentPath === '/chat',
    },
    {
      name: 'Forms',
      href: '/forms',
      icon: FormIcon,
      current: currentPath === '/forms',
    },
    {
      name: 'Notes',
      href: '/notes',
      icon: Notebook,
      current: currentPath === '/notes',
    },
    {
      name: 'Oxlas Flow',
      href: '/flow',
      icon: Zap,
      current: currentPath === '/flow',
      badge: 'NEW',
    },
    {
      name: 'Oxlas Brain',
      href: '/brain',
      icon: Brain,
      current: currentPath === '/brain',
      badge: 'NEW',
    },
  ];

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const handleNavigation = (href: string) => {
    window.location.href = href;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-background border-r z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <h1 className="text-lg font-semibold">Oxlas</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant={item.current ? "default" : "ghost"}
                  className="w-full justify-start h-12 touch-target"
                  onClick={() => handleNavigation(item.href)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <div className="flex-1 text-left">
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Divider */}
            <div className="my-6 border-t" />

            {/* Quick Actions */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground px-3 py-2">
                Quick Actions
              </h3>
              
              <Button
                variant="outline"
                className="w-full justify-start h-12 touch-target"
                onClick={() => {
                  // Trigger global search
                  document.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'k',
                    metaKey: true,
                    bubbles: true
                  }));
                  onClose();
                }}
              >
                <Settings className="h-5 w-5 mr-3" />
                Global Search
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-12 touch-target"
                onClick={() => handleNavigation('/ai')}
              >
                <Bot className="h-5 w-5 mr-3" />
                Ask AI
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-12 touch-target"
                onClick={() => handleNavigation('/flow')}
              >
                <Zap className="h-5 w-5 mr-3" />
                Create Automation
              </Button>
            </div>

            {/* Divider */}
            <div className="my-6 border-t" />

            {/* Settings */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground px-3 py-2">
                Settings
              </h3>
              
              <Button
                variant="outline"
                className="w-full justify-start h-12 touch-target"
                onClick={() => {
                  // Open settings
                  onClose();
                }}
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </Button>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="text-xs text-muted-foreground text-center">
              <p>Oxlas v1.0.0</p>
              <p className="mt-1">AI-Powered Workspace</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
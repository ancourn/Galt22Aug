'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Inbox,
  Calendar,
  HardDrive,
  Video,
  MessageSquare,
  Users,
  Star,
  Clock,
  Send,
  FileText,
  ExternalLink,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Kanban,
  Headset,
  Book,
  StickyNote,
  Clipboard,
  Brain,
  FileEdit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const navigation = [
  {
    name: 'Inbox',
    href: '/inbox',
    icon: Inbox,
    count: 12,
    color: 'text-blue-600',
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    color: 'text-green-600',
  },
  {
    name: 'Drive',
    href: '/drive',
    icon: HardDrive,
    color: 'text-purple-600',
  },
  {
    name: 'Meet',
    href: '/meet',
    icon: Video,
    color: 'text-red-600',
  },
  {
    name: 'Team',
    href: '/team',
    icon: Users,
    color: 'text-orange-600',
  },
  {
    name: 'Docs',
    href: '/docs',
    icon: FileEdit,
    color: 'text-teal-600',
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: Kanban,
    color: 'text-orange-600',
  },
  {
    name: 'Care',
    href: '/care',
    icon: Headset,
    color: 'text-teal-600',
  },
  {
    name: 'Wiki',
    href: '/wiki',
    icon: Book,
    color: 'text-indigo-600',
  },
  {
    name: 'Chat',
    href: '/chat',
    icon: MessageSquare,
    color: 'text-pink-600',
  },
  {
    name: 'Forms',
    href: '/forms',
    icon: Clipboard,
    color: 'text-yellow-600',
  },
  {
    name: 'Notes',
    href: '/notes',
    icon: StickyNote,
    color: 'text-green-700',
  },
];

const secondaryNavigation = [
  {
    name: 'AI Assistant',
    href: '/ai',
    icon: Brain,
    color: 'text-indigo-600',
  },
  {
    name: 'Domains',
    href: '/domains',
    icon: ExternalLink,
    color: 'text-blue-600',
  },
  {
    name: 'Starred',
    href: '/starred',
    icon: Star,
    color: 'text-yellow-600',
  },
  {
    name: 'Recent',
    href: '/recent',
    icon: Clock,
    color: 'text-gray-600',
  },
  {
    name: 'Sent',
    href: '/sent',
    icon: Send,
    color: 'text-teal-600',
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: FileText,
    color: 'text-pink-600',
  },
];

const bottomNavigation = [
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    color: 'text-gray-600',
  },
  {
    name: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
    color: 'text-gray-600',
  },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      'flex flex-col h-full bg-background border-r transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Logo and Collapse Button */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <span className="font-semibold text-lg">Oxlas</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Storage Info */}
      {!isCollapsed && (
        <div className="p-4 border-b">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Storage</span>
              <span className="font-medium">7.2 GB / 15 GB</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full" style={{ width: '48%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <item.icon className={cn('h-5 w-5', item.color)} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.count && (
                      <Badge variant="secondary" className="text-xs">
                        {item.count}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        {!isCollapsed && (
          <div className="pt-4 mt-4 border-t">
            <div className="space-y-1">
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className={cn('h-5 w-5', item.color)} />
                    <span className="flex-1">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t">
        <div className="space-y-1">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <item.icon className={cn('h-5 w-5', item.color)} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
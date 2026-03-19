import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  GitBranch, 
  PhoneCall, 
  ClipboardList, 
  Users, 
  BarChart3, 
  FolderOpen, 
  ChevronLeft,
  X,
  Building2
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  roles?: string[];
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/instructions', label: 'Instructions', icon: FileText },
  { path: '/workflow', label: 'Workflow', icon: GitBranch },
  { path: '/callback-verification', label: 'Callback Verification', icon: PhoneCall, roles: ['gis_processor', 'admin'] },
  { path: '/audit-trail', label: 'Audit Trail', icon: ClipboardList },
  { path: '/users', label: 'User Management', icon: Users, roles: ['admin'] },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/documents', label: 'Documents', icon: FolderOpen },
];

export default function Sidebar({ collapsed, onToggle, isMobile }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  const isActive = (path: string) => {
    if (path === '/instructions') {
      return location.pathname.startsWith('/instruction');
    }
    return location.pathname === path;
  };

  // Mobile sidebar overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-[#1A1A1A] rounded-lg border border-white/10 lg:hidden"
        >
          <LayoutDashboard className="w-5 h-5 text-white" />
        </button>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/80 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed left-0 top-0 h-full w-64 bg-[#0A0A0A] border-r border-white/10 z-50 lg:hidden">
              <SidebarContent 
                collapsed={false} 
                onToggle={() => setMobileOpen(false)}
                navItems={filteredNavItems}
                isActive={isActive}
                onClose={() => setMobileOpen(false)}
              />
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-[#0A0A0A] border-r border-white/10 z-40 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <SidebarContent 
        collapsed={collapsed} 
        onToggle={onToggle}
        navItems={filteredNavItems}
        isActive={isActive}
      />
    </aside>
  );
}

interface SidebarContentProps {
  collapsed: boolean;
  onToggle: () => void;
  navItems: NavItem[];
  isActive: (path: string) => boolean;
  onClose?: () => void;
}

function SidebarContent({ collapsed, onToggle, navItems, isActive, onClose }: SidebarContentProps) {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b border-white/10",
        collapsed && "justify-center"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D92027] rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">CIS Portal</h1>
              <p className="text-xs text-white/50">UBA GIS</p>
            </div>
          )}
        </div>
        {!collapsed && onClose && (
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
            <X className="w-5 h-5 text-white/60" />
          </button>
        )}
        {!collapsed && !onClose && (
          <button 
            onClick={onToggle}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white/60" />
          </button>
        )}
        {collapsed && !onClose && (
          <button 
            onClick={onToggle}
            className="absolute -right-3 top-6 w-6 h-6 bg-[#D92027] rounded-full flex items-center justify-center hover:bg-[#B51C22] transition-colors"
          >
            <ChevronLeft className="w-3 h-3 text-white rotate-180" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive(item.path)
                    ? "bg-[#D92027] text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                  isActive(item.path) && "animate-pulse"
                )} />
                {!collapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <div className={cn(
        "p-4 border-t border-white/10",
        collapsed && "px-2"
      )}>
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D92027] to-[#B51C22] flex items-center justify-center flex-shrink-0">
            <span className="font-semibold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-medium text-sm text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/50 capitalize truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

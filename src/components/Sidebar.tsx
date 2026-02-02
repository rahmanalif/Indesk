import { useLocation, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { Tooltip } from './ui/Tooltip';
import { navItems } from '../config/navigation';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export function Sidebar({
  isCollapsed,
  toggleCollapse
}: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();
  const { checkPermission } = usePermissions();

  const handleLogout = () => {
    logout(); // This already handles navigation to /login
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-40 h-screen bg-white border-r border-border/50 transition-all duration-300 ease-in-out hidden md:flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]',
      isCollapsed ? 'w-20' : 'w-64'
    )}>
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/50 overflow-hidden relative">
        {!isCollapsed && (
          <div className="flex items-center justify-center w-full animate-in fade-in duration-300">
            <img src="/images/inkind logo-04.png" alt="InKind" className="h-12 w-auto object-contain transition-all duration-300 hover:scale-105 scale-[1.7]" />
          </div>
        )}
        {isCollapsed && (
          <div className="w-full flex justify-center">
            <img src="/images/inkind logo-04.png" alt="InKind" className="h-8 w-8 object-contain" />
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className={cn(
            'flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all',
            isCollapsed ? 'mx-auto' : 'absolute right-2'
          )}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 no-scrollbar">
        {navItems.map(item => {
          // Check Permissions using the new system
          const hasAccess = checkPermission(item.permission);
          if (!hasAccess) return null;

          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link key={item.path} to={item.path} className="block">
              <div className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden',
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}>
                {isCollapsed ? (
                  <Tooltip content={item.label} side="right">
                    <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-white' : 'text-muted-foreground group-hover:text-primary')} />
                  </Tooltip>
                ) : (
                  <>
                    <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-white' : 'text-muted-foreground group-hover:text-primary')} />
                    <span className="truncate text-sm">{item.label}</span>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User */}
      <div className="p-4 border-t border-border/50">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            'w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl px-3',
            isCollapsed && 'justify-center px-0'
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="ml-3 font-semibold text-sm">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
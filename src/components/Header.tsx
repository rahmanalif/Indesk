import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Search, Bell, Menu, X, ChevronRight, LogOut } from 'lucide-react';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { cn } from '../lib/utils';
import { SearchDropdown } from './SearchDropdown';
import { NotificationDropdown } from './NotificationDropdown';
import { useData } from '../context/DataContext';
import { navItems } from '../config/navigation';

interface HeaderProps {
  isSidebarCollapsed: boolean;
  toggleSidebar?: () => void;
}

export function Header({
  isSidebarCollapsed,
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useData();

  // --- Mobile Menu State ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Search State ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  // --- Notification State ---
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Client Registration', desc: 'Sarah Connor added recently.', time: '2m ago', read: false },
    { id: 2, title: 'Payment Successful', desc: 'Invoice #1024 paid by Mike.', time: '1h ago', read: false },
    { id: 3, title: 'Session Reminder', desc: 'Therapy with John in 30m.', time: '2h ago', read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markSingleRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className={cn(
        "h-16 fixed top-0 right-0 left-0 z-30 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 flex items-center transition-all duration-300",
        isSidebarCollapsed ? "md:left-20" : "md:left-64"
      )}>
        {/* Left Section: Mobile Menu Button / Desktop Search */}
        <div className="flex flex-1 items-center gap-4">
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "text-muted-foreground hover:text-primary transition-all duration-300",
                isMobileMenuOpen && "rotate-90 text-primary bg-primary/10"
              )}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          <div className="flex-1 max-w-xl relative hidden md:block" ref={searchRef}>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search everything..."
                className="w-full h-10 pl-10 pr-4 rounded-full bg-secondary/50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm placeholder:text-muted-foreground"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
              />
            </div>
            {isSearchOpen && (
              <SearchDropdown
                query={searchQuery}
                onSelect={() => setIsSearchOpen(false)}
              />
            )}
          </div>
        </div>

        {/* Center Section: Logo (Mobile/Tablet Only) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center md:hidden">
          <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/images/inkind logo-04.png" alt="InKind" className="h-10 w-auto object-contain scale-[1.3] brightness-110" />
          </Link>
        </div>

        {/* Right Section: Notifications & Profile */}
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
          <div className="relative" ref={notificationRef}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-muted-foreground hover:text-primary relative transition-all duration-200",
                isNotificationOpen && "text-primary bg-primary/10"
              )}
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
              )}
            </Button>

            {isNotificationOpen && (
              <NotificationDropdown
                notifications={notifications}
                onMarkAllRead={markAllRead}
                onRead={markSingleRead}
              />
            )}
          </div>

          <div className="h-8 w-px bg-border/50 hidden sm:block mx-1" />

          <Link to="/profile">
            <div className="flex items-center gap-3 pl-1 cursor-pointer hover:opacity-80 transition-all duration-200 group">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-bold leading-none group-hover:text-primary transition-colors">{currentUser?.name || 'User'}</p>
                <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-widest opacity-70">{currentUser?.email || currentUser?.role || 'User'}</p>
              </div>
              <Avatar fallback={currentUser?.name?.[0] || 'U'} className="bg-primary/10 text-primary border-2 border-white shadow-sm ring-2 ring-transparent group-hover:ring-primary/20 h-9 w-9 transition-all" />
            </div>
          </Link>
        </div>
      </header>

      {/* Mobile Menu Dropdown Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-white md:hidden animate-in slide-in-from-top-2 duration-300 flex flex-col focus-within:ring-0">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 no-scrollbar">
            {/* Search in Mobile Menu */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search everything..."
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-secondary/50 border-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm placeholder:text-muted-foreground"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
              />
              {isSearchOpen && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50">
                  <SearchDropdown
                    query={searchQuery}
                    onSelect={() => {
                      setIsSearchOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                  />
                </div>
              )}
            </div>

            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-2">Navigation</div>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-5 w-5", isActive ? "text-white" : "group-hover:text-primary")} />
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                  </div>
                  <ChevronRight className={cn("h-4 w-4 opacity-50", isActive ? "text-white" : "text-muted-foreground")} />
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-border/50 bg-muted/10">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 rounded-xl text-destructive hover:bg-destructive/10"
              onClick={() => {
                logout();
                navigate('/login');
                setIsMobileMenuOpen(false);
              }}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-bold text-sm">Sign Out</span>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
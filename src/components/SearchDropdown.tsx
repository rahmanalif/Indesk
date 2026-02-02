import { useNavigate } from 'react-router-dom';
import { User, FileText, CreditCard, LayoutDashboard, Settings } from 'lucide-react';

interface SearchDropdownProps {
  query: string;
  onSelect: () => void;
}

export function SearchDropdown({ query, onSelect }: SearchDropdownProps) {
  const navigate = useNavigate();

  const allLinks = [
    { path: '/clients', label: 'Manage Clients', sub: 'Go to Client Directory', icon: User, color: 'text-blue-600', bg: 'bg-blue-100' },
    { path: '/money', label: 'Financial Reports', sub: 'View Money Matters', icon: CreditCard, color: 'text-green-600', bg: 'bg-green-100' },
    { path: '/invoices', label: 'Invoices', sub: 'View All Invoices', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
    { path: '/dashboard', label: 'Dashboard', sub: 'Overview', icon: LayoutDashboard, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const filtered = allLinks.filter(l =>
    l.label.toLowerCase().includes(query.toLowerCase()) ||
    l.sub.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onSelect();
  };

  return (
    <div className="absolute top-12 left-0 right-0 bg-white/95 backdrop-blur-xl border border-primary/10 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
      <div className="p-4">
        <div className="text-[10px] font-black text-primary px-4 py-2 uppercase tracking-widest flex items-center gap-2 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-4 bg-primary rounded-r-lg" />
          {filtered.length > 0 ? 'Quick Links' : 'No results found'}
        </div>
        {filtered.map((link) => {
          const Icon = link.icon;
          return (
            <div
              key={link.path}
              className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
              onClick={() => handleSelect(link.path)}
            >
              <div className={`p-1.5 ${link.bg} ${link.color} rounded`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{link.label}</p>
                <p className="text-xs text-muted-foreground">{link.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-border/50 p-2 bg-muted/20 text-center">
        <span className="text-xs text-muted-foreground">Press Enter to see all results</span>
      </div>
    </div>
  )
}
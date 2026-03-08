import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

export function NoPermissionsPage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-lg rounded-3xl border border-border/60 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">No Permissions Assigned</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          You do not have permission to access any sections yet. Please contact your administrator.
        </p>
        <div className="mt-6">
          <Button onClick={logout} variant="outline" className="h-11 px-6">
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

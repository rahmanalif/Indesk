import { Outlet, NavLink } from 'react-router-dom';
import { Building2, Users } from 'lucide-react';

export function ClinicLayout() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Clinic Management</h1>
                <p className="text-muted-foreground">Manage your clinic settings, clinicians, and team members.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-border/50">
                <div className="flex items-center gap-1">
                    <NavLink
                        to="/clinic/details"
                        className={({ isActive }) => `
              flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all
              ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}
            `}
                    >
                        <Building2 className="h-4 w-4" />
                        Clinic Details
                    </NavLink>
                    <NavLink
                        to="/clinic/team"
                        className={({ isActive }) => `
              flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all
              ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}
            `}
                    >
                        <Users className="h-4 w-4" />
                        Clinicians & Team
                    </NavLink>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                <Outlet />
            </div>
        </div>
    );
}

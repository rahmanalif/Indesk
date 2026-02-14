import { checkUserPermission } from '@/hooks/permissions';
import {
    Calendar,
    Sparkles,
    Users,
    Building2,
    Receipt,
    CalendarCheck,
    ClipboardList,
    DollarSign,
    CreditCard,
    Plug,
    Shield
} from 'lucide-react';

export interface NavItem {
    icon: React.ComponentType;
    label: string;
    path: string;
    permission?: string;
}

export const navItems: NavItem[] = [
    {
        icon: Calendar,
        label: 'Calendar',
        path: '/dashboard',
        permission: 'clinician_dashboard'
    },
    {
        icon: Shield,
        label: 'Roles & Permissions',
        path: '/roles',
        permission: 'clinician_permissions'
    },
    {
        icon: Sparkles,
        label: 'AI Assistance',
        path: '/ai-assistance',
        permission: 'clinician_ai'
    },
    {
        icon: Users,
        label: 'Clients',
        path: '/clients',
        permission: 'clinician_clients'
    },
    {
        icon: Building2,
        label: 'Clinic & Clinicians',
        path: '/clinic',
        permission: 'clinician_clinicians'
    },
    {
        icon: Receipt,
        label: 'Invoices',
        path: '/invoices',
        permission: 'clinician_invoices'
    },
    {
        icon: CalendarCheck,
        label: 'Sessions',
        path: '/sessions',
        permission: 'clinician_sessions'
    },
    {
        icon: ClipboardList,
        label: 'Forms',
        path: '/forms',
        permission: 'clinician_forms'
    },
    {
        icon: DollarSign,
        label: 'Money Matters',
        path: '/money',
        permission: 'clinician_money'
    },
    {
        icon: CreditCard,
        label: 'Subscription',
        path: '/subscription',
        permission: 'clinician_subscription'
    },
    {
        icon: Plug,
        label: 'Integrations',
        path: '/integrations',
        permission: 'clinician_integrations'
    }
];

// Helper function to get accessible nav items for a user
export function getAccessibleNavItems(user: any): NavItem[] {
    if (!user) return [];
    
    return navItems.filter(item => {
        if (!item.permission) return true;
        return checkUserPermission(user, item.permission);
    });
}
// Define user roles
export type UserRole = 'admin' | 'provider' | 'clinician' | 'patient' | 'user';

// Define all available permissions based on your navigation
export type Permission = 
    | 'all'
    | 'clinician_dashboard'
    | 'clinician_permissions'
    | 'clinician_ai'
    | 'clinician_clients'
    | 'clinician_clinicians'
    | 'clinician_invoices'
    | 'clinician_sessions'
    | 'clinician_forms'
    | 'clinician_money'
    | 'clinician_subscription'
    | 'clinician_integrations'
    // Legacy frontend keys (kept for backward compatibility)
    | 'page_dashboard'
    | 'page_roles'
    | 'page_ai'
    | 'page_clients'
    | 'page_clinic'
    | 'page_invoices'
    | 'page_sessions'
    | 'page_forms'
    | 'page_money'
    | 'page_subscription'
    | 'page_integrations';

const permissionAliases: Record<string, string> = {
    page_dashboard: 'clinician_dashboard',
    page_roles: 'clinician_permissions',
    page_ai: 'clinician_ai',
    page_clients: 'clinician_clients',
    page_clinic: 'clinician_clinicians',
    page_invoices: 'clinician_invoices',
    page_sessions: 'clinician_sessions',
    page_forms: 'clinician_forms',
    page_money: 'clinician_money',
    page_subscription: 'clinician_subscription',
    page_integrations: 'clinician_integrations'
};

const reversePermissionAliases: Record<string, string> = Object.entries(permissionAliases)
    .reduce((acc, [from, to]) => {
        acc[to] = from;
        return acc;
    }, {} as Record<string, string>);

// Role-based permission mapping - adjust based on your user roles
export const rolePermissions: Record<UserRole, Permission[]> = {
    'admin': [
        'all',
        'clinician_dashboard',
        'clinician_permissions',
        'clinician_ai',
        'clinician_clients',
        'clinician_clinicians',
        'clinician_invoices',
        'clinician_sessions',
        'clinician_forms',
        'clinician_money',
        'clinician_subscription',
        'clinician_integrations'
    ],
    'provider': [
        'all',
        'clinician_dashboard',
        'clinician_clients',
        'clinician_clinicians',
        'clinician_invoices',
        'clinician_sessions',
        'clinician_forms',
        'clinician_money'
    ],
    'clinician': [
        'clinician_dashboard',
        'clinician_clients',
        'clinician_sessions',
        'clinician_forms'
    ],
    'patient': [
        'clinician_dashboard',
        'clinician_sessions'
    ],
    'user': [
        'clinician_dashboard',
        'clinician_clients',
        'clinician_clinicians',
        'clinician_sessions',
        'clinician_forms'
    ]
};

function getPermissionCandidates(requiredPermission: string): string[] {
    const permission = requiredPermission.toLowerCase();
    const mapped = permissionAliases[permission];
    const reverseMapped = reversePermissionAliases[permission];

    const candidates = new Set<string>([permission]);
    if (mapped) candidates.add(mapped);
    if (reverseMapped) candidates.add(reverseMapped);

    return Array.from(candidates);
}

// Helper function to check if user has permission
export function checkUserPermission(user: any, requiredPermission?: string): boolean {
    if (!requiredPermission) return true; // No permission required
    
    if (!user) return false;
    
    // First, check if user has permissions object from backend
    if (user.permissions && typeof user.permissions === 'object') {
        const candidates = getPermissionCandidates(requiredPermission);

        for (const permission of candidates) {
            if (permission in user.permissions) {
                return user.permissions[permission] === true;
            }
        }
        
        // Check for 'all' permission
        if (user.permissions.all === true) {
            return true;
        }
    }
    
    // Fallback to role-based permissions if no permissions object
    if (!user.role) return false;
    
    const userRole = user.role.toLowerCase() as UserRole;
    const candidates = getPermissionCandidates(requiredPermission) as Permission[];
    
    // Check if role exists in our mapping
    if (!rolePermissions[userRole]) {
        console.warn(`Role "${userRole}" not found in rolePermissions mapping`);
        return false;
    }
    
    const userPerms = rolePermissions[userRole];
    return candidates.some(permission => userPerms.includes(permission)) || userPerms.includes('all');
}

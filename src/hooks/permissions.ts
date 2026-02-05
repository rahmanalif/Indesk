// Define user roles
export type UserRole = 'admin' | 'provider' | 'clinician' | 'patient' | 'user';

// Define all available permissions based on your navigation
export type Permission = 
    | 'all'
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

// Role-based permission mapping - adjust based on your user roles
export const rolePermissions: Record<UserRole, Permission[]> = {
    'admin': [
        'all',
        'page_dashboard',
        'page_roles',
        'page_ai',
        'page_clients',
        'page_clinic',
        'page_invoices',
        'page_sessions',
        'page_forms',
        'page_money',
        'page_subscription',
        'page_integrations'
    ],
    'provider': [
        'all',
        'page_dashboard',
        'page_clients',
        'page_clinic',
        'page_invoices',
        'page_sessions',
        'page_forms',
        'page_money'
    ],
    'clinician': [
        'page_dashboard',
        'page_clients',
        'page_sessions',
        'page_forms'
    ],
    'patient': [
        'page_dashboard',
        'page_sessions'
    ],
    'user': [
        'all',
     'page_dashboard',
     'page_roles',
     'page_ai',
     'page_clients',
     'page_clinic',
     'page_invoices',
     'page_sessions',
     'page_forms',
     'page_money',
     'page_subscription',
     'page_integrations'
    ]
};

// Helper function to check if user has permission
export function checkUserPermission(user: any, requiredPermission?: string): boolean {
    if (!requiredPermission) return true; // No permission required
    
    if (!user) return false;
    
    // First, check if user has permissions object from backend
    if (user.permissions && typeof user.permissions === 'object') {
        const permission = requiredPermission.toLowerCase();
        
        // Check if the specific permission exists in user.permissions
        if (permission in user.permissions) {
            return user.permissions[permission] === true;
        }
        
        // Check for 'all' permission
        if (user.permissions.all === true) {
            return true;
        }
    }
    
    // Fallback to role-based permissions if no permissions object
    if (!user.role) return false;
    
    const userRole = user.role.toLowerCase() as UserRole;
    const permission = requiredPermission.toLowerCase() as Permission;
    
    // Check if role exists in our mapping
    if (!rolePermissions[userRole]) {
        console.warn(`Role "${userRole}" not found in rolePermissions mapping`);
        return false;
    }
    
    const userPerms = rolePermissions[userRole];
    return userPerms.includes(permission) || userPerms.includes('all');
}
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { SmartRedirect } from './SmartRedirect';
import { checkUserPermission, UserRole } from '../hooks/permissions';

interface ProtectedRouteProps {
    permission?: string | string[];
    redirectPath?: string;
    children?: React.ReactNode;
    roles?: UserRole[];
    requireAllPermissions?: boolean;
}

export function ProtectedRoute({ 
    permission, 
    redirectPath = '/login', 
    children,
    roles,
    requireAllPermissions = true
}: ProtectedRouteProps) {
    const { user: currentUser, isAuthenticated } = useSelector((state: RootState) => state.auth);

    // 1. Check Authentication
    if (!isAuthenticated || !currentUser) {
        return <Navigate to={redirectPath} replace />;
    }

    // 2. Check Role Restrictions (if specified)
    if (roles && roles.length > 0) {
        const userRole = currentUser.role.toLowerCase() as UserRole;
        if (!roles.includes(userRole)) {
            return <SmartRedirect />;
        }
    }

    // 3. Check Permission(s)
    if (permission) {
        const hasAccess = checkPermissions(currentUser, permission, requireAllPermissions);
        if (!hasAccess) {
            return <SmartRedirect />;
        }
    }

    // 4. Render children or outlet
    return children ? <>{children}</> : <Outlet />;
}

// Helper function to check single or multiple permissions
function checkPermissions(
    user: any, 
    permission: string | string[], 
    requireAll: boolean
): boolean {
    if (typeof permission === 'string') {
        return checkUserPermission(user, permission);
    }
    
    if (requireAll) {
        return permission.every(perm => checkUserPermission(user, perm));
    } else {
        return permission.some(perm => checkUserPermission(user, perm));
    }
}
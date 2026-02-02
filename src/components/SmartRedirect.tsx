import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { navItems } from '../config/navigation';
import { checkUserPermission } from '../hooks/permissions';

interface SmartRedirectProps {
    preferredRoutes?: string[];
    fallbackPath?: string;
}

export function SmartRedirect({ 
    preferredRoutes, 
    fallbackPath = '/login' 
}: SmartRedirectProps) {
    const { user } = useSelector((state: RootState) => state.auth);
    
    // Get all accessible routes
    const accessibleRoutes = navItems.filter(item => 
        checkUserPermission(user, item.permission)
    );

    // Determine the best route to redirect to
    const redirectPath = getBestRoute(accessibleRoutes, preferredRoutes, fallbackPath);

    return <Navigate to={redirectPath} replace />;
}

// Helper function to find the best route
function getBestRoute(
    accessibleRoutes: any[], 
    preferredRoutes?: string[], 
    fallbackPath: string = '/login'
): string {
    if (accessibleRoutes.length === 0) {
        return fallbackPath;
    }

    // 1. Check preferred routes first
    if (preferredRoutes && preferredRoutes.length > 0) {
        for (const preferredPath of preferredRoutes) {
            const preferredRoute = accessibleRoutes.find(route => route.path === preferredPath);
            if (preferredRoute) {
                return preferredRoute.path;
            }
        }
    }

    // 2. Try to find a dashboard
    const dashboardRoute = accessibleRoutes.find(route => 
        route.path.includes('dashboard') || route.path === '/'
    );

    if (dashboardRoute) {
        return dashboardRoute.path;
    }

    // 3. Return the first accessible route
    return accessibleRoutes[0].path;
}
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
    checkUserPermission, 
    UserRole 
} from '../hooks/permissions';

export const usePermissions = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    const checkPermission = (requiredPermission?: string): boolean => {
        return checkUserPermission(user, requiredPermission);
    };

    const getUserRole = (): UserRole | null => {
        return user?.role?.toLowerCase() as UserRole || null;
    };

    const hasRole = (role: UserRole): boolean => {
        return getUserRole() === role;
    };

    const isAdmin = (): boolean => hasRole('admin');
    const isProvider = (): boolean => hasRole('provider');
    const isClinician = (): boolean => hasRole('clinician');
    const isPatient = (): boolean => hasRole('patient');
    const isUser = (): boolean => hasRole('user');

    return {
        // Permission checks
        checkPermission,
        
        // Role checks
        getUserRole,
        hasRole,
        isAdmin,
        isProvider,
        isClinician,
        isPatient,
        isUser,
        
        // User data
        user,
    };
};
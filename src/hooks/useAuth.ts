import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials, logout, clearError, setError, setLoading } from '../redux/slices/authSlice';
import { useLoginMutation, useLogoutMutation } from '../redux/api/authApi';
import { RootState } from '../store';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginApi, { isLoading: apiLoading }] = useLoginMutation();
  const [logoutApi] = useLogoutMutation();

  const { user, tokens, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const login = async (email: string, password: string) => {
    try {
      dispatch(clearError());
      dispatch(setLoading(true));
      
      const response = await loginApi({ email, password }).unwrap();
      
      if (response.success) {
        // setCredentials now handles localStorage persistence
        dispatch(setCredentials({
          user: response.response.data,
          tokens: response.response.tokens,
        }));
        
        dispatch(setLoading(false));
        return { success: true, data: response };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Invalid credentials. Please try again.';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const logoutUser = async () => {
    try {
      const refreshToken = tokens?.refresh?.token;
      if (refreshToken) {
        await logoutApi({ refreshToken }).unwrap();
      }
    } catch (error) {
      // Ignore logout errors and still clear local auth state
    } finally {
      // logout action now handles localStorage cleanup
      dispatch(logout());
      navigate('/login');
    }
  };

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading: isLoading || apiLoading,
    error,
    login,
    logout: logoutUser,
    clearError: clearAuthError,
  };
};

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials, logout, clearError, setError, setLoading } from '../redux/slices/authSlice';
import { authApi, useLoginMutation, useLogoutMutation, useRegisterMutation, useVerifyAccountMutation } from '../redux/api/authApi';
import { RootState } from '../store';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginApi, { isLoading: apiLoading }] = useLoginMutation();
  const [registerApi, { isLoading: registerLoading }] = useRegisterMutation();
  const [verifyAccountApi, { isLoading: verifyLoading }] = useVerifyAccountMutation();
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
        dispatch(authApi.util.resetApiState());
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

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      dispatch(clearError());
      dispatch(setLoading(true));

      const response = await registerApi({
        firstName,
        lastName,
        email,
        password,
        role: 'user',
      }).unwrap();

      dispatch(setLoading(false));
      return { success: true, data: response };
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Registration failed. Please try again.';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const verifyAccount = async (email: string, code: string) => {
    try {
      dispatch(clearError());
      dispatch(setLoading(true));

      const response = await verifyAccountApi({ email, code }).unwrap();

      if (response.success) {
        dispatch(authApi.util.resetApiState());
        dispatch(setCredentials({
          user: response.response.data,
          tokens: response.response.tokens,
        }));
        dispatch(setLoading(false));
        return { success: true, data: response };
      }

      throw new Error(response.message || 'Account verification failed');
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Verification failed. Please try again.';
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
      dispatch(authApi.util.resetApiState());
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
    isLoading: isLoading || apiLoading || registerLoading || verifyLoading,
    error,
    login,
    register,
    verifyAccount,
    logout: logoutUser,
    clearError: clearAuthError,
  };
};

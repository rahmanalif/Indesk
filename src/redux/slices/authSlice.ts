import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar: string;
  isEmailVerified: boolean;
  phoneNumber: string | null;
  isOnline: boolean;
}

interface Tokens {
  access: {
    token: string;
    expiresAt: string;
  };
  refresh: {
    token: string;
    expiresAt: string;
  };
}

interface AuthState {
  user: User | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Load initial state from localStorage
const loadAuthState = (): AuthState => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userJson = localStorage.getItem('user');
    
    if (accessToken && refreshToken && userJson) {
      const user = JSON.parse(userJson);
      
      // Check if access token is expired
      const accessExpiry = localStorage.getItem('accessTokenExpiry');
      if (accessExpiry && new Date(accessExpiry) > new Date()) {
        return {
          user,
          tokens: {
            access: {
              token: accessToken,
              expiresAt: accessExpiry,
            },
            refresh: {
              token: refreshToken,
              expiresAt: localStorage.getItem('refreshTokenExpiry') || '',
            },
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        };
      }
      // Expired token: clear persisted auth to avoid sending stale credentials
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accessTokenExpiry');
      localStorage.removeItem('refreshTokenExpiry');
    }
  } catch (error) {
    console.error('Error loading auth state from localStorage:', error);
  }
  
  return {
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };
};

const initialState: AuthState = loadAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; tokens: Tokens }>) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      state.error = null;
      
      // Persist to localStorage
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('accessToken', action.payload.tokens.access.token);
      localStorage.setItem('refreshToken', action.payload.tokens.refresh.token);
      localStorage.setItem('accessTokenExpiry', action.payload.tokens.access.expiresAt);
      localStorage.setItem('refreshTokenExpiry', action.payload.tokens.refresh.expiresAt);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accessTokenExpiry');
      localStorage.removeItem('refreshTokenExpiry');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setCredentials, setLoading, setError, logout, clearError } = authSlice.actions;
export default authSlice.reducer;

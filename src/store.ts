import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { authApi } from './redux/api/authApi';
import authReducer from './redux/slices/authSlice';
import { clientsApi } from './redux/api/clientsApi';
import { invoiceApi } from './redux/api/invoiceApi';
import { assessmentApi } from './redux/api/assessmentApi';
import { analyticsApi } from './redux/api/analyticsApi';
import { integrationApi } from './redux/api/integrationApi';
import { aiAssistantApi } from './redux/api/aiAssistantApi';
import { notificationApi } from './redux/api/notificationApi';
import { onboardingApi } from './redux/api/onboardingApi';

const appReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [clientsApi.reducerPath]: clientsApi.reducer,
  [invoiceApi.reducerPath]: invoiceApi.reducer,
  [assessmentApi.reducerPath]: assessmentApi.reducer,
  [analyticsApi.reducerPath]: analyticsApi.reducer,
  [integrationApi.reducerPath]: integrationApi.reducer,
  [aiAssistantApi.reducerPath]: aiAssistantApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
  [onboardingApi.reducerPath]: onboardingApi.reducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'auth/logout') {
    // Clear all state (including RTK query caches) on logout
    state = undefined;
  } else if (action.type === 'auth/setCredentials') {
    // Clear all RTK query caches on login, but preserve auth state to be updated
    if (state) {
      state = { auth: state.auth };
    }
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      clientsApi.middleware,
      invoiceApi.middleware,
      assessmentApi.middleware,
      analyticsApi.middleware,
      integrationApi.middleware,
      aiAssistantApi.middleware,
      notificationApi.middleware,
      onboardingApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

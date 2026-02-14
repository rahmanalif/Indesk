import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './redux/api/authApi';
import authReducer from './redux/slices/authSlice';
import { clientsApi } from './redux/api/clientsApi';
import { invoiceApi } from './redux/api/invoiceApi';
import { assessmentApi } from './redux/api/assessmentApi';
import { analyticsApi } from './redux/api/analyticsApi';
import { integrationApi } from './redux/api/integrationApi';
import { aiAssistantApi } from './redux/api/aiAssistantApi';
import { notificationApi } from './redux/api/notificationApi';
// If you have multiple reducers, you can combine them:
// import counterReducer from '../features/counter/counterSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [clientsApi.reducerPath]: clientsApi.reducer,
    [invoiceApi.reducerPath]: invoiceApi.reducer,
    [assessmentApi.reducerPath]: assessmentApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [integrationApi.reducerPath]: integrationApi.reducer,
    [aiAssistantApi.reducerPath]: aiAssistantApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      clientsApi.middleware,
      invoiceApi.middleware,
      assessmentApi.middleware,
      analyticsApi.middleware,
      integrationApi.middleware,
      aiAssistantApi.middleware,
      notificationApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

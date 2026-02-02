import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './redux/api/authApi';
import authReducer from './redux/slices/authSlice';
import { clientsApi } from './redux/api/clientsApi';
// If you have multiple reducers, you can combine them:
// import counterReducer from '../features/counter/counterSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,[clientsApi.reducerPath]: clientsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, clientsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
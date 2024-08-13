import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { djangoApi } from '../services/api.js';
import projectReducer from './projectSlice.js';

const store = configureStore({
  reducer: {
    [djangoApi.reducerPath]: djangoApi.reducer,
    project: projectReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(djangoApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { djangoApi } from '@services/api';
import navbarReducer from '@store/navbarSlice';
import projectReducer from '@store/projectSlice';

const store = configureStore({
  reducer: {
    [djangoApi.reducerPath]: djangoApi.reducer,
    project: projectReducer,
    navbar: navbarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(djangoApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

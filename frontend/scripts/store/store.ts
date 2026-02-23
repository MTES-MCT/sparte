import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { djangoApi } from '@services/api';
import navbarReducer from '@store/navbarSlice';
import pdfExportReducer from '@store/pdfExportSlice';

const store = configureStore({
  reducer: {
    [djangoApi.reducerPath]: djangoApi.reducer,
    navbar: navbarReducer,
    pdfExport: pdfExportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(djangoApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

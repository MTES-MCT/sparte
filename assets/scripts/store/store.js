import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { djangoApi, publicApi } from '../services/api.js'

const store = configureStore({
  reducer: {
    [djangoApi.reducerPath]: djangoApi.reducer,
    [publicApi.reducerPath]: publicApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(djangoApi.middleware)
    .concat(publicApi.middleware),
})

setupListeners(store.dispatch)

export default store

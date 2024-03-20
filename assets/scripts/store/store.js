import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { djangoApi } from '../services/api.js'

const store = configureStore({
  reducer: {
    [djangoApi.reducerPath]: djangoApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(djangoApi.middleware),
})

setupListeners(store.dispatch)

export default store

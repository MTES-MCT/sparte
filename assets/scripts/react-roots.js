import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import Dashboard from './components/layout/Dashboard.tsx'
import store from './store/store.js'

const dashboard = document.getElementById('react-root')
if (dashboard)
{
  createRoot(dashboard).render(
    <Provider store={store}>
        <Dashboard />
    </Provider>,
  )
}

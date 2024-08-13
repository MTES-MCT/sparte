import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store/store.tsx'
import Dashboard from './components/layout/Dashboard.tsx'

const dashboard = document.getElementById('react-root')
if (dashboard)
{
  createRoot(dashboard).render(
    <Provider store={store}>
        <Dashboard projectId={dashboard.dataset.projectId} />
    </Provider>,
  )
}

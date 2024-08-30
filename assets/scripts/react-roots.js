import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store/store.tsx'
import ErrorBoundary from './components/ui/ErrorBoundary.tsx'
import Dashboard from './components/layout/Dashboard.tsx'

const dashboard = document.getElementById('react-root')
if (dashboard)
{
  createRoot(dashboard).render(
    <ErrorBoundary>
      <Provider store={store}>
          <Dashboard projectId={dashboard.dataset.projectId} />
      </Provider>
    </ErrorBoundary>,
  )
}

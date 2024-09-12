import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/store';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Dashboard from './components/layout/Dashboard';

const dashboard = document.getElementById('react-root');

if (dashboard) {
  const projectId = dashboard.dataset.projectId as string;
  createRoot(dashboard).render(
    <ErrorBoundary>
      <Provider store={store}>
        <Dashboard projectId={projectId} />
      </Provider>
    </ErrorBoundary>,
  );
}

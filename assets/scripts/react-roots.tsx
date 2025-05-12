import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from '@store/store';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import Dashboard from '@components/layout/Dashboard';
import OcsgeImplementationMap from '@components/charts/ocsge/OcsgeImplementationMap'
import SearchBar from '@components/widgets/SearchBar'

const searchBar = document.getElementById('react-search-bar')
if (searchBar)
{
  const createUrl = searchBar.dataset.createUrl;
  const origin = searchBar.dataset.origin;
  createRoot(searchBar).render(
    <Provider store={store}>
      <SearchBar createUrl={createUrl} origin={origin} />
    </Provider>,
  )
}


const ocsgeImplementationMap = document.getElementById('react-highcharts-ocsge')
if (ocsgeImplementationMap)
{
  createRoot(ocsgeImplementationMap).render(
    <Provider store={store}>
        <OcsgeImplementationMap />
    </Provider>,
  )
}

const dashboard = document.getElementById('react-root');
if (dashboard) {
  const projectId = dashboard.dataset.projectId;
  
  createRoot(dashboard).render(
    <ErrorBoundary>
      <Provider store={store}>
        <Dashboard projectId={projectId} />
      </Provider>
    </ErrorBoundary>,
  );
}

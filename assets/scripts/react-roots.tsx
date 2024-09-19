import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from '@store/store';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import Dashboard from '@components/layout/Dashboard';
import HighchartsMapOcsge from '@components/charts/HighchartsMapOcsge'
import SearchBar from '@components/widgets/SearchBar'

const searchBar = document.getElementById('react-search-bar')
if (searchBar)
{
  createRoot(searchBar).render(
    <Provider store={store}>
      <SearchBar createUrl=""/>
    </Provider>,
  )
}


const highchartsMapOcsge = document.getElementById('react-highcharts-ocsge')
if (highchartsMapOcsge)
{
  createRoot(highchartsMapOcsge).render(
    <Provider store={store}>
        <HighchartsMapOcsge />
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

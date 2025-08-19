import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from '@store/store';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import Dashboard from '@components/layout/Dashboard';
import OcsgeImplementationMap from '@components/charts/ocsge/OcsgeImplementationMap'
import SearchBar from '@components/ui/SearchBar'
import MainTerritorySearchBar from '@components/features/MainTerritorySearchBar'
import CookieConsentManager from '@components/ui/CookieConsent'
import { FooterConsentManagementItem } from './hooks/useConsentManagement'

// Gestionnaire de consentement des cookies
const cookieConsentRoot = document.createElement('div');
cookieConsentRoot.id = 'cookie-consent-root';
document.body.appendChild(cookieConsentRoot);

createRoot(cookieConsentRoot).render(
  <Provider store={store}>
    <CookieConsentManager />
  </Provider>,
);

const footerConsent = document.getElementById('react-footer-consent');
if (footerConsent) {
  createRoot(footerConsent).render(
    <Provider store={store}>
      <>
        <FooterConsentManagementItem />
      </>
    </Provider>,
  );
}

const searchBar = document.getElementById('react-search-bar')
if (searchBar)
{
  createRoot(searchBar).render(
    <Provider store={store}>
      <SearchBar />
    </Provider>,
  )
}

const searchBarProfile = document.getElementById('react-search-bar-profile')
if (searchBarProfile)
{  
  createRoot(searchBarProfile).render(
    <Provider store={store}>
      <MainTerritorySearchBar />
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
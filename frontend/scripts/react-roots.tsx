import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from '@store/store';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import Dashboard from '@components/layout/Dashboard';
import { ReportPrintPage } from '@components/pages/Downloads/templates';
import OcsgeImplementationMap from '@components/charts/ocsge/OcsgeImplementationMap'
import SearchBar from '@components/ui/SearchBar'
import MainTerritorySearchBar from '@components/features/MainTerritorySearchBar'
import CookieConsentManager from '@components/ui/CookieConsent'
import { FooterConsentManagementItem } from './hooks/useConsentManagement';
import { ToastContainer } from '@components/ui/Toast';
import 'react-toastify/dist/ReactToastify.css';

// Gestionnaire de consentement des cookies
const cookieConsentRoot = document.createElement('div');
cookieConsentRoot.id = 'cookie-consent-root';
document.body.appendChild(cookieConsentRoot);

createRoot(cookieConsentRoot).render(
  <Provider store={store}>
    <CookieConsentManager />
  </Provider>,
);

const toastRoot = document.createElement('div');
toastRoot.id = 'toast-root';
document.body.appendChild(toastRoot);
createRoot(toastRoot).render(<ToastContainer />);

const footerConsent = document.getElementById('react-footer-consent');
if (footerConsent) {
  createRoot(footerConsent).render(
    <Provider store={store}>
      <FooterConsentManagementItem />
    </Provider>,
  );
}

const searchBar = document.getElementById('react-search-bar')
if (searchBar)
{
  const isHomePage = searchBar.dataset.origin === 'home';
  createRoot(searchBar).render(
    <Provider store={store}>
      <SearchBar animatedPlaceholder={isHomePage} />
    </Provider>,
  )
}

const searchBarSticky = document.getElementById('react-search-bar-sticky')
if (searchBarSticky)
{
  createRoot(searchBarSticky).render(
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
  const { landType, landId, landSlug } = dashboard.dataset;

  createRoot(dashboard).render(
    <ErrorBoundary>
      <Provider store={store}>
        <Dashboard landType={landType} landId={landId} landSlug={landSlug} />
      </Provider>
    </ErrorBoundary>,
  );
}

// Entry point pour le rendu PDF des rapports (utilisé par Puppeteer)
const reportPrintRoot = document.getElementById('react-rapport-draft');
if (reportPrintRoot) {
  const draftId = reportPrintRoot.dataset.draftId;

  if (draftId) {
    createRoot(reportPrintRoot).render(
      <ErrorBoundary>
        <Provider store={store}>
          <ReportPrintPage draftId={draftId} />
        </Provider>
      </ErrorBoundary>,
    );
  }
}


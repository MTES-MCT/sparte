import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import HighchartsMapOcsge from './components/HighchartsMapOcsge.tsx'
import DashboardSidebar from './components/DashboardSidebar.tsx'
import store from './store/store.js'

const highchartsMapOcsge = document.getElementById('react-highcharts-ocsge')
if (highchartsMapOcsge)
{
  createRoot(highchartsMapOcsge).render(
    <Provider store={store}>
        <HighchartsMapOcsge />
    </Provider>,
  )
}

const dashboardSidebar = document.getElementById('react-dashboard-sidebar')
if (dashboardSidebar)
{
  const { menuItems, currentUrl } = JSON.parse(document.getElementById('sidebar-data').textContent)

  createRoot(dashboardSidebar).render(
    <Provider store={store}>
        <DashboardSidebar menuItems={menuItems} currentUrl={currentUrl} />
    </Provider>,
  )
}

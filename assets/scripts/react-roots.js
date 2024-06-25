import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import HighchartsMapOcsge from './components/HighchartsMapOcsge.tsx'
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

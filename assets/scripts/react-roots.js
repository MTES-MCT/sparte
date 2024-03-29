import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import StaticMap from './components/StaticMap.jsx'
import InteractiveMap from './components/InteractiveMap.jsx'
import store from './store/store.js'

if (document.getElementById('react-carte-comprendre-artif'))
{
  createRoot(document.getElementById('react-carte-comprendre-artif')).render(<Provider store={store}><StaticMap /></Provider>)
}

if (document.getElementById('react-carte-interactive-ocsge'))
{
  createRoot(document.getElementById('react-carte-interactive-ocsge')).render(<Provider store={store}><InteractiveMap /></Provider>)
}

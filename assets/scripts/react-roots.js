import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import StaticMap from './components/StaticMap.jsx'
import store from './store/store.js'

createRoot(document.getElementById('react-carte-comprendre-artif')).render(<Provider store={store}><StaticMap /></Provider>)

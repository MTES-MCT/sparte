// Import styles
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '../styles/index.css'

// Import dsfr
import '@gouvfr/dsfr/dist/dsfr.module.min.js'

// HTMX
import 'htmx.org'

import { setWorkerUrl } from 'maplibre-gl'

// React
import './react-roots.tsx'

const workerUrl = new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url)
setWorkerUrl(workerUrl.href)

// Déclare l'URL du worker MapLibre avant toute création de carte.
// Importé en premier dans index.js : les imports sont hoistés, donc un appel
// placé dans le corps de index.js s'exécuterait après les modules React.
import { setWorkerUrl } from 'maplibre-gl'

const workerUrl = new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url)
setWorkerUrl(workerUrl.href)

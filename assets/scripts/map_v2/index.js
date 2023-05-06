import * as L from 'leaflet'
import { polyStyle } from './utils.js'

export default class SparteMap {
    constructor(_options = {}) {
        window.SparteMap = this

        this.targetElement = _options.targetElement
        this.debug = _options.debug
        this.mapCenter = _options.mapCenter
        this.defaultZoom = _options.defaultZoom
        this.geoLayers = _options.geoLayers

        if (!this.targetElement) {
            console.warn('Missing \'targetElement\' property')
            return
        }

        this.setConfig()
        this.setMap()
        this.setGeoLayers()
        this.setDatasPanel()

        if (this.debug)
            this.setDebug()
    }

    setDebug() {
        this.debugPanel = document.createElement('div')
        this.debugPanel.id = 'mapV2__debug'
        this.debugPanel.innerHTML = '<strong>Mode Debug activé</strong>'
        this.targetElement.appendChild(this.debugPanel)

        // Display size
        this.debugPanelSize = document.createElement('div')
        this.debugPanelSize.innerHTML = `<strong>Size:</strong> w ${this.config.width} x h ${this.config.height}`
        this.debugPanel.appendChild(this.debugPanelSize)

        // Display bounds
        this.debugPanelBounding = document.createElement('div')
        this.debugPanel.appendChild(this.debugPanelBounding)
        this.map.on('moveend', () => {
            this.debugPanelBounding.innerHTML = `<strong>Bounds:</strong> SW ${this.map.getBounds().getSouthWest().toString()}, NE ${this.map.getBounds().getNorthEast().toString()}`
        })

        // Display zoom level
        this.debugPanelZoom = document.createElement('div')
        this.debugPanel.appendChild(this.debugPanelZoom)
        this.map.on('zoomend', () => {
            this.debugPanelZoom.innerHTML = `<strong>Zoom level:</strong> ${this.map.getZoom()}`
        })
    }

    setConfig() {
        this.config = {}

        // Width and height
        const boundings = this.targetElement.getBoundingClientRect()
        this.config.width = boundings.width
        this.config.height = boundings.height || window.innerHeight
    }

    setMap() {
        this.map = L.map(this.targetElement.id, {
            center: this.mapCenter,
            zoom: this.defaultZoom,
            minZoom: 6,
        })

        // Set max bounds
        let southWest = L.latLng(41.650542, -6.855469),
            northEast = L.latLng(51.830852, 13.359375),
            bounds = L.latLngBounds(southWest, northEast)
        this.map.setMaxBounds(bounds)

        // Get IGN tiles
        L.tileLayer(
            'https://wxs.ign.fr/{ignApiKey}/geoportail/wmts?' +
            '&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&TILEMATRIXSET=PM' +
            '&LAYER={ignLayer}&STYLE={style}&FORMAT={format}' +
            '&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}', {
                attribution: '<a target="_blank" href="https://www.geoportail.gouv.fr/">Geoportail France</a>',
                ignApiKey: 'ortho',
                ignLayer: 'ORTHOIMAGERY.ORTHOPHOTOS',
                style: 'normal',
                format: 'image/jpeg',
                service: 'WMTS'
            }
        ).addTo(this.map)
    }

    setGeoLayers() {
        console.log(this.geoLayers)
        this.geoLayers.map(async (obj) => {
            // Get GEO JSON for all layers
            let response = await fetch(obj.url)

            if (response.status === 200) {
                let data = await response.json()

                // Create GEO Layer pane
                let GeoLayerPane = this.map.createPane(obj.name)
                // Set GEO Layer pane order
                GeoLayerPane.style.zIndex = 999 * obj.level
                // Set GEO Layer pane default visibility
                if (obj.display === 'False')
                    GeoLayerPane.style.display = 'none'

                // Add GEO JSON layer to map
                L.geoJSON(data, { 
                    style: polyStyle(data),
                    pane: obj.name
                }).addTo(this.map)
            }
        })
    }

    setDatasPanel() {
        this.datasPanel = document.getElementById('mapV2__datas')

        // Display geo layers selector
        this.geoLayers.map((obj) => {
            let container = document.createElement('div')
            container.className = 'mapV2__geo-layer-selector'

            let input = document.createElement('input')
            input.type = 'checkbox'
            input.name = obj.name
            input.value = obj.name
            input.id = obj.name
            if (obj.display === 'True')
                input.checked = true

            let label = document.createElement('label')
            label.htmlFor = obj.name
            label.appendChild(document.createTextNode(obj.name))

            // Add change event on input
            input.addEventListener('change', (_event) => {
                this.map.getPane(_event.target.value).style.display = _event.target.checked ? 'block' : 'none'
            })

            container.appendChild(input)
            container.appendChild(label)
            this.datasPanel.appendChild(container)
        })
    }
}

// Add SparteMap object to the window scope
window.SparteMap = SparteMap

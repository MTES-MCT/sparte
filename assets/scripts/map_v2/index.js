import * as L from 'leaflet'

export default class SparteMap {
    constructor(_options = {}) {
        window.SparteMap = this

        this.targetElement = _options.targetElement
        this.debug = _options.debug
        this.map_center = _options.map_center
        this.default_zoom = _options.default_zoom

        if (!this.targetElement) {
            console.warn('Missing \'targetElement\' property')
            return
        }

        this.setConfig()
        this.setMap()
        this.setDatasPanel()

        if (this.debug)
            this.setDebug()
    }

    setDebug() {
        this.debugPanel = document.createElement('div')
        this.debugPanel.className = "mapV2_debug-panel"
        this.debugPanel.innerHTML = "<strong>Mode Debug activé</strong>"
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
        });

        // Display zoom level
        this.debugPanelZoom = document.createElement('div')
        this.debugPanel.appendChild(this.debugPanelZoom)
        this.map.on('zoomend', () => {
            this.debugPanelZoom.innerHTML = `<strong>Zoom level:</strong> ${this.map.getZoom()}`
        });
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
            center: this.map_center,
            zoom: this.default_zoom,
            minZoom: 6,
        })

        // Set max bounds
        let southWest = L.latLng(41.650542, -6.855469),
            northEast = L.latLng(51.830852, 13.359375),
            bounds = L.latLngBounds(southWest, northEast);
        this.map.setMaxBounds(bounds);

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

    setDatasPanel() {
        this.datasPanel = document.createElement('div')
        this.datasPanel.className = "mapV2_datas-panel"
        this.targetElement.appendChild(this.datasPanel)
    }
}

// Add SparteMap object to the window scope
window.SparteMap = SparteMap
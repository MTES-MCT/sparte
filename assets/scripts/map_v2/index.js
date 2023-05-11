import * as L from 'leaflet'
import Layers from './layers.js'
import { debounce } from './utils.js'

export default class SparteMap {
    constructor(_options = {}) {
        window.sparteMap = this

        this.targetElement = _options.targetElement
        this.debug = _options.debug
        this.mapCenter = _options.mapCenter
        this.defaultZoom = _options.defaultZoom
        this.layerList = _options.layerList

        if (!this.targetElement) {
            console.warn('Missing \'targetElement\' property')
            return
        }

        this.setConfig()
        this.setMap()
        this.setLayers()

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

        // Display zoom level
        this.debugPanelZoom = document.createElement('div')
        this.debugPanel.appendChild(this.debugPanelZoom)

        // Refresh layers option
        this.debugPanelRefreshLayers = document.createElement('div')

        this.debugPanelRefreshLayersCheckbox = document.createElement('input')
        this.debugPanelRefreshLayersCheckbox.className = 'fr-mr-1w'
        this.debugPanelRefreshLayersCheckbox.type = 'checkbox'
        this.debugPanelRefreshLayersCheckbox.name = 'refresh'
        this.debugPanelRefreshLayersCheckbox.value = 'refresh'
        this.debugPanelRefreshLayersCheckbox.id = 'refresh'
        this.debugPanelRefreshLayersCheckbox.checked = true

        let label = document.createElement('label')
        label.htmlFor = 'Refresh layers'
        label.appendChild(document.createTextNode('refresh'))
        this.debugPanelRefreshLayers.appendChild(this.debugPanelRefreshLayersCheckbox)
        this.debugPanelRefreshLayers.appendChild(label)
        this.debugPanel.appendChild(this.debugPanelRefreshLayers)

        this.map.on('moveend', () => {
            this.debugPanelZoom.innerHTML = `<strong>Zoom level:</strong> ${this.map.getZoom()}`
            this.debugPanelBounding.innerHTML = `<strong>Bounds:</strong> SW ${this.map.getBounds().getSouthWest().toString()}, NE ${this.map.getBounds().getNorthEast().toString()}`
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

        this.map.on('moveend', debounce(() => this.moveend(), 1000))
    }

    setLayers() {
        this.layers = new Layers()
    }

    moveend() {
        if (this.layers && this.debugPanelRefreshLayersCheckbox.checked)
            this.layers.update()
    }
}

// Add SparteMap object to the window scope
window.SparteMap = SparteMap

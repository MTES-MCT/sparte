import maplibregl from 'maplibre-gl';
import { debounce } from './utils.js'

import Tabs from './tabs.js'
import Source from './source.js'
import Layer from './layer.js'
import FilterGroup from './filter-group.js'

export default class MapLibre {
    constructor(_options = {}) {
        window.mapLibre = this

        this.targetElement = _options.targetElement
        this.debug = _options.debug
        this.layerList = _options.layerList
        this.mapCenter = _options.mapCenter
        this.defaultZoom = _options.defaultZoom

        if (!this.targetElement) {
            console.warn('Missing \'targetElement\' property')
            return
        }

        this.setConfig()
        this.setTabs()
        this.setMap()

        if (this.debug)
            this.setDebug()
    }

    setConfig() {
        this.config = {}

        // Width and height
        const boundings = this.targetElement.getBoundingClientRect()
        this.config.width = boundings.width
        this.config.height = boundings.height || window.innerHeight
    }

    setMap() {
        this.map = new maplibregl.Map({
            container: this.targetElement, // container
            style: {
                "version": 8,
                "name": "Empty",
                "metadata": {
                    "mapbox:autocomposite": true
                },
                "glyphs": "/static/carto/fonts/{fontstack}/{range}.pbf",
                "sources": {},
                "layers": [
                    {
                        "id": "background",
                        "type": "background",
                        "paint": {
                            "background-color": "#DDDDDD"
                        }
                    }
                ]
            }, // Empty style with DSFR Marianne font glyphs https://github.com/mapbox/mapbox-gl-styles/blob/master/styles/empty-v8.json
            center: this.mapCenter, // starting position [lng, lat]
            zoom: this.defaultZoom, // starting zoom
            maxZoom: 18,
            attributionControl: false
        })

        this.map.on('load', () => {
            // Set sources
            this.setSources()

            // Set sources
            this.setLayers()

            // Set Filters
            this.setFilters()

            // Events
            this.map.on('moveend', debounce(() => this.update(), 1000))
            this.map.on('sourcedata', (_obj) => this.sourceData(_obj))

            // Controls
            this.map.addControl(new maplibregl.NavigationControl(), 'top-left')
        })
    }

    setTabs() {
        const tabList = [
            {
                id: 'layer',
                iconClass: 'bi-layers',
                title: 'Options des calques',
            },
            {
                id: 'data',
                iconClass: 'bi-bar-chart',
            }
        ]

        if (this.debug)
            tabList.push(
                {
                    id: 'debug',
                    iconClass: 'bi-bug',
                }
            )

        this.tabs = new Tabs({
            tabList: tabList,
        })
    }

    setSources() {
        this.sources = []

        this.layerList.map((_obj) => {
            // Create sources
            this.sources.push(new Source(_obj.source, _obj.source_custom_options))
        })
    }

    setLayers() {
        this.layerList.map((_obj) => {
            // Create layers
            _obj.layers.map((__obj) => new Layer(__obj))
        })
    }

    setFilters() {
        this.filters = []

        this.layerList.map((_obj) => {
            // Create filters
            if (_obj.filters?.length > 0) {
                this.filters.push(new FilterGroup(_obj.name, _obj.source.key, _obj.filters))
            }
        })
    }

    setDebug() {
        this.debugPanel = document.getElementById("debug-tab")
        this.debugPanel.innerHTML = '<div class="filter-group tab-item"><strong>Mode Debug activé</strong></div>'

        // Display size
        this.debugPanelSize = document.createElement('div')
        this.debugPanelSize.classList.add('filter-group', 'tab-item')
        this.debugPanelSize.innerHTML = `<strong>Size:</strong> w ${this.config.width} x h ${this.config.height}`
        this.debugPanel.appendChild(this.debugPanelSize)

        // Display bounds
        this.debugPanelBounding = document.createElement('div')
        this.debugPanelBounding.classList.add('filter-group', 'tab-item')
        this.debugPanelBounding.innerHTML = `<strong>Bounds:</strong> SW ${this.map.getBounds().getSouthWest().toString()}, NE ${this.map.getBounds().getNorthEast().toString()}`
        this.debugPanel.appendChild(this.debugPanelBounding)

        // Display zoom level
        this.debugPanelZoom = document.createElement('div')
        this.debugPanelZoom.classList.add('filter-group', 'tab-item')
        this.debugPanelZoom.innerHTML = `<strong>Zoom level:</strong> ${Math.floor(this.map.getZoom())}`
        this.debugPanel.appendChild(this.debugPanelZoom)

        // Debug events tracking
        this.map.on('moveend', () => {
            this.debugPanelZoom.innerHTML = `<strong>Zoom level:</strong> ${Math.floor(this.map.getZoom())}`
            this.debugPanelBounding.innerHTML = `<strong>Bounds:</strong> SW ${this.map.getBounds().getSouthWest().toString()}, NE ${this.map.getBounds().getNorthEast().toString()}`
        })
    }

    update() {
        if (this.sources)
            this.sources.map((_obj) => _obj.update())
    }

    sourceData(_source) {
        if (_source.source.type != 'geojson') // Display loader only for geojson 
            return

        const filter = this.filters.find((_obj) => _obj.source === _source.sourceId)
        if (filter)
            filter.sourceData(_source.isSourceLoaded)
    }
}

// Add MapLibre object to the window scope
window.MapLibre = MapLibre

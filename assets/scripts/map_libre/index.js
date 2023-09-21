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
            }, // Empty style with DSFR Marianne font glyphs
            center: this.mapCenter, // starting position [lng, lat]
            zoom: this.defaultZoom, // starting zoom
            maxZoom: 18,
            attributionControl: false
        })

        this.map.on('load', () => {
            this.map.addControl(new maplibregl.AttributionControl({ compact: true }))

            this.map.on('moveend', debounce(() => this.update(), 1000))

            this.setLayers()
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

        this.tabs = new Tabs({
            tabList: tabList,
        })
    }

    setLayers() {
        this.sources = []

        this.layerList.map((_obj) => {
            // Create sources
            this.sources.push(new Source(_obj.source))

            // Create associated layers
            if (_obj.layers?.length > 0)
                _obj.layers.map((__obj) => new Layer(__obj))

            // Create associated filters
            if (_obj.filters?.length > 0)
                new FilterGroup(_obj.name, _obj.filters)
        })
    }

    update() {
        if (this.sources)
            this.sources.map((_obj) => _obj.update())
    }
}

// Add MapLibre object to the window scope
window.MapLibre = MapLibre

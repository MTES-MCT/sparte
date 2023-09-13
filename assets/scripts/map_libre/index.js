import maplibregl from 'maplibre-gl';
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

        if (!this.targetElement) {
            console.warn('Missing \'targetElement\' property')
            return
        }

        this.setConfig()
        this.setTabs()
        this.setMap()
        this.setLayers()
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
            center: [3.389162, 46.852644], // starting position [lng, lat]
            zoom: 5, // starting zoom
            maxZoom: 18,
            attributionControl: false
        })

        this.map.addControl(new maplibregl.AttributionControl({ compact: true }))
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

        this.layerList.map((_obj) => {
            // Create sources
            new Source(_obj.source)

            // Create associated layers
            if (_obj.layers?.length > 0)
                _obj.layers.map((__obj) => new Layer(__obj))

            // Create associated filters
            if(_obj.filters?.length > 0)
                new FilterGroup(_obj.name, _obj.filters)
        })
    }
}

// Add MapLibre object to the window scope
window.MapLibre = MapLibre

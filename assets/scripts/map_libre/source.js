import maplibregl from 'maplibre-gl';
import { isInRange, createDonutChart } from './utils.js'

export default class Source {
    constructor(_options = {}) {
        this.mapLibre = window.mapLibre
        this.map = this.mapLibre.map

        this.key = _options.key
        this.params = _options.params
        this.baseUrl = _options.params.data
        this.queryStrings = _options.query_strings
        this.triggers = _options.triggers
        this.minZoom = _options.min_zoom || 0
        this.maxZoom = _options.max_zoom || 19

        this.isUpdated = this.queryStrings?.some(_obj => _obj['key'] === 'in_bbox') || false // Check for bbox query string
        this.lastDataZoom = null
        this.lastDataBbox = null

        this.setSource()
    }

    // Setters
    setSource() {
        // Add query params to url for geojson layers
        if (this.params.type === 'geojson') {
            this.params.data = this.isZoomAvailable() ? this.getUrl() : null
        }

        // Create source
        this.map.addSource(this.key, this.params)

        // Custom methods
        if (this.triggers) {
            this.triggers.forEach(_obj => {
                this[`${_obj.method}`](_obj.options)
            })
        }
    }

    // Actions
    update() {
        const currentZoom = this.getZoom()

        if (this.isUpdated && this.isZoomAvailable()) {
            const source = this.map.getSource(this.key)
            source.setData(this.getUrl())

            this.lastDataZoom = currentZoom
        }
    }

    getUrl() {
        let url = this.baseUrl

        // Add query params
        if (this.queryStrings) {
            this.queryStrings.map((_obj, index) => {
                const queryParam = this.getQueryParam(_obj.type, _obj.value)
                url += `${index === 0 ? '?' : '&'}${_obj.key}=${queryParam}`
            })
        }

        return url
    }

    getQueryParam(type, value) {
        var params = {
            "string": () => {
                return value
            },
            "function": () => {
                return this[value]()
            },
            "default": () => {
                console.log(`Query param type unknow for source ${this.key}`)
                return ""
            }
        };
        return (params[type] || params['default'])()
    }

    getBbox() {
        return this.map.getBounds().toArray().join(',')
    }

    getZoom() {
        return Math.floor(this.map.getZoom())
    }

    isZoomAvailable() {
        return isInRange(this.getZoom(), this.minZoom, this.maxZoom)
    }

    displayDonutsChartClusters(_options) {
        this.markers = {}
        this.markersOnScreen = {}

        this.map.on('render', () => {
            if (!this.map.isSourceLoaded(this.key)) return
            this.updateMarkers(_options)
        })
    }

    updateMarkers(_options) {
        const newMarkers = {}
        const features = this.map.querySourceFeatures(this.key)

        // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
        // and add it to the map if it's not there already
        for (const feature of features) {
            const coords = feature.geometry.coordinates
            const props = feature.properties
            if (!props.cluster) continue
            const id = props.cluster_id
            
            let marker = this.markers[id]
            if (!marker) {
                const counts = []
                _options.props.forEach(_obj => {
                    counts.push(props[_obj])
                })
                const el = createDonutChart(_options.colors, counts);
                marker = this.markers[id] = new maplibregl.Marker({
                    element: el
                }).setLngLat(coords)
            }
            newMarkers[id] = marker
            
            if (!this.markersOnScreen[id]) marker.addTo(this.map)
        }
        // for every marker we've added previously, remove those that are no longer visible
        for (const id in this.markersOnScreen) {
            if (!newMarkers[id]) this.markersOnScreen[id].remove()
        }
        this.markersOnScreen = newMarkers
    }
}

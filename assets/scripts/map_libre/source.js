import { isInRange } from './utils.js'

export default class Source {
    constructor(_options = {}) {
        this.mapLibre = window.mapLibre
        this.map = this.mapLibre.map

        this.key = _options.key
        this.params = _options.params
        this.baseUrl = _options.params.data
        this.queryStrings = _options.query_strings
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
}
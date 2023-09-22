export default class Source {
    constructor(_options = {}, _query_strings) {
        this.mapLibre = window.mapLibre
        this.map = this.mapLibre.map

        this.key = _options.key
        this.params = _options.params
        this.queryStrings = _query_strings
        this.isUpdated = this.queryStrings?.some(_obj => _obj['key'] === 'in_bbox') || false // Check for bbox query string

        this.setSource()
    }

    // Setters
    setSource() {
        // Add query params to url for geojson layers
        if (this.params.type === 'geojson') {
            this.url = this.getUrl()
            this.params.data = this.url
        }

        // Create source
        this.map.addSource(this.key, this.params)
    }

    // Actions
    async update() {
        if (this.isUpdated) {
            const source = this.map.getSource(this.key)
            console.log(this.url);
            source.setData(this.url)
        }
    }

    getUrl() {
        let url = this.params.data

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
        return 10 // required param, waiting for backend update to remove it
    }
}
export default class Source {
    constructor(_options = {}) {
        this.mapLibre = window.mapLibre
        this.map = this.mapLibre.map

        this.key = _options.key
        this.params = _options.params

        this.setSource()
    }

    // Setters
    setSource() {
        this.map.addSource(this.key, this.params)
    }
}
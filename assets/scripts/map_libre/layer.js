export default class Layer {
    constructor(_options = {}) {
        this.mapLibre = window.mapLibre
        this.map = this.mapLibre.map

        this.params = _options

        this.setLayer()
    }

    // Setters
    setLayer() {
        this.map.addLayer(this.params)
    }
}
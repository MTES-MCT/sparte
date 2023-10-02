import Events from './events.js'

export default class Layer {
    constructor(_options = {}) {
        this.mapLibre = window.mapLibre
        this.map = this.mapLibre.map

        this.params = _options
        this.id = _options.id
        this.source = _options.source
        this.events = _options.events

        this.setLayer()

        if(this.events)
            this.setEvents()
    }

    // Setters
    setLayer() {
        this.map.addLayer(this.params)
    }

    setEvents() {
        new Events(this.events, this.id, this.source)
    }
}
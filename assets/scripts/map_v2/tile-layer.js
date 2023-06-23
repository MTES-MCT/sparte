import * as L from 'leaflet'
import Layer from './layer.js'

export default class TileLayer extends Layer {
    constructor(_options = {}) {
        super(_options)

        this.setFilters()
        this.setLayer()
    }


    // Setters
    setLayer() {
        // Create pane
        this.createPane()

        // Create layer
        this.createLayer()
    }


    // Actions
    createLayer() {
        const url = this.getUrl()

        // create layer and link to the pane
        this.layer = L.tileLayer(url, {
            pane: this.key,
            interactive: this.isInteractive
        })

        this.layer.addTo(this.map)
    }

    toggleVisibile(_value) {
        this.isVisible = _value

        this.togglePane(_value)
    }

    update() {
    }
}
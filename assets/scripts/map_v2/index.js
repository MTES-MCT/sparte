import * as L from 'leaflet'

export default class SparteMap {
    constructor(_options = {}) {
        window.SparteMap = this

        this.targetElement = _options.targetElement
        this.debug = _options.debug

        if (!this.targetElement) {
            console.warn('Missing \'targetElement\' property')
            return
        }

        this.setConfig()
        if (this.debug)
            this.setDebug()
        this.setMap()
    }

    setConfig() {
        this.config = {}
    }

    setDebug() {
        this.debugPanel = document.createElement('div')
        this.debugPanel.className = "mapV2_debug-panel"
        this.debugPanel.innerHTML = "Mode Debug"
        this.targetElement.appendChild(this.debugPanel)
    }

    setMap() {
        this.map = L.map(this.targetElement.id).setView([51.505, -0.09], 13)
    }
}

// Add SparteMap object to the window scope
window.SparteMap = SparteMap
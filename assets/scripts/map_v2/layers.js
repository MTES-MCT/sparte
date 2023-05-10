import * as L from 'leaflet'
import layerStyles from './layers-style.json'

export default class Layers {
    constructor() {
        this.sparteMap = window.sparteMap
        this.map = this.sparteMap.map
        this.layerList = this.sparteMap.layerList

        this.setLayers()
    }

    setLayers() {
        this.layers = []

        this.layerList.map(async (obj) => {
            // Pass if not displayed
            if (obj.display === "False")
                return

            // Get GEO JSON for all layers
            let url = obj.url
            if (obj.is_optimized === "True")
                url += `?in_bbox=${this.map.getBounds().toBBoxString()}&zoom=${this.map.getZoom()}`

            fetch(url)
                .then((response) => {
                    return response.json()
                })
                .then((data) => {
                    let pane = this.map.createPane(obj.name)
                    // Set GEO Layer pane order
                    pane.style.zIndex = 999 * obj.level
                    // Set GEO Layer pane default visibility
                    if (obj.display === 'False')
                        pane.style.display = 'none'
                    // Get GEO Layer style
                    const style = layerStyles.find(el => el.key === obj.style)

                    // Add GEO JSON layer to map
                    let layer = L.geoJSON(data, {
                        style: style,
                        pane: obj.name,
                        is_optimized: obj.is_optimized,
                        url: obj.url,
                        display: obj.display,
                        id: obj.name
                    })

                    // Save layer in array
                    this.layers.push(layer)

                    // Add layer to map
                    layer.addTo(this.map)
                })
                .catch(function(error) {
                    console.log(error)
                })

            this.setLayerSelector(obj)
        })
    }

    setLayerSelector(geoLayer) {
        this.datasPanel = document.getElementById('mapV2__datas')

        let container = document.createElement('div')
        container.className = 'mapV2__geo-layer-selector'

        let input = document.createElement('input')
        input.type = 'checkbox'
        input.name = geoLayer.name
        input.value = geoLayer.name
        input.id = geoLayer.name
        if (geoLayer.display === 'True')
            input.checked = true

        let label = document.createElement('label')
        label.htmlFor = geoLayer.name
        label.appendChild(document.createTextNode(geoLayer.name))

        // Add change event on input
        input.addEventListener('change', (_event) => {
            this.map.getPane(_event.target.value).style.display = _event.target.checked ? 'block' : 'none'
            this.layers.find((obj) => obj.options.id === _event.target.value).display = _event.target.checked ? 'True' : 'False'
        })

        container.appendChild(input)
        container.appendChild(label)
        this.datasPanel.appendChild(container)
    }

    update() {
        this.layers.map((obj) => {
            if (obj.options.display === 'False' || obj.options.is_optimized === "False")
                return
            
            let url = `${obj.options.url}?in_bbox=${this.map.getBounds().toBBoxString()}&zoom=${this.map.getZoom()}`
    
            fetch(url)
                .then((response) => {
                    return response.json()
                })
                .then((data) => {
                    obj.clearLayers()
                    obj.addData(data)
                })
                .catch(function(error) {
                    console.log(error)
                })
        })
    }
}
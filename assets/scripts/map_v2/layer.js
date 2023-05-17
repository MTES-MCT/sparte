import * as L from 'leaflet'
import { slugify } from './utils.js'
import layerStyles from './layers-style.json'

export default class Layer {
    constructor(_options = {}) {
        this.sparteMap = window.sparteMap
        this.map = this.sparteMap.map
        this.name = _options.name
        this.slug = slugify(_options.name)
        this.style = _options.style
        this.zoomAvailable = JSON.parse(_options.zoom_available.replace(/\'/g, '"'))
        this.url = _options.url
        this.urlParams = _options.url_params ? JSON.parse(_options.url_params.replace(/\'/g, '"')) : {}
        this.zIndex = _options.z_index
        this.isOptimized = Boolean(Number(_options.is_optimized))
        this.isVisible = Boolean(Number(_options.visible))
        this.couv_leafs = this.sparteMap.couv_leafs
        this.usa_leafs = this.sparteMap.usa_leafs

        this.setLayer()
    }

    async setLayer() {
        if (!this.layer) {
            // Create empty layer
            this.layer = this.createLayer().addTo(this.map)

            // Create layer control
            this.createLayerControl()
        }

        // Set visibility
        this.layerControl.disabled = !this.isZoomAvailable()

        if (this.isZoomAvailable() && this.isVisible) {
            await this.addData()
            this.layerControl.checked = true
            this.pane.style.display = 'block'
        }
    }

    getStyle(key) {
        return layerStyles.find(el => el.key === key)
    }

    async addData() {
        // Get data
        const url = this.getUrl()

        try {
            const response = await fetch(url)
            this.data = await response.json()

            // Remove data from layer
            this.layer.clearLayers()
            // Add new data to layer
            this.layer.addData(this.data)

            // Flag last data zoom
            this.lastDataZoom = this.map.getZoom()

            // create popup
            this.layer.eachLayer((layer) => {
                let data = ''
                if (layer.feature.properties)
                    Object.entries(layer.feature.properties).map(([key, value]) => data += `<strong>${key}</strong>: ${value}<br>`)
                
                if (data) {
                    layer.bindPopup(data)
                    
                    layer.on('mouseover', function () {
                        this.openPopup()
                    })
                    
                    layer.on('mouseout', function () {
                        this.closePopup()
                    })
                }
            })
        } catch(error) {
            console.log(error)
        }
    }

    createLayer() {
        // Create pane
        this.pane = this.map.createPane(this.slug)
        // Set pane z-index
        this.pane.style.zIndex = 600 + parseInt(this.zIndex)
        // Hide by default
        this.pane.style.display = 'none'
        
        // Create empty geoJSON layer
        let geoJSONLayer = L.geoJSON(null, {
            style: (geoJsonFeature) => {
                // Get default style
                let style = this.getStyle(this.style)

                // Override style
                if (this.style === 'style_ocsge_diff' && geoJsonFeature.properties.is_new_artif) {
                    style = this.getStyle('style_ocsge_diff__is_new_artif')
                }
                
                if (this.style === 'style_ocsge_diff' && geoJsonFeature.properties.is_new_natural) {
                    style = this.getStyle('style_ocsge_diff__is_new_natural')
                }

                if (this.style === 'style_ocsge_couv') {
                    const leaf = this.couv_leafs.find(el => el.code_couverture == geoJsonFeature.properties.code_couverture.replaceAll('.', '_'))
                    if (leaf)
                        style.fillColor = style.color = leaf.map_color
                }

                if (this.style === 'style_ocsge_usage') {
                    const leaf = this.usa_leafs.find(el => el.code_usage == geoJsonFeature.properties.code_usage.replaceAll('.', '_'))
                    if (leaf)
                        style.fillColor = style.color = leaf.map_color
                }

                return style
            },
            pane: this.slug,
        })

        return geoJSONLayer
    }

    getUrl() {
        const bbox = this.map.getBounds().toBBoxString()
        const zoom = this.map.getZoom()

        // Base url
        let url = this.url

        // Base params
        let params = {
            in_bbox: bbox,
            zoom: zoom,
        }

        // Loop through url params
        if (this.urlParams)
            Object.entries(this.urlParams).map(([key, value]) => params = { ...params, [key]: value })

        // Build url
        Object.keys(params).map((key, index) => {
            if (index === 0)
                url += `?${key}=${params[key]}`
            else
                url += `&${key}=${params[key]}`
        })

        return url
    }

    isZoomAvailable() {
        const zoom = this.map.getZoom()

        return this.zoomAvailable.includes(zoom)
    }

    createLayerControl() {
        let container = document.createElement('div')
        container.className = 'mapV2__controls'

        let input = document.createElement('input')
        input.type = 'checkbox'
        input.name = this.slug 
        input.value = this.slug 
        input.id = this.slug 
        input.disabled = true
        input.checked = false

        let label = document.createElement('label')
        label.htmlFor = this.slug 
        label.appendChild(document.createTextNode(this.name))

        this.layerControl = input
        // Add change event on layer control
        this.layerControl.addEventListener('change', async (_event) => {
            if (_event.target.checked) {
                if (!this.lastDataZoom || this.isOptimized && this.lastDataZoom !== this.map.getZoom())
                    await this.addData()
            }

            this.isVisible = _event.target.checked

            this.pane.style.display = _event.target.checked ? 'block' : 'none'
        })

        container.appendChild(input)
        container.appendChild(label)

        // Add checkbox control to panel
        document.getElementById('layers-panel').appendChild(container)
    }

    async update() {
        this.layerControl.disabled = !this.isZoomAvailable()

        if (!this.isOptimized)
            return


        if (this.isOptimized && this.isZoomAvailable() && this.isVisible) {
            await this.addData()

            this.pane.style.display = 'block'

            this.layerControl.checked = true 
        }
        else {
            this.pane.style.display = 'none'         
        }
    }
}
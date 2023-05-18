import * as L from 'leaflet'
import { slugify } from './utils.js'
import layerStyles from './layers-style.json'
import { values } from 'htmx.org'

export default class Layer {
    constructor(_options = {}) {
        this.sparteMap = window.sparteMap
        this.map = this.sparteMap.map
        this.projectId = this.sparteMap.projectId
        this.name = _options.name
        this.slug = slugify(_options.name)
        this.style = _options.style
        this.zoomAvailable = JSON.parse(_options.zoom_available.replace(/\'/g, '"'))
        this.url = _options.url
        this.urlParams = _options.url_params ? JSON.parse(_options.url_params.replace(/\'/g, '"')) : {}
        this.dataUrl = _options.dataUrl
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
        }

        if (this.isZoomAvailable() && this.isVisible) {
            await this.addData()
            // this.layerControl.checked = true
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
                
                // Show popup on mouse over 
                if (data) {
                    layer.bindPopup(data)
                    
                    layer.on('mouseover', function () {
                        this.openPopup()
                    })
                    
                    layer.on('mouseout', function () {
                        this.closePopup()
                    })
                }

                // Load data in data-panel
                layer.on('click', () => {
                    if (["zones-urbaines-u", "zones-urbaines-ah-nd-a-n-nh", "zones-urbaines-auc-aus"].includes(layer.options.pane)) {
                        const url = `/project/${this.projectId}/carte/detail-zone-urbaine/${layer.feature.properties.id}`

                        const htmxContent = `<div hx-get="${url}" hx-trigger="load"></div>`

                        document.getElementById('data-panel').innerHTML = htmxContent
                        htmx.process(document.getElementById('data-panel'))
                    }
                })
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

    // Custom triggers
    async toggleVisibile (_value) {
        if (_value) {
            if (!this.lastDataZoom || this.isOptimized && this.lastDataZoom !== this.map.getZoom())
                await this.addData()
        }

        this.isVisible = _value

        this.pane.style.display = _value ? 'block' : 'none'
    }

    toggleOCSGEStyle(_value) {
        // Get default style
        let style = this.getStyle(_value)

        // Override default style
        this.layer.eachLayer((_layer) => {  
            if (_value === 'style_ocsge_couv') {
                const leaf = this.couv_leafs.find(el => el.code_couverture == _layer.feature.properties.code_couverture.replaceAll('.', '_'))
                if (leaf)
                    style.fillColor = style.color = leaf.map_color
            }
    
            if (_value === 'style_ocsge_usage') {
                const leaf = this.usa_leafs.find(el => el.code_usage == _layer.feature.properties.code_usage.replaceAll('.', '_'))
                if (leaf)
                    style.fillColor = style.color = leaf.map_color
            }
  
            _layer.setStyle(style) 
        })
    }

    updateData (_value, _param) {
        this.urlParams[_param] = _value

        this.addData()
    }

    async update() {
        // this.layerControl.disabled = !this.isZoomAvailable()

        if (!this.isOptimized)
            return


        if (this.isOptimized && this.isZoomAvailable() && this.isVisible) {
            await this.addData()

            this.pane.style.display = 'block'

            // this.layerControl.checked = true 
        }
        else {
            this.pane.style.display = 'none'         
        }
    }
}
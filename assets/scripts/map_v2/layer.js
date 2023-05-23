import * as L from 'leaflet'
import { slugify } from './utils.js'
import isEqual from 'lodash/isEqual'
import Style from './style.js'

export default class Layer {
    constructor(_options = {}) {
        this.sparteMap = window.sparteMap
        this.map = this.sparteMap.map
        this.projectId = this.sparteMap.projectId
        this.name = _options.name
        this.slug = slugify(_options.name)
        this.styleKey = _options.style_key
        this.zoomAvailable = JSON.parse(_options.zoom_available.replace(/\'/g, '"'))
        this.url = _options.url
        this.urlParams = _options.url_params ? JSON.parse(_options.url_params.replace(/\'/g, '"')) : {}
        this.dataUrl = _options.dataUrl
        this.zIndex = _options.z_index
        this.isOptimized = Boolean(Number(_options.is_optimized))
        this.isVisible = Boolean(Number(_options.visible))
        this.showLabel = _options.show_label

        // Flags
        this.lastDataBbox = null
        this.lastDataUrlParams = {}

        // Set label group
        if(this.showLabel)
            this.labels = L.layerGroup().addTo(this.map)

        this.legendNode = document.getElementById('mapV2__legend')
        
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

            // Flag last data bbox
            this.lastDataBbox = this.map.getBounds().toBBoxString()
            // Flag last data url params
            this.lastDataUrlParams = JSON.parse(JSON.stringify(this.urlParams))

            // Clear label group
            if(this.showLabel)
                this.labels.clearLayers()

            // create popup
            this.layer.eachLayer((layer) => {
                let styleInstance = new Style({
                    styleKey: this.styleKey,
                    feature: layer.feature
                })

                layer.setStyle(styleInstance.style)

                let data = '<div class="d-flex align-items-center">'
                if (layer.feature.properties)
                    Object.entries(layer.feature.properties).map(([key, value]) => data += `<div class="fr-mr-2w"><strong>${key}</strong>: ${value}</div>`)
                data += '</div>'

                // Add label
                let label
                if (this.showLabel) {
                    // Extract label position
                    let coords = layer.feature.properties.label_center.match(/\(.*?\)/g).map(x => x.replace(/[()]/g, "")).pop().split(' ');  
                    coords = {
                        lat: coords[1],
                        lng: coords[0]
                    }

                    label = L.marker(coords, {
                        icon: L.divIcon({
                            className: 'map-label',
                            html: layer.feature.properties.typezone,
                            iconSize: [0, 0],
                        }),
                        interactive: false
                    })
            
                    // Add label to label group
                    this.labels.addLayer(label)
                }

                // Mouse events 
                layer.on('mouseover', () => {
                    // Display data in legend
                    if (data) {
                        this.legendNode.innerHTML = data
                        this.legendNode.style.opacity = 1
                    }

                    layer.bringToFront()

                    // Highlight style
                    layer.setStyle(styleInstance.highlight)

                    if (this.showLabel)
                        label._icon.style.color = '#ffffff'
                })
                
                layer.on('mouseout', () => {
                    // Display data in legend
                    if (data) {
                        this.legendNode.innerHTML = null
                        this.legendNode.style.opacity = 0
                    }

                    layer.setStyle(styleInstance.style)

                    if (this.showLabel)
                        label._icon.style.color = '#000000'
                })

                // Load data in data-panel
                layer.on('click', () => {
                    if (["zones-urbaines", "zones-urbaines-u", "zones-urbaines-ah-nd-a-n-nh", "zones-urbaines-auc-aus"].includes(layer.options.pane)) {
                        const url = `/project/${this.projectId}/carte/detail-zone-urbaine/${layer.feature.properties.id}`

                        const htmxContent = `<div hx-get="${url}" hx-trigger="load" class="tab-item"></div>`

                        // TODO: create and use panel Class
                        const tabs = document.querySelector('.tabs')
                        const tabButtons = tabs.querySelectorAll('[role="tab"]')
                        const tabPanels = tabs.querySelectorAll('[role="tabpanel"]')
                        const button = document.getElementById('data')
                        const tabPanel = document.getElementById('data-tab')

                        // hide all tab panels
                        tabPanels.forEach(panel => {
                            panel.hidden = true
                        })

                        // mark all tabs as unselected
                        tabButtons.forEach(tab => {
                            tab.setAttribute('aria-selected', false)
                        })

                        // Show data tab
                        button.setAttribute('aria-selected', true)
                        tabPanel.hidden = false

                        tabPanel.innerHTML = htmxContent
                        htmx.process(tabPanel)
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
        this.pane.style.zIndex = 550 + parseInt(this.zIndex)
        // Hide by default
        this.pane.style.display = 'none'
        
        // Create empty geoJSON layer
        let geoJSONLayer = L.geoJSON(null, {
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
            if (!this.lastDataBbox || this.isOptimized && this.lastDataBbox !== this.map.getBounds().toBBoxString() || this.isOptimized && !isEqual(this.urlParams, this.lastDataUrlParams))
                await this.addData()
        }

        this.isVisible = _value

        this.pane.style.display = _value ? 'block' : 'none'
    }

    toggleOCSGEStyle(_value) {
        // Update layer default style
        this.style = _value

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

        if (!this.isVisible)
            return

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
import * as L from 'leaflet'
import { slugify } from './utils.js'
import isEqual from 'lodash/isEqual'
import Style from './style.js'

export default class Layer {
    constructor(_options = {}) {
        this.sparteMap = window.sparteMap
        this.map = this.sparteMap.map
        this.projectId = this.sparteMap.projectId
        this.tabs = this.sparteMap.tabs
        this.name = _options.name
        this.slug = slugify(_options.name)
        this.styleKey = _options.style_key
        this.url = JSON.parse(_options.url.replace(/\'/g, '"'))
        this.urlParams = _options.url_params ? JSON.parse(_options.url_params.replace(/\'/g, '"')) : {}
        this.zIndex = _options.z_index
        this.isOptimized = Boolean(Number(_options.is_optimized))
        this.isVisible = Boolean(Number(_options.visible))
        this.label = _options.label ? JSON.parse(_options.label.replace(/\'/g, '"')) : null
        this.interactive = Boolean(Number(_options.interactive))

        // Flags
        this.lastDataBbox = null
        this.lastDataUrlParams = {}

        // Set label group
        if(this.label) {
            this.labelGroup = L.layerGroup().addTo(this.map)
            // Create pane
            this.labelPane = this.map.createPane(`${this.slug}-label`)
            this.labelPane.style.zIndex = 550 + parseInt(this.zIndex) + 1
        }

        this.legendNode = document.getElementById('mapV2__legend')
        
        this.setLayer()
    }

    async setLayer() {
        if (!this.layer) {
            // Create empty layer
            this.layer = this.createLayer().addTo(this.map)
        }

        // Get data url
        const url = this.getUrl()

        if (url)
            await this.addData(url)
    }

    async addData(_url) {
        try {
            const response = await fetch(_url)
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
            if(this.label)
                this.labelGroup.clearLayers()

            // create popup
            this.layer.eachLayer((_layer) => {
                _layer.styleInstance = new Style({
                    styleKey: this.styleKey,
                    feature: _layer.feature
                })

                _layer.setStyle(_layer.styleInstance.style)

                let data = '<div class="d-flex align-items-center">'
                if (_layer.feature.properties)
                    Object.entries(_layer.feature.properties).map(([key, value]) => data += `<div class="fr-mr-2w"><strong>${key}</strong>: ${value}</div>`)
                data += '</div>'

                // Add label
                let label
                if (this.label) {
                    // Extract label position
                    let coords = _layer.feature.properties?.label_center?.match(/\(.*?\)/g).map(x => x.replace(/[()]/g, "")).pop().split(' ') || _layer.getBounds().getCenter();  
                    coords = {
                        lat: coords[1],
                        lng: coords[0]
                    }

                    label = L.marker(coords, {
                        pane: this.labelPane,
                        icon: L.divIcon({
                            className: 'map-label',
                            html: _layer.feature.properties[this.label.key],
                            iconSize: [0, 0],
                        }),
                        interactive: false
                    })
            
                    // Add label to label group
                    this.labelGroup.addLayer(label)

                    // Set label color
                    label._icon.style.color = _layer.styleInstance.style.color
                }

                // Mouse events 
                _layer.on('mouseover', () => {
                    // Display data in legend
                    if (data) {
                        this.legendNode.innerHTML = data
                        this.legendNode.style.opacity = 1
                    }

                    _layer.bringToFront()

                    // Highlight style
                    _layer.setStyle(_layer.styleInstance.highlight)

                    if (this.label)
                        label._icon.style.color = '#ffffff'
                })
                
                _layer.on('mouseout', () => {
                    // Display data in legend
                    if (data) {
                        this.legendNode.innerHTML = null
                        this.legendNode.style.opacity = 0
                    }

                    _layer.setStyle(_layer.styleInstance.style)

                    if (this.label)
                        label._icon.style.color = _layer.styleInstance.style.color
                })

                // Load data in data-panel
                _layer.on('click', () => {
                    if (["zones-urbaines", "zones-urbaines-u", "zones-urbaines-ah-nd-a-n-nh", "zones-urbaines-auc-aus"].includes(_layer.options.pane)) {
                        const url = `/project/${this.projectId}/carte/detail-zone-urbaine/${_layer.feature.properties.id}`

                        const htmxContent = `<div hx-get="${url}" hx-trigger="load" class="tab-item"><div class="fr-custom-loader-min htmx-indicator"></div></div>`

                        let dataTab = this.tabs.getTab('data')
                        if(dataTab.hidden)
                            this.tabs.toggle('data')

                        dataTab.innerHTML = htmxContent
                        htmx.process(dataTab)
                    }
                })
            })

            // Display pane
            this.pane.style.display = 'block'
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
            interactive: this.interactive
        })

        return geoJSONLayer
    }

    getUrl() {
        const bbox = this.map.getBounds().toBBoxString()
        const zoom = this.map.getZoom()

        // Get url based on zoom level
        let url = this.url.find((_obj) => _obj.zoom_available.includes(zoom))?.value

        if (!url)
            return

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

    // isZoomAvailable() {
    //     const zoom = this.map.getZoom()

    //     return this.zoomAvailable.includes(zoom)
    // }

    // Custom triggers
    async toggleVisibile (_value) {
        if (_value) {
            if (!this.lastDataBbox || this.isOptimized && this.lastDataBbox !== this.map.getBounds().toBBoxString() || this.isOptimized && !isEqual(this.urlParams, this.lastDataUrlParams)) {
                // Get data url
                const url = this.getUrl()

                if (url)
                    await this.addData(url)
            }
        }

        this.isVisible = _value

        this.pane.style.display = _value ? 'block' : 'none'

        if (this.label)
            this.labelPane.style.display = _value ? 'block' : 'none'
    }

    updateStyleKey(_value) {
        // Update layer style key
        this.styleKey = _value

        // Update layer style
        this.layer.eachLayer((_layer) => { 
            _layer.styleInstance.updateKey(this.styleKey)
            _layer.setStyle(_layer.styleInstance.style)
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


        if (this.isOptimized && this.isVisible) {
            // Get data url
            const url = this.getUrl()

            if (url)
                await this.addData(url)
            else
                this.pane.style.display = 'none'  

            // this.layerControl.checked = true 
        }
        else {
            this.pane.style.display = 'none'         
        }
    }
}
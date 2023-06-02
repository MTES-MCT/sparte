import { slugify, isEmpty } from './utils.js'
import FilterGroup from './filter-group.js'

const baseZIndex = 550

export default class Layer {
    constructor(_options = {}) {
        this.sparteMap = window.sparteMap
        this.map = this.sparteMap.map
        this.projectId = this.sparteMap.projectId
        this.tabs = this.sparteMap.tabs

        this.name = _options.name
        this.key = _options.key || slugify(this.name)
        this.styleKey = _options.style_key
        this.zIndex = _options.z_index
        this.label = _options.label ? JSON.parse(_options.label.replace(/\'/g, '"')) : null
        this.url = JSON.parse(_options.url.replace(/\'/g, '"'))
        this.urlParams = _options.url_params ? JSON.parse(_options.url_params.replace(/\'/g, '"')) : {}
        this.filters = _options.filters ? JSON.parse(_options.filters.replace(/\'/g, '"')) : []

        this.isOptimized = Boolean(Number(_options.is_optimized))
        this.isInteractive = Boolean(Number(_options.is_interactive))

        // Default values from filters
        this.isVisible = this.filters.find((_obj) => _obj.type === 'visible')?.value === 'true' ? true : this.filters.find((_obj) => _obj.type === 'visible')?.value === 'false' ? false : true
        this.opacity = this.filters.find((_obj) => _obj.type === 'opacity')?.value || 1

        // Init legend Node
        this.setLegend()
    }


    // Setters
    setFilters() {
        this.filterGroup = new FilterGroup(this.filters, this.name)

        if (!this.isZoomAvailable()) {
            this.filterGroup.togglePlaceholder(true)
        }
    }

    setLabels() {
        // Wrap labels into a pane group so we can use cleaflet clearLayers() method
        this.labelGroup = L.layerGroup().addTo(this.map)

        // Create pane
        this.labelPane = this.map.createPane(`${this.key}-label`)

        // Set pane z-index
        this.labelPane.style.zIndex = baseZIndex + parseInt(this.zIndex) + 1
    }

    setLegend() {
        this.legendNode = document.getElementById('mapV2__legend')
    }


    // Getters
    isZoomAvailable() {
        return this.getZoomAvailable() ? true : false
    }

    getZoomAvailable() {
        const zoom = this.map.getZoom()

        return this.url.find((_obj) => _obj.zoom_available.includes(zoom))
    }

    getUrl() {
        let params = {}
        const bbox = this.map.getBounds().toBBoxString()
        const zoom = this.map.getZoom()

        // Get url based on zoom level
        let url = this.getZoomAvailable().value

        if (this.isOptimized) {
            params.in_bbox = bbox
            params.zoom = zoom
        }

        // Loop through url params
        if (this.urlParams)
            Object.entries(this.urlParams).map(([key, value]) => params = isEmpty(value) ? params : { ...params, [key]: value })

        // Build url
        Object.keys(params).map((key, index) => {
            url += `${index === 0 ? '?' : '&'}${key}=${params[key]}`
        })

        return url
    }


    // Actions
    createPane() {
        // Create pane
        this.pane = this.map.createPane(this.key)

        // Set pane z-index
        this.pane.style.zIndex = baseZIndex + parseInt(this.zIndex)

        // Set default visibility
        this.togglePane(this.isVisible && this.isZoomAvailable())

        // Set default opcacity
        this.changeOpacity(this.opacity)
    }

    togglePane(_value) {
        this.pane.style.display = _value ? 'block' : 'none'
    }

    toggleLabelPane(_value) {
        this.labelPane.style.display = _value ? 'block' : 'none'
    }

    changeOpacity(_value) {
        this.opacity = _value

        this.pane.style.opacity = this.opacity
    }

    clearLayer() {
        // Remove data from layer
        this.layer.clearLayers()

        // Clear label group
        if (this.label && this.labelGroup && this.labelGroup.clearLayers)
            this.labelGroup.clearLayers()
    }
}
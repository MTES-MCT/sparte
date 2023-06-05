import * as L from 'leaflet'
import Layer from './layer.js'
import Style from './style.js'
import isEqual from 'lodash/isEqual'
import { debounce, formatData } from './utils.js'

export default class GeoJSONLayer extends Layer {
    constructor(_options = {}) {
        super(_options)

        this.setLayer()
    }


    // Setters
    setLayer() {
        // Set filters
        this.setFilters()

        // Create pane
        this.createPane()

        // Create layer
        this.createLayer()

        // Set labels
        if (this.label)
            this.setLabels()

        // Set data
        if (this.isVisible && this.isZoomAvailable()) {
            this.setData()
        }
    }

    setFlags() {
        // Flag last data bbox
        this.lastDataBbox = this.map.getBounds().toBBoxString()

        // Flag last data url params
        this.lastDataUrlParams = JSON.parse(JSON.stringify(this.urlParams))
    }

    setFeatures() {
        this.layer.eachLayer((_layer) => {
            // Define
            let legend

            // Set feature layer style
            this.setStyleInstance(_layer)

            // Create label
            let label
            if (this.label)
                label = this.createLabel(_layer)

            // Create tooltip
            if (["zones-urbaines"].includes(_layer.options.pane)) {
                _layer.bindTooltip('Cliquer pour explorer', {
                    sticky: true,
                    opacity: 0.9,
                    offset: [15, 0]
                })
            }

            _layer.on('click', (_event) => {
                if (["zones-urbaines"].includes(_layer.options.pane)) {
                    // Center layer on map
                    // const latlng = this.map.mouseEventToLatLng(_event.originalEvent)
                    // this.map.panTo(latlng)

                    const url = `/project/${this.projectId}/carte/detail-zone-urbaine/${_layer.feature.properties.id}`

                    const htmxContent = `<div hx-get="${url}" hx-trigger="load" class="tab-item"><div class="fr-custom-loader-min htmx-indicator"></div></div>`

                    let dataTab = this.tabs.getTab('data')
                    if (dataTab.hidden)
                        this.tabs.toggle('data')

                    dataTab.innerHTML = htmxContent
                    htmx.process(dataTab)
                }
            })

            // Mouse events 
            _layer.on('mouseover', () => {
                // create legend
                if (this.legend.length > 0)
                    legend = this.createLegend(_layer)

                if (legend) {
                    // Display legend
                    this.legendNode.innerHTML = legend
                    this.legendNode.classList.add('visible')
                }

                _layer.bringToFront()

                // Highlight style
                _layer.setStyle(_layer.styleInstance.highlight)

                if (this.label)
                    label._icon.style.color = '#ffffff'
            })

            _layer.on('mouseout', () => {
                if (legend) {
                    // Hide legend
                    this.legendNode.innerHTML = null
                    this.legendNode.classList.remove('visible')
                }

                _layer.setStyle(_layer.styleInstance.style)

                if (this.label)
                    label._icon.style.color = _layer.styleInstance.style.color
            })
        })
    }

    setStyleInstance(_layer) {
        _layer.styleInstance = new Style({
            styleKey: this.styleKey,
            feature: _layer.feature
        })

        _layer.setStyle(_layer.styleInstance.style)
    }

    async setData() {
        // Get data
        const data = await this.getData()
        
        this.setFlags()

        // Clear layers
        this.layer.clearLayers()

        if (this.label)
            this.labelGroup.clearLayers()

        // Set new data
        if (data) {
            this.layer.addData(data)
            this.setFeatures()
        }
    }


    // Actions
    createLayer() {
        // create empty layer and link to the pane
        this.layer = L.geoJSON(null, {
            pane: this.key,
            interactive: this.isInteractive
        })

        this.layer.addTo(this.map)
    }

    createLabel(_layer) {
        // Extract label position
        let coords = _layer.feature.properties?.label_center?.match(/\(.*?\)/g).map(x => x.replace(/[()]/g, "")).pop().split(' ') || _layer.getBounds().getCenter();
        coords = {
            lat: coords[1],
            lng: coords[0]
        }

        let label = L.marker(coords, {
            pane: this.labelPane,
            icon: L.divIcon({
                className: 'map-label',
                html: _layer.feature.properties[this.label.key],
                iconSize: [0, 0],
            }),
            interactive: false,
            bubblingMouseEvents: true,
        })

        // Add label to label group
        this.labelGroup.addLayer(label)

        // Set label color
        label._icon.style.color = _layer.styleInstance.style.color

        return label
    }

    createLegend(_layer) {
        let legend = '<div class="d-flex align-items-center">'

        this.legend.map((_obj) => {
            const value =
                _layer.options.pane === "ocs-ge" && _layer.options.key === "style_ocsge_couverture" && (_obj.key === "code_usage" || _obj.key === "usage_label") || _layer.options.pane === "ocs-ge" && _layer.options.key === "style_ocsge_usage" && (_obj.key === "code_couverture" || _obj.key === "couverture_label") ? null
                    : _obj.formatter ? formatData(_obj.formatter[0], _obj.formatter[1], _layer.feature.properties[_obj.key])
                        : _layer.feature.properties[_obj.key]

            if (value)
                legend += `<div class="fr-mr-2w"><strong>${_obj.name}</strong>: ${value}</div>`
        })

        legend += '</div>'

        return legend
    }

    async getData() {
        // Get url
        const url = this.getUrl()

        if (!url)
            return null

        try {
            const response = await fetch(url)
            const data = await response.json()

            return data
        } catch (error) {
            console.log(error)
        }
    }

    toggleVisibile(_value) {
        this.isVisible = _value

        this.toggleLayer(_value)
    }

    async toggleLayer(_value) {
        if (_value) {
            if (!this.lastDataBbox || this.isOptimized && this.lastDataBbox !== this.map.getBounds().toBBoxString() || this.isOptimized && !isEqual(this.urlParams, this.lastDataUrlParams)) {
                await this.setData()
            }
        }

        this.togglePane(_value)

        if (this.label)
            this.toggleLabelPane(_value)
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

    updateData = debounce((_value, _param) => {
        this.urlParams[_param] = _value

        if (!this.isVisible)
            return

        this.setData()
    }, 1000)

    async update() {
        this.filterGroup.togglePlaceholder(!this.isZoomAvailable())
        this.toggleLayer(this.isZoomAvailable() && this.isVisible)
    }
}
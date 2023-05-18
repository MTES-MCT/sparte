import * as L from 'leaflet'
import Layer from './layer.js'
import FilterGroup from './filter-group.js'
import { debounce } from './utils.js'

export default class SparteMap {
    constructor(_options = {}) {
        window.sparteMap = this

        this.targetElement = _options.targetElement
        this.debug = _options.debug
        this.mapCenter = _options.mapCenter
        this.defaultZoom = _options.defaultZoom
        this.layerList = _options.layerList
        this.couv_leafs = _options.couv_leafs
        this.usa_leafs = _options.usa_leafs
        this.projectId = _options.projectId
        this.filterList = [
            {
                "group_name": "",
                "filters": [
                    {
                        "name": "Emprise du territoire",
                        "type": "visible",
                        "value": true,
                        "triggers": [
                            {
                                "method": "toggleVisibile",
                                "layer": "emprise-du-territoire"
                            }
                        ]
                    },
                ]
            },
            {
                "group_name": "",
                "filters": [
                    {
                        "name": "OCS GE",
                        "type": "visible",
                        "value": true,
                        "triggers": [
                            {
                                "method": "toggleVisibile",
                                "layer": "ocs-ge"
                            }
                        ]
                    },
                    {
                        "name": "Nomemclature",
                        "type": "select",
                        "value": "style_ocsge_couv",
                        "options": [
                            {
                                "name": "Couverture",
                                "value": "style_ocsge_couv",
                            },
                            {
                                "name": "Usage",
                                "value": "style_ocsge_usage",
                            }
                        ],
                        "triggers": [
                            {
                                "method": "toggleOCSGEStyle",
                                "layer": "ocs-ge"
                            }
                        ]
                    },
                    {
                        "name": "Millésime",
                        "type": "select",
                        "value": 2019,
                        "options": [
                            {
                                "name": 2016,
                                "value": 2016,
                            },
                            {
                                "name": 2019,
                                "value": 2019,
                            }
                        ],
                        "triggers": [
                            {
                                "method": "updateData",
                                "param": "year",
                                "layer": "ocs-ge"
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "",
                "filters": [
                    {
                        "name": "Zonages des documents d'urbanisme",
                        "type": "visible",
                        "value": true,
                        "triggers": [
                            {
                                "method": "toggleVisibile",
                                "layer": "zones-urbaines"
                            }
                        ]
                    },
                    {
                        "name": "",
                        "type": "tag",
                        "value": ["AUc", "AUs", "U", "Ah", "Nd", "A", "N", "Nh"],
                        "options": [
                            {
                                "name": "U",
                                "value": "U",
                            },
                            {
                                "name": "Ah",
                                "value": "Ah",
                            },
                            {
                                "name": "Nd",
                                "value": "Nd",
                            },
                            {
                                "name": "A",
                                "value": "A",
                            },
                            {
                                "name": "AUc",
                                "value": "AUc",
                            },
                            {
                                "name": "N",
                                "value": "N",
                            },
                            {
                                "name": "Nh",
                                "value": "Nh",
                            },
                            {
                                "name": "AUs",
                                "value": "AUs",
                            }
                        ],
                        "triggers": [
                            {
                                "method": "updateData",
                                "param": "type_zone",
                                "layer": "zones-urbaines"
                            }
                        ]
                    }
                ],
            }
        ]

        if (!this.targetElement) {
            console.warn('Missing \'targetElement\' property')
            return
        }

        this.setConfig()
        this.setMap()
        this.setLayers()
        this.setPanel()
        this.setFilters()

        if (this.debug)
            this.setDebug()
    }

    setDebug() {
        this.debugPanel = document.getElementById("debug-tab")
        this.debugPanel.innerHTML = '<strong>Mode Debug activé</strong>'

        // Display size
        this.debugPanelSize = document.createElement('div')
        this.debugPanelSize.innerHTML = `<strong>Size:</strong> w ${this.config.width} x h ${this.config.height}`
        this.debugPanel.appendChild(this.debugPanelSize)

        // Display bounds
        this.debugPanelBounding = document.createElement('div')
        this.debugPanel.appendChild(this.debugPanelBounding)

        // Display zoom level
        this.debugPanelZoom = document.createElement('div')
        this.debugPanel.appendChild(this.debugPanelZoom)

        // Refresh layers option
        this.debugPanelRefreshLayers = document.createElement('div')

        this.refreshLayersControl = document.createElement('input')
        this.refreshLayersControl.className = 'fr-mr-1w'
        this.refreshLayersControl.type = 'checkbox'
        this.refreshLayersControl.name = 'refresh'
        this.refreshLayersControl.value = 'refresh'
        this.refreshLayersControl.id = 'refresh'
        this.refreshLayersControl.checked = true

        let label = document.createElement('label')
        label.htmlFor = 'Refresh layers'
        label.appendChild(document.createTextNode('refresh'))
        this.debugPanelRefreshLayers.appendChild(this.refreshLayersControl)
        this.debugPanelRefreshLayers.appendChild(label)
        this.debugPanel.appendChild(this.debugPanelRefreshLayers)

        this.refreshLayersControl.addEventListener('change', (_event) => {
            if (_event.target.checked) {
                this.layers.map((_obj) => {
                    _obj.update()
                })
            }
        })

        // Debug events tracking
        this.map.on('moveend', () => {
            this.debugPanelZoom.innerHTML = `<strong>Zoom level:</strong> ${this.map.getZoom()}`
            this.debugPanelBounding.innerHTML = `<strong>Bounds:</strong> SW ${this.map.getBounds().getSouthWest().toString()}, NE ${this.map.getBounds().getNorthEast().toString()}`
        })
    }

    setConfig() {
        this.config = {}

        // Width and height
        const boundings = this.targetElement.getBoundingClientRect()
        this.config.width = boundings.width
        this.config.height = boundings.height || window.innerHeight
    }

    setMap() {
        this.map = L.map(this.targetElement.id, {
            center: this.mapCenter,
            zoom: this.defaultZoom,
            minZoom: 6,
            doubleClickZoom: false,
        })

        // Position zoom control
        // this.map.zoomControl.setPosition('bottomleft')

        // Set max bounds
        let southWest = L.latLng(41.650542, -6.855469),
            northEast = L.latLng(51.830852, 13.359375),
            bounds = L.latLngBounds(southWest, northEast)
        this.map.setMaxBounds(bounds)

        // Get IGN tiles
        L.tileLayer(
            'https://wxs.ign.fr/{ignApiKey}/geoportail/wmts?' +
            '&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&TILEMATRIXSET=PM' +
            '&LAYER={ignLayer}&STYLE={style}&FORMAT={format}' +
            '&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}', {
            attribution: '<a target="_blank" href="https://www.geoportail.gouv.fr/">Geoportail France</a>',
            ignApiKey: 'ortho',
            ignLayer: 'ORTHOIMAGERY.ORTHOPHOTOS',
            style: 'normal',
            format: 'image/jpeg',
            service: 'WMTS'
        }
        ).addTo(this.map)

        this.map.on('moveend', debounce(() => this.moveend(), 1000))
    }

    setPanel() {
        const tabs = document.querySelector('.tabs')
        const tabButtons = tabs.querySelectorAll('[role="tab"]')
        const tabPanels = tabs.querySelectorAll('[role="tabpanel"]')

        tabButtons.forEach(button => button.addEventListener('click', (_event) => {
            // find the associated tabPanel
            const { id } = _event.currentTarget
            const tabPanel = tabs.querySelector(`[aria-labelledby="${id}"]`)
            const isAlreadyOpen = !tabPanel.hidden

            // hide all tab panels
            tabPanels.forEach(panel => {
                panel.hidden = true
            })

            // mark all tabs as unselected
            tabButtons.forEach(tab => {
                tab.setAttribute('aria-selected', false)
            })

            if (!isAlreadyOpen) {
                // mark the clicked tab as selected
                _event.currentTarget.setAttribute('aria-selected', true)

                // find the associated tabPanel and show it
                tabPanel.hidden = false
            }
        }))
    }

    setLayers() {
        this.layers = []

        this.layerList.map((_obj) => {
            const layer = new Layer(_obj)
            this.layers.push(layer)
        })
    }

    setFilters() {
        this.filterList.map((_obj) => {
            new FilterGroup(_obj)
        })
    }

    moveend() {
        if (this.layers)
            this.layers.map((_obj) => {
                if (this.debug && !this.refreshLayersControl.checked)
                    return
                
                _obj.update()
            })
    }
}

// Add SparteMap object to the window scope
window.SparteMap = SparteMap

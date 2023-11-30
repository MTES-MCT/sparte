import { formatData } from './utils.js'

export default class Events {
    constructor(_options = {}, _layer, _source) {
        this.mapLibre = window.mapLibre
        this.map = this.mapLibre.map
        this.tabs = this.mapLibre.tabs

        this.events = _options
        this.layer = _layer
        this.source = _source

        this.hoveredPolygonId = null

        this.setEvents()
    }

    // Setters
    setEvents() {
        this.events.map((_obj) => {
            this.map.on(_obj.type, this.layer, (_event) => {
                _obj.triggers.map((__obj) => {
                    this[__obj.method](_event, __obj.options)
                })
            })
        })
    }

    setInfoBox() {
        this.infoBoxNode = document.getElementById(`info-box-${this.source}`)
        this.infoBoxNode = document.createElement('div')
        this.infoBoxNode.id = `info-box-${this.source}`
        this.infoBoxNode.classList.add('info-box')

        this.mapLibre.infosBoxNode.appendChild(this.infoBoxNode)
    }

    // Actions
    hoverEffectIn(_event) {
        if (_event.features.length > 0) {
            if (this.hoveredPolygonId !== null) {
                this.map.setFeatureState(
                    { source: this.source, id: this.hoveredPolygonId },
                    { hover: false }
                )
            }

            this.hoveredPolygonId = _event.features[0].id

            this.map.setFeatureState(
                { source: this.source, id: this.hoveredPolygonId },
                { hover: true }
            )
        }
    }

    hoverEffectOut(_event) {
        if (this.hoveredPolygonId !== null) {
            this.map.setFeatureState(
                { source: this.source, id: this.hoveredPolygonId },
                { hover: false }
            )
        }

        this.hoveredPolygonId = null
    }

    showInfoBox(_event, _options) {
        if (!this.infoBoxNode)
            this.setInfoBox()

        if (_event.features.length > 0) {
            let info = `<div class="info-box__title"><strong>${_options.title}</strong><i class='bi bi-info-circle'></i></div>`

            _options.properties.map((_obj) => {
                if (_event.features[0].properties[_obj.key])
                {
                    const value = _obj.formatter ? formatData(_obj.formatter[0], _obj.formatter[1], _event.features[0].properties[_obj.key]) : _event.features[0].properties[_obj.key]
                    info += `<div class="fr-mr-2w"><strong>${_obj.name}</strong>: ${value}</div>`
                }
            })

            this.infoBoxNode.innerHTML = info

            this.infoBoxNode.classList.add("visible")
        }
    }

    showArtifInfoBox(_event, _options) {
        if (!this.infoBoxNode)
            this.setInfoBox()

        if (_event.features.length > 0) {
            this.infoBoxNode.innerHTML = `<div class="info-box__title"><strong>${_options.title}</strong><i class='bi bi-info-circle'></i></div>
                <ul class="fr-badge-group">
                    <li><p class="fr-badge fr-badge--${_event.features[0].properties['is_new_artif'] ? 'error' : 'success'} fr-badge--sm fr-badge--no-icon text-capitalize">${_event.features[0].properties['is_new_artif'] ? 'Artificialiation' : 'Renaturation'}</p></li>
                    <li><p class="fr-badge fr-badge--blue-ecume fr-badge--sm fr-badge--no-icon text-capitalize">Surface:&nbsp;<strong>${formatData("number", ["fr-FR", "unit", "hectare", 3], _event.features[0].properties['surface'])}</strong></p></li>
                </ul>
                <table class="table table-striped table-sm table-borderless table-custom">
                    <thead>
                        <tr>
                            <th scope="col" class="fr-text--xs">Millésime</th>
                            <th scope="col" class="fr-text--xs">Couverture</th>
                            <th scope="col" class="fr-text--xs">Usage</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="fr-text--xs">${_event.features[0].properties['year_old']}</td>
                            <td class="fr-text--xs"><div class="text-truncate">${_event.features[0].properties['cs_old']}</div></td>
                            <td class="fr-text--xs"><div class="text-truncate">${_event.features[0].properties['us_new']}</div></td>
                        </tr>
                        <tr>
                            <td class="fr-text--xs">${_event.features[0].properties['year_new']}</td>
                            <td class="fr-text--xs"><div class="text-truncate">${_event.features[0].properties['cs_new']}</div></td>
                            <td class="fr-text--xs"><div class="text-truncate">${_event.features[0].properties['us_new']}</div></td>
                        </tr>
                    </tbody>
                </table>`

            this.infoBoxNode.classList.add("visible")
        }
    }

    hideInfoBox(_event) {
        this.infoBoxNode.classList.remove("visible")
    }

    displayFeatureData(_event, _options) {
        if (_event.features.length > 0) {
            const url = _options.data + _event.features[0].properties.id
            const htmxContent = `<div hx-get="${url}" hx-trigger="load" class="tab-item"><div class="fr-custom-loader-min htmx-indicator"></div></div>`

            let dataTab = this.tabs.getTab('data')
            if (dataTab.hidden)
                this.tabs.toggle('data')

            dataTab.innerHTML = htmxContent
            htmx.process(dataTab)
        }
    }
}

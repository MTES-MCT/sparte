export default class Events {
    constructor(_options = {}, _source) {
        this.mapLibre = window.mapLibre
        this.map = this.mapLibre.map

        this.events = _options
        this.source = _source

        this.hoveredPolygonId = null

        this.setEvents()
    }

    // Setters
    setEvents() {
        this.events.map((_obj) => {
            this.map.on(_obj.type, _obj.layer, (_event) => {
                _obj.methods.map((__obj) => {
                    this[__obj.key](_event, __obj.title, __obj.properties)
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
        if(_event.features.length > 0) {
            if(this.hoveredPolygonId !== null) {
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
        if(this.hoveredPolygonId !== null) {
            this.map.setFeatureState(
                { source: this.source, id: this.hoveredPolygonId },
                { hover: false }
            )
        }
        
        this.hoveredPolygonId = null
    }

    showInfoBox(_event, _title, _properties) {
        if (!this.infoBoxNode)
            this.setInfoBox()
        
            if(_event.features.length > 0) {
            let info = `<div class="info-box__title"><strong>${_title}</strong><i class='bi bi-info-circle'></i></div>`
            
            _properties.map((_obj) => {
                if (_event.features[0].properties[_obj.key])
                    info += `<div class="fr-mr-2w"><strong>${_obj.name}</strong>: ${_event.features[0].properties[_obj.key]}</div>`
            })

            this.infoBoxNode.innerHTML = info

            this.infoBoxNode.classList.add("visible")
        }
    }

    hideInfoBox(_event) {
        this.infoBoxNode.classList.remove("visible")
    }

    // showPopup(_event, _data) {
    //     this.mapLibre.popup
    //         .setLngLat(_event.features[0].properties.label_center.match(/\(.*?\)/g).map(x => x.replace(/[()]/g, "")).pop().split(' '))
    //         .setHTML(_event.features[0].properties.libelle)
    //         .addTo(this.map);
    // }
}
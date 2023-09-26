import Filter from './filter.js'
import { slugify, isInRange } from './utils.js'

export default class FilterGroup {
    constructor(_name, _source, _options = {}) {
        this.mapLibre = window.mapLibre

        this.name = _name
        this.slug = slugify(this.name)
        this.source = _source
        this.filters = _options

        this.setFilterGroup()
    }

    setFilterGroup() {
        this.tabNode = document.getElementById('layer-tab')
        this.groupNode = document.createElement('div')
        this.groupHeaderNode = document.createElement('div')
        this.groupContentNode = document.createElement('div')

        this.groupNode.classList.add('filter-group', 'tab-item')
        this.groupHeaderNode.classList.add('filter-group__header')
        this.groupContentNode.classList.add('filter-group__accordion')

        // Create title node
        this.titleNode = document.createElement('span')
        this.titleNode.innerHTML = `<span>${this.name}</span>`

        // Create options button node
        this.buttonNode = document.createElement('button')
        this.buttonNode.classList.add('fr-btn', 'fr-btn--tertiary', 'fr-btn--sm')
        this.buttonNode.innerHTML = '<i class="bi bi-gear"></i>'
        this.buttonNode.setAttribute('aria-expanded', false)
        this.buttonNode.setAttribute('aria-controls', `accordion-${this.slug}`)
        this.buttonNode.onclick = () => {
            let expanded = this.groupHeaderNode.getAttribute('aria-expanded') === 'true' || false
            this.groupHeaderNode.classList.toggle('active')
            this.groupHeaderNode.setAttribute('aria-expanded', !expanded)
            this.groupContentNode.setAttribute('aria-hidden', expanded)
        }

        // Create placeholder layer not available
        this.placeholderNode = document.createElement('div')
        this.placeholderNode.classList.add('filter-placeholder', 'tab-item')
        this.placeholderNode.innerHTML = `<div>Le calque <strong>${this.name}</strong> n'est pas disponible pour ce niveau de zoom.</div>`

        this.groupHeaderNode.appendChild(this.titleNode)
        this.groupHeaderNode.appendChild(this.buttonNode)
        this.groupNode.appendChild(this.groupHeaderNode)
        this.groupNode.appendChild(this.placeholderNode)

        this.groupContentNode.id = `accordion-${this.slug}`
        this.groupContentNode.setAttribute('aria-hidden', 'true')
        this.filters.map((_obj) => {
            new Filter(_obj, this.groupContentNode)
        })
        this.groupNode.appendChild(this.groupContentNode)

        this.tabNode.appendChild(this.groupNode)
    }

    sourceData(_loaded) {
        const iconNode = this.buttonNode.querySelector('i')
        if(_loaded) {
            this.buttonNode.classList.remove('btn--map-loading')
            iconNode.classList.add('bi', 'bi-gear')
            iconNode.classList.remove('spinner-border', 'spinner-border-sm')
        }
        else {
            this.buttonNode.classList.add('btn--map-loading')
            iconNode.classList.remove('bi', 'bi-gear')
            iconNode.classList.add('spinner-border', 'spinner-border-sm')
        }
    }

    update() {
        const source = this.mapLibre.sources.find((_obj) => _obj.key === this.source)
        if (isInRange(this.mapLibre.map.getZoom(), source.minZoom, source.maxZoom)) {
            this.placeholderNode.style.visibility = 'hidden'
            this.placeholderNode.style.opacity = 0
        }
        else {
            this.placeholderNode.style.visibility = 'visible'
            this.placeholderNode.style.opacity = 1            
        }
    }
}

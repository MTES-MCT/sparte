import Filter from './filter.js'
import { slugify } from './utils.js'

export default class FilterGroup {
    constructor(_name, _options = {}) {
        this.mapLibre = window.mapLibre

        this.name = _name
        this.slug = slugify(this.name)
        this.filters = _options

        this.setFilterGroup()
    }

    setFilterGroup() {
        let tabNode = document.getElementById('layer-tab')
        let groupNode = document.createElement('div')
        let groupHeaderNode = document.createElement('div')
        let groupContentNode = document.createElement('div')

        groupNode.classList.add('filter-group', 'tab-item')

        groupHeaderNode.classList.add('filter-group__header')
        groupHeaderNode.innerHTML = `<span>${this.name}</span><button class="fr-btn fr-btn--tertiary fr-btn--sm" aria-expanded="false" aria-controls="accordion-${this.slug}"><i class="bi bi-gear"></i></button>`
        groupHeaderNode.onclick = function() {
            let expanded = this.getAttribute('aria-expanded') === 'true' || false
            this.classList.toggle('active')
            this.setAttribute('aria-expanded', !expanded)
            groupContentNode.setAttribute('aria-hidden', expanded)
        }
        groupNode.appendChild(groupHeaderNode)

        groupContentNode.classList.add('filter-group__accordion')
        groupContentNode.id = `accordion-${this.slug}`
        groupContentNode.setAttribute('aria-hidden', 'true')
        this.filters.map((_obj) => {
            new Filter(_obj, groupContentNode)
        })
        groupNode.appendChild(groupContentNode)

        tabNode.appendChild(groupNode)
    }

    // setFilterGroup() {
    //     const tabNode = document.getElementById('layer-tab')

    //     let groupNode = document.createElement('div')
    //     groupNode.classList.add('filter-group', 'tab-item')

    //     // Add placeholder div layer not available
    //     // this.placeholderNode = document.createElement('div')
    //     // this.placeholderNode.classList.add('filter-placeholder', 'tab-item')
    //     // this.placeholderNode.innerHTML = `${this.name} non disponible pour ce niveau de zoom.`
    //     // groupNode.appendChild(this.placeholderNode)

    //     Object.values(this.filters).map((_obj) => {
    //         new Filter(_obj, groupNode)
    //     })

    //     tabNode.appendChild(groupNode)
    // }

    // togglePlaceholder(_value) {
    //     this.placeholderNode.style.visibility = _value ? 'visible' : 'hidden'
    //     this.placeholderNode.style.opacity = _value ? 1 : 0
    // }
}

import Filter from './filter.js'

export default class FilterGroup {
    constructor(_options = {}, _name) {
        this.sparteMap = window.sparteMap

        this.filters = _options
        this.name = _name

        this.setFilterGroup()
    }

    setFilterGroup() {
        const tabNode = document.getElementById('layer-tab')

        let groupNode = document.createElement('div')
        groupNode.classList.add('filter-group', 'tab-item')

        // Add placeholder div layer not available
        this.placeholderNode = document.createElement('div')
        this.placeholderNode.classList.add('filter-placeholder', 'tab-item')
        this.placeholderNode.innerHTML = `${this.name} non disponible pour ce niveau de zoom.`
        groupNode.appendChild(this.placeholderNode)

        Object.values(this.filters).map((_obj) => {
            new Filter(_obj, groupNode)
        })

        tabNode.appendChild(groupNode)
    }

    togglePlaceholder(_value) {
        this.placeholderNode.style.visibility = _value ? 'visible' : 'hidden'
        this.placeholderNode.style.opacity = _value ? 1 : 0
    }
}

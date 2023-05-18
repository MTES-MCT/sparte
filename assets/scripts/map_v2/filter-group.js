import Filter from './filter.js'

export default class FilterGroup {
    constructor(_options = {}) {
        this.sparteMap = window.sparteMap
        this.layers = this.sparteMap.layers

        this.group_name = _options.group_name
        this.filters = _options.filters

        this.setFilterGroup()
    }

    setFilterGroup() {
        const tabNode = document.getElementById('layer-tab')

        let groupNode = document.createElement('div')
        groupNode.classList.add('filter-group', 'tab-item')

        if (this.group_name) {
            let groupNameNode = document.createElement('div')
            groupNameNode.classList.add('filter-group--name')
            groupNameNode.innerHTML = this.group_name
            groupNode.appendChild(groupNameNode)
        }

        this.filters.map((_obj) => {
            new Filter(_obj, groupNode)
        })

        tabNode.appendChild(groupNode)
    }
}

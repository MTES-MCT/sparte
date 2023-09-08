export default class Filter {
    constructor(_options = {}, groupNode) {
        this.sparteMap = window.sparteMap
        this.layers = window.sparteMap.layers

        this.name = _options.name
        this.triggers = _options.triggers
        this.type = _options.type
        this.options = _options.options
        this.value = _options.value === 'true' ? true : _options.value === 'false' ? false : _options.value
        this.groupNode = groupNode

        this.setFilter()
    }

    setFilter() {
        switch (this.type) {
            case 'visible':
                this.groupNode.appendChild(this.CreateFilterVisible())
                break
            case 'select':
                this.groupNode.appendChild(this.CreateFilterSelect())
                break
            case 'tag':
                this.groupNode.appendChild(this.CreateFilterTag())
                break
             case 'opacity':
                this.groupNode.appendChild(this.CreateFilterOpacity())
                break
            default:
                console.log(`Unknow filter type '${this.type}' for layer '${this.name}'`);
        }
    }

    CreateFilterOpacity() {
        // Create filter node
        let filter = document.createElement('div')
        filter.classList.add('filter-group__filter')
        if (this.name)
            filter.innerHTML = this.name

        // Create input range
        let input = document.createElement('input')
        input.type = 'range'
        input.min = 0
        input.max = 1
        input.step = 0.1

        // Add change event
        input.addEventListener('input', (_event) => {
            this.value = _event.target.value

            // Triggers layer methods
            this.triggers.map((_obj) => {
                const layer = this.layers.find((__obj) => __obj.key === _obj.layer)
                layer[`${_obj.method}`](this.value)
            })
        })

        filter.appendChild(input)

        // Set default value
        input.value = this.value

        return filter
    }

    CreateFilterVisible() {
        // Create filter node
        let filter = document.createElement('div')
        filter.classList.add('filter-group__filter')
        if (this.name)
            filter.innerHTML = this.name

        // Create button
        let button = document.createElement('button')
        button.classList.add('fr-btn', 'fr-btn--tertiary', 'fr-btn--sm')
        button.innerHTML = `<i class="bi ${this.value ? 'bi-eye' : 'bi-eye-slash'}"></i>`
        
        // Add click event
        button.addEventListener('click', (_event) => {
            button.querySelector('i').classList.toggle('bi-eye')
            button.querySelector('i').classList.toggle('bi-eye-slash')
            
            this.value = !this.value

            // Triggers layer methods
            this.triggers.map((_obj) => {
                const layer = this.layers.find((__obj) => __obj.key === _obj.layer)
                layer[`${_obj.method}`](this.value)
            })
        })

        filter.appendChild(button)

        return filter
    }

    CreateFilterSelect() {
        // Create filter node
        let filter = document.createElement('div')
        filter.classList.add('filter-group__filter')
        if (this.name)
            filter.innerHTML = this.name

        // Create Select
        let select = document.createElement('select')
        select.classList.add('fr-btn', 'fr-btn--tertiary', 'fr-btn--sm')
        
        this.options.map((_obj) => {
            let option = document.createElement('option')
            option.value = _obj.value
            option.text = _obj.name
            if (this.value == _obj.value)
                option.setAttribute('selected', 'selected')
            select.appendChild(option)
        })
        
        // Add change event
        select.addEventListener('change', (_event) => {
            this.value = _event.target.value

            // Triggers layer methods
            this.triggers.map((_obj) => {
                const layer = this.layers.find((__obj) => __obj.key === _obj.layer)
                layer[`${_obj.method}`](this.value, _obj.param)
            })
        })

        filter.appendChild(select)

        return filter
    }

    CreateFilterTag() {
        // Create filter node
        let filter = document.createElement('div')
        filter.classList.add('filter-group__filter')
        if (this.name)
            filter.innerHTML = this.name

        // Create Tags
        this.options.map((_obj) => {
            let tag = document.createElement('button')
            tag.classList.add('fr-tag', 'fr-tag--sm')
            tag.innerHTML = _obj.name
            tag.dataset.value = _obj.value
            tag.setAttribute('aria-pressed', this.value.includes(_obj.value))

            // Add click event
            tag.addEventListener('click', (_event) => {
                const value = _event.target.dataset.value

                // Update filter value
                if(!this.value.includes(value))
                    this.value.push(value)
                else
                    this.value.splice(this.value.indexOf(value), 1)
                
                // Triggers layer methods
                this.triggers.map((_obj) => {
                    const layer = this.layers.find((__obj) => __obj.key === _obj.layer)
                    layer[`${_obj.method}`](this.value, _obj.param)
                })
            })

            filter.appendChild(tag)
        })

        return filter
    }
}

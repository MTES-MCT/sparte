export default class Filter
{
  constructor(_options, groupNode)
  {
    this.mapLibre = window.mapLibre
    this.map = this.mapLibre.map

    this.name = _options.name
    this.triggers = _options.triggers
    this.type = _options.type
    this.value = _options.value
    this.options = _options.options

    this.groupNode = groupNode

    this.setFilter()
  }

  setFilter()
  {
    switch (this.type)
    {
      case 'visibility':
        this.groupNode.appendChild(this.CreateFilterVisibility())
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
        console.log(`Unknow filter type '${this.type}' for layer '${this.name}'`)
    }
  }

  CreateFilterOpacity()
  {
    // Create filter node
    const filter = document.createElement('div')
    filter.classList.add('filter-group__filter')
    if (this.name) filter.innerHTML = this.name

    // Create input range
    const input = document.createElement('input')
    input.type = 'range'
    input.min = 0
    input.max = 100
    input.step = 1

    // Add change event
    input.addEventListener('input', (_event) =>
    {
      this.value = _event.target.value

      // Filter triggers actions
      this.triggerFilters(parseInt(this.value, 10) / 100)
    })

    filter.appendChild(input)

    // Set default value
    input.value = this.value

    return filter
  }

  CreateFilterVisibility()
  {
    // Create filter node
    const filter = document.createElement('div')
    filter.classList.add('filter-group__filter')
    if (this.name) filter.innerHTML = this.name

    // Create button
    const button = document.createElement('button')
    button.classList.add('fr-btn', 'fr-btn--tertiary', 'fr-btn--sm')
    button.innerHTML = `<i class="bi ${this.value ? 'bi-eye' : 'bi-eye-slash'}"></i>`

    // Add click event
    button.addEventListener('click', () =>
    {
      button.querySelector('i').classList.toggle('bi-eye')
      button.querySelector('i').classList.toggle('bi-eye-slash')

      this.value = this.value === 'visible' ? 'none' : 'visible'

      // Filter triggers actions
      this.triggerFilters(this.value)
    })

    filter.appendChild(button)

    return filter
  }

  CreateFilterSelect()
  {
    // Create filter node
    const filter = document.createElement('div')
    filter.classList.add('filter-group__filter')
    if (this.name) filter.innerHTML = this.name

    // Create Select
    const select = document.createElement('select')
    select.classList.add('fr-btn', 'fr-btn--tertiary', 'fr-btn--sm')

    this.options.forEach((_obj) =>
    {
      const option = document.createElement('option')
      option.value = _obj.value
      option.text = _obj.name
      if (this.value === _obj.value)
      {
        option.setAttribute('selected', 'selected')
        // Triggers default option
        this.triggerFilters(_obj['data-value'])
      }
      select.appendChild(option)
    })

    // Add change event
    select.addEventListener('change', (_event) =>
    {
      const option = this.options.find((_obj) => _obj.value === _event.target.value)
      this.triggerFilters(option['data-value'])
    })

    filter.appendChild(select)

    return filter
  }

  CreateFilterTag()
  {
    // Create filter node
    const filter = document.createElement('div')
    filter.classList.add('filter-group__filter')
    if (this.name) filter.innerHTML = this.name

    // Create Tags
    this.options.forEach((_obj) =>
    {
      const tag = document.createElement('button')
      tag.classList.add('fr-tag', 'fr-tag--sm')
      tag.innerHTML = _obj.name
      tag.dataset.value = _obj.value
      tag.setAttribute('aria-pressed', this.value.includes(_obj.value))

      // Add click event
      tag.addEventListener('click', (_event) =>
      {
        const { value } = _event.target.dataset

        // Update filter value
        if (!this.value.includes(value)) this.value.push(value)
        else this.value.splice(this.value.indexOf(value), 1)

        // Triggers actions
        this.triggerFilters(this.value)
      })

      filter.appendChild(tag)
    })

    return filter
  }

  triggerFilters(_value)
  {
    this.triggers.forEach((_trigger) =>
    {
      _trigger.items.map((_obj) => this[`${_trigger.method}`](_obj, _trigger.property, _value))
    })
  }

  filterByPropertyInArray(_item, _property, _value)
  {
    this.map.setFilter(_item, ['in', _property, ..._value])
  }

  changePaintProperty(_item, _property, _value)
  {
    this.map.setPaintProperty(_item, _property, _value)
  }

  changeLayoutProperty(_item, _property, _value)
  {
    this.map.setLayoutProperty(_item, _property, _value)
  }

  updateQueryString(_item, _property, _value)
  {
    console.log(_item, _property, _value)
    const source = this.mapLibre.sources.find((_obj) => _obj.key === _item)
    source.queryStrings.forEach((_obj) =>
    {
      _obj.value = _obj.key === _property ? _value : _obj.value
    })
    source.update()
  }

  toggleLegend(_item, _property)
  {
    this.legend = document.getElementById(_item)
    this.legend.classList.toggle(_property)
  }
}

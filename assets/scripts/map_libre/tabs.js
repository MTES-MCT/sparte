export default class Tabs
{
  constructor(_options = {})
  {
    this.mapLibre = window.mapLibre
    this.tabList = _options.tabList

    this.setTabs()
  }

  setTabs()
  {
    this.tabsNode = document.createElement('div')
    this.tabsNode.id = 'mapV2__panel'
    this.tabsNode.classList.add('tabs')

    this.buttonsNode = document.createElement('div')
    this.buttonsNode.classList.add('tablist')
    this.buttonsNode.style.pointerEvents = 'auto'
    this.buttonsNode.style.height = '100vh'
    this.buttonsNode.style.width = '50px'
    this.buttonsNode.setAttribute('role', 'tablist')
    this.buttonsNode.setAttribute('aria-label', 'Paramètres de la carte')

    this.tabsNode.appendChild(this.buttonsNode)

    this.mapLibre.targetElement.parentNode.insertBefore(
      this.tabsNode,
      this.mapLibre.targetElement.nextSibling,
    )

    this.tabList.map((_obj) => this.createTab(_obj))
  }

  createTab(_tab)
  {
    // Create button
    const buttonNode = document.createElement('button')
    buttonNode.id = _tab.id
    buttonNode.setAttribute('role', 'tab')
    buttonNode.setAttribute('aria-selected', 'false')
    buttonNode.innerHTML = `<i class="bi ${_tab.iconClass}"></i>`

    this.buttonsNode.appendChild(buttonNode)

    buttonNode.addEventListener('click', (_event) =>
    {
      const { id } = _event.currentTarget

      this.toggle(id)
    })

    // Create tab
    const tabNode = document.createElement('div')
    tabNode.style.width = '50vw'
    tabNode.style.height = '100vh'
    tabNode.style.right = '50px'
    tabNode.style.pointerEvents = 'auto'
    tabNode.id = `${_tab.id}-tab`
    tabNode.classList.add('tab')
    tabNode.setAttribute('role', 'tabpanel')
    tabNode.setAttribute('aria-labelledby', _tab.id)
    tabNode.hidden = true

    if (_tab.title)
    {
      const titleTabNode = document.createElement('div')
      titleTabNode.classList.add('tab-title', 'tab-item')
      titleTabNode.innerHTML = _tab.title

      tabNode.appendChild(titleTabNode)
    }

    this.tabsNode.appendChild(tabNode)
  }

  toggle(_id)
  {
    // Find the associated tab
    const tabNode = this.tabsNode.querySelector(`[aria-labelledby="${_id}"]`)
    const buttonNode = this.buttonsNode.querySelector(`#${_id}`)
    const isAlreadyOpen = !tabNode.hidden

    // Hide all tabs
    this.tabsNode.querySelectorAll('[role="tabpanel"]').forEach((_tabNode) =>
    {
      _tabNode.hidden = true
    })

    // Mark all buttons as unselected
    this.buttonsNode.querySelectorAll('[role="tab"]').forEach((_buttonNode) =>
    {
      _buttonNode.setAttribute('aria-selected', false)
    })

    if (!isAlreadyOpen)
    {
      // Mark the clicked button as selected
      buttonNode.setAttribute('aria-selected', true)

      // Show associated tab
      tabNode.hidden = false
    }
  }

  getTab(_id)
  {
    return this.tabsNode.querySelector(`[aria-labelledby="${_id}"]`)
  }

  onAdd()
  {
    return this.tabsNode
  }
}

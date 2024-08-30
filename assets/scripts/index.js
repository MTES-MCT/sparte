// Import styles
import '../styles/index.css'

// Import dsfr
import '@gouvfr/dsfr/dist/dsfr.module.min.js'

// Import map
import './map_libre/index.js'

import './react-roots.js'

// Import HTMX and inject it into the window scope
window.htmx = require('htmx.org')
// Fix CSP inline style
window.htmx.config.includeIndicatorStyles = false
// Disable Submit Button
window.htmx.defineExtension('disable-element', {
  onEvent(name, evt)
  {
    if (name === 'htmx:beforeRequest' || name === 'htmx:afterRequest')
    {
      const { elt } = evt.detail
      const target = elt.getAttribute('hx-disable-element')
      const targetElement = (target === 'self') ? elt : document.querySelector(target)

      if (name === 'htmx:beforeRequest' && targetElement)
      {
        targetElement.disabled = true
      }
      else if (name === 'htmx:afterRequest' && targetElement)
      {
        targetElement.disabled = false
      }
    }
  },
})

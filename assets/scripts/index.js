/*********************
 * TODO: WEBPACK Code splitting
 ********************/

// Import styles
import '/assets/styles/index.css';

// Import dsfr
import '@gouvfr/dsfr/dist/dsfr.module.min.js';

// Import HTMX and inject it into the window scope
window.htmx = require('htmx.org');
// Fix CSP inline style
window.htmx.config.includeIndicatorStyles = false;
// Disable Submit Button
window.htmx.defineExtension('disable-element', {
    onEvent: function (name, evt) {
        if (name === "htmx:beforeRequest" || name === "htmx:afterRequest") {
            let elt = evt.detail.elt;
            let target = elt.getAttribute("hx-disable-element");
            let targetElement = (target == "self") ? elt : document.querySelector(target);

            if (name === "htmx:beforeRequest" && targetElement) {
                targetElement.disabled = true;
            } else if (name == "htmx:afterRequest" && targetElement) {
                targetElement.disabled = false;
            }
        }
    }
});

// Import fr-callout-read-more
import '/assets/scripts/fr-callout-read-more.js';

// Import highcharts custom buttons
import '/assets/scripts/highcharts-custom-buttons.js';

// Import filter diagnostic list
import '/assets/scripts/filter-diagnostic-list.js';

// Import map
import '/assets/scripts/map_libre/index.js'

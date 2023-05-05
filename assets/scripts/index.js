/*********************
 * TODO: WEBPACK Code splitting
 ********************/

// Import styles
import '/assets/styles/index.css';

// Import dsfr
import '@gouvfr/dsfr/dist/dsfr.module.min.js';

// Import Alpine
import Alpine from 'alpinejs';
// Add Alpine object to the window scope
window.Alpine = Alpine;
// Initialize Alpine
Alpine.start();

// Import HTMX and inject it into the window scope
window.htmx = require('htmx.org');
// Fix CSP inline style
window.htmx.config.includeIndicatorStyles = false;

// Import fr-callout-read-more
import '/assets/scripts/fr-callout-read-more.js';

// Import highcharts custom buttons
import '/assets/scripts/highcharts-custom-buttons.js';

// Import filter diagnostic list
import '/assets/scripts/filter-diagnostic-list.js';

// Import map V2
import '/assets/scripts/map_v2/index.js'

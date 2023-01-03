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

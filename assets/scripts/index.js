import Alpine from 'alpinejs';

// Add Alpine object to the window scope
window.Alpine = Alpine;

// initialize Alpine
Alpine.start();

// import HTMX and inject it into the window scope
window.htmx = require('htmx.org');
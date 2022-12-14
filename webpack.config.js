const path = require('path');

module.exports = {
    entry: './assets/scripts/index.js',
    output: {
        'path': path.resolve(__dirname, 'static'),
        'filename': 'bundle.js'
    }
}
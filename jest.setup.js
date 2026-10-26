require('@testing-library/jest-dom');

// jsdom n'expose pas TextEncoder/TextDecoder, dont react-router (v7) a besoin.
const { TextEncoder, TextDecoder } = require('util');
Object.assign(global, { TextEncoder, TextDecoder });

// jsdom n'implémente pas le canvas 2D, que lottie-web (via Feedback) interroge dès son import.
HTMLCanvasElement.prototype.getContext = () => ({ fillStyle: '', fillRect: () => {} });

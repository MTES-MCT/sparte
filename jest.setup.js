require('@testing-library/jest-dom');

// jsdom n'expose pas TextEncoder/TextDecoder, dont react-router (v7) a besoin.
const { TextEncoder, TextDecoder } = require('node:util');
Object.assign(global, { TextEncoder, TextDecoder });

// jsdom n'expose pas structuredClone : le module v8 de Node applique le même algorithme de clonage.
const { serialize, deserialize } = require('node:v8');
global.structuredClone ??= (value) => deserialize(serialize(value));

// jsdom n'implémente pas le canvas 2D, que lottie-web (via Feedback) interroge dès son import.
HTMLCanvasElement.prototype.getContext = () => ({ fillStyle: '', fillRect: () => {} });

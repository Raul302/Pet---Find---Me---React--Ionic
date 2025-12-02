import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for libraries expecting Node globals
import { TextEncoder, TextDecoder } from 'util';
if (!(globalThis as any).TextEncoder) {
  (globalThis as any).TextEncoder = TextEncoder;
}
if (!(globalThis as any).TextDecoder) {
  (globalThis as any).TextDecoder = TextDecoder;
}

// Lightweight matchMedia mock for components relying on it
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
    media: ''
  }) as any;
}

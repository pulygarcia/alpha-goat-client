import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom no implementa ResizeObserver; lo necesitan primitivos de Radix (Slider).
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

afterEach(() => {
  cleanup();
});

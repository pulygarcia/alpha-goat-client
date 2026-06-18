import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// `config/env.ts` valida NEXT_PUBLIC_API_URL al importar; cualquier test que
// arrastre el api-client lo necesita. Default para no depender del entorno.
process.env.NEXT_PUBLIC_API_URL ||= 'http://localhost:3001';

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

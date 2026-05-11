import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        branches: 85,
        functions: 85,
        lines: 85,
        statements: 85,
      },
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.config.*',
        '**/types/**',
        '**/schemas/**',
        'src/app/**',
        'src/shared/components/ui/**',
        'src/test/**',
        '**/*.d.ts',
      ],
    },
  },
});

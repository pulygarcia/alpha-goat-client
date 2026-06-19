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
        // Framework boundary / app bootstrap config (mirrors the back's Jest
        // excludes for main.ts + config): edge middleware and env/query wiring.
        'src/middleware.ts',
        'src/config/**',
        // Thin axios wrappers: the testing policy mocks the `api/` module
        // everywhere, so the wrappers themselves carry no logic to cover.
        'src/features/**/api/**',
        // Server-only boundary code (reads next/headers); not unit-testable in jsdom.
        '**/*.server.ts',
        // Provider wiring (no data logic of their own).
        'src/shared/providers/**',
        // Purely presentational components (markup only) — policy: don't test
        // presentational components, same as shadcn primitives above.
        'src/features/auth/components/Hero.tsx',
        'src/features/auth/components/HeroWords.tsx',
        'src/features/auth/components/ParticleWords.tsx',
        'src/features/auth/components/SocialButton.tsx',
        'src/features/auth/components/InputGroup.tsx',
        'src/features/feed/components/FeedHero.tsx',
        'src/features/feed/components/FeedHeroSkeleton.tsx',
        'src/features/feed/components/FeedReviewsSkeleton.tsx',
        'src/features/feed/components/FeedRail.tsx',
        'src/features/feed/components/FeedTopbar.tsx',
        'src/features/feed/components/ReviewFab.tsx',
        'src/features/alfajores/components/AlfajorCard.tsx',
        'src/features/alfajores/components/CatalogHeader.tsx',
        'src/features/alfajores/components/AlfajorDetailSkeleton.tsx',
        'src/features/alfajores/components/AlfajoresGridSkeleton.tsx',
        'src/features/reviews/components/RatingSlider.tsx',
      ],
    },
  },
});

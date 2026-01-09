import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',

    coverage: {
      provider: 'v8', 
      reporter: ['text', 'lcov', 'html'], 
      include: ['src/EnergyResultsComponent/**/*.{ts,tsx,js,jsx}',
        'src/formComponents/**/*.{ts,tsx,js,jsx}',
        'src/ModelImportComponent/**/*.{ts,tsx,js,jsx}'
      ], 
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.d.ts',
      ],
    },
  },
});
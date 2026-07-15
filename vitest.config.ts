import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['hidden-tests/**', '**/node_modules/**', '**/dist/**'],
  },
});

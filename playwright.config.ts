// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: {
    timeout: 30000  // Timeout for expect assertions
  },
  retries: 2,
  reporter: [['html', { open: 'never' }]],
  use: {
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    baseURL: process.env.KANBAN_URL,
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },
});

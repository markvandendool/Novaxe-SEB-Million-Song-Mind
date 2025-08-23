import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  /* Generate an HTML report we can upload/share */
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:4200',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],

  webServer: {
    command: 'npm run serve:novaxe',
    port: 4200,
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});


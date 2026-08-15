const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e/local',
  timeout: 120000,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    trace: 'retain-on-failure',
  },
});

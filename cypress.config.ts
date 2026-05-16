import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    env: {
      // Thiết lập khi chạy: set CYPRESS_E2E_ADMIN_EMAIL / CYPRESS_E2E_ADMIN_PASSWORD,
      // hoặc thêm vào cypress.env.json (gitignore khuyến nghị).
      E2E_ADMIN_EMAIL: process.env.CYPRESS_E2E_ADMIN_EMAIL ?? '',
      E2E_ADMIN_PASSWORD: process.env.CYPRESS_E2E_ADMIN_PASSWORD ?? '',
    },
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    requestTimeout: 10000,
    responseTimeout: 30000,
  },
})
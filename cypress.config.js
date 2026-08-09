import { defineConfig } from 'cypress'

// The course recording tool writes generated specs to cypress/integration.
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: false,
  },
})

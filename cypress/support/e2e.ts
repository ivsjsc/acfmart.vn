/// <reference types="cypress" />

/**
 * Đăng nhập Admin qua `/login/cloud` (Firebase Email/Password).
 * Cần tài khoản Firestore `users/{uid}` có role `admin` hoặc `moderator`.
 */
Cypress.Commands.add("loginCloudAdmin", (email: string, password: string) => {
  cy.visit("/login/cloud")
  cy.get('input[type="email"]', { timeout: 20000 }).should("be.visible")
  cy.get('input[type="email"]').clear().type(email, { log: false })
  cy.get('input[type="password"]').clear().type(password, { log: false })
  cy.contains("button[type='submit']", "Đăng nhập").click()
  cy.location("pathname", { timeout: 45000 }).should("eq", "/admin")
})

declare global {
  namespace Cypress {
    interface Chainable {
      loginCloudAdmin(email: string, password: string): Chainable<void>
    }
  }
}

export {}

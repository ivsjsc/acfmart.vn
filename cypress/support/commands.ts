/// <reference types="cypress" />

/**
 * Đăng nhập Admin qua `/login/cloud` (Firebase Email/Password).
 * Cần Firestore `users/{uid}` có role `admin` hoặc `moderator`.
 */
Cypress.Commands.add("loginCloudAdmin", (email: string, password: string) => {
  cy.visit("/login/cloud")
  cy.get('input[type="email"]', { timeout: 20000 }).should("be.visible")
  cy.get('input[type="email"]').clear().type(email, { log: false })
  cy.get('input[type="password"]').clear().type(password, { log: false })
  cy.contains("button[type='submit']", "Đăng nhập").click()
  cy.location("pathname", { timeout: 45000 }).should("eq", "/admin")
})

Cypress.Commands.add(
  "addBanner",
  (
    image_url: string,
    link_url: string,
    title: string,
    position: number,
    active = true,
  ) => {
    cy.get('[data-testid="image-url-input"]').clear().type(image_url)
    cy.get('[data-testid="link-url-input"]').clear().type(link_url)
    cy.get('[data-testid="title-input"]').clear().type(title)
    cy.get('[data-testid="position-input"]').clear().type(String(position))
    if (active) cy.get('[data-testid="active-checkbox"]').check()
    else cy.get('[data-testid="active-checkbox"]').uncheck()
    cy.get('[data-testid="add-banner-button"]').click()
  },
)

Cypress.Commands.add("validateBannerAdded", (expectedTitle: string) => {
  cy.contains("h2", "Danh sách").should("contain.text", "(1)")
  cy.contains(expectedTitle).should("be.visible")
})

declare global {
  namespace Cypress {
    interface Chainable {
      loginCloudAdmin(email: string, password: string): Chainable<void>
      addBanner(
        image_url: string,
        link_url: string,
        title: string,
        position: number,
        active?: boolean,
      ): Chainable<void>
      validateBannerAdded(expectedTitle: string): Chainable<void>
    }
  }
}

export {}

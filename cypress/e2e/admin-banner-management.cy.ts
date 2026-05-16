/**
 * E2E: Quản lý Banner (/admin/banners)
 *
 * Yêu cầu:
 * - App chạy tại baseUrl trong cypress.config (mặc định http://localhost:3000 — trùng `src/vite.config`).
 * - Biến: `CYPRESS_E2E_ADMIN_EMAIL`, `CYPRESS_E2E_ADMIN_PASSWORD` (admin/moderator + quyền Firestore collection `banners`).
 * - Bước 1–4: **`banners` nên đang trống** để đúng (0)→(1). Hook `after` cố xóa mục có tiêu đề « Banner Test ».
 *
 * Chạy (repo root): `npx cypress run --spec cypress/e2e/admin-banner-management.cy.ts`
 */

const hasAdminCreds =
  Boolean(Cypress.env("E2E_ADMIN_EMAIL")) &&
  Boolean(Cypress.env("E2E_ADMIN_PASSWORD"))

;(hasAdminCreds ? describe : describe.skip)(
  "Admin — Quản lý Banner (/admin/banners)",
  () => {
    after(() => {
      const email = Cypress.env("E2E_ADMIN_EMAIL") as string
      const password = Cypress.env("E2E_ADMIN_PASSWORD") as string

      cy.loginCloudAdmin(email, password)
      cy.visit("/admin/banners")

      cy.get("body").then(($body) => {
        if (!$body.text().includes("Banner Test")) return

        cy.window().then((win) => {
          cy.stub(win, "confirm").returns(true)
        })

        cy.contains("Banner Test")
          .closest('[data-testid^="banner-item-"]')
          .within(() => {
            cy.contains("button", "Xóa").click()
          })

        cy.contains("Đã xóa banner", { timeout: 30000 }).should("exist")
      })
    })

    beforeEach(() => {
      const email = Cypress.env("E2E_ADMIN_EMAIL") as string
      const password = Cypress.env("E2E_ADMIN_PASSWORD") as string

      cy.loginCloudAdmin(email, password)
      cy.visit("/admin/banners")
      cy.contains("h1", "Quản lý Banner", { timeout: 30000 }).should(
        "be.visible",
      )
    })

    it("1–4 Thêm banner: form → danh sách (0)→(1) và tiêu đề đúng", () => {
      cy.contains("h2", "Danh sách").should("contain.text", "(0)")

      cy.get('[data-testid="image-url-input"]').clear().type(
        "https://picsum.photos/200",
      )
      cy.get('[data-testid="title-input"]').clear().type("Banner Test")
      cy.get('[data-testid="position-input"]').clear().type("1")
      cy.get('[data-testid="active-checkbox"]').check()

      cy.get('[data-testid="add-banner-button"]').click()

      cy.contains("Đã thêm banner", { timeout: 20000 }).should("exist")
      cy.contains("h2", "Danh sách").should("contain.text", "(1)")
      cy.contains("Banner Test").should("be.visible")

      cy.get('[data-testid^="banner-item-"]').should("have.length", 1)

      cy.get('[data-testid="banner-list"]')
        .find('[data-testid^="banner-item-"]')
        .should("contain.text", "Banner Test")
    })

    it('5 Case lỗi: để trống URL ảnh và bấm "Thêm banner"', () => {
      cy.get('[data-testid="image-url-input"]').clear()
      cy.get('[data-testid="title-input"]').clear().type("Không có URL ảnh")

      cy.get('[data-testid="add-banner-button"]').click()

      cy.contains("Vui lòng nhập URL hình ảnh", { timeout: 10000 }).should(
        "be.visible",
      )
    })
  },
)

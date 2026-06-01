import { test, expect } from '@playwright/test'
import { AuthPage } from './auth-page'

test.describe('Login Error Paths', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test(
    'REQ-01.1 — invalid credentials show error alert and URL stays on /login',
    { tag: ['@high', '@e2e', '@auth', '@AUTH-E2E-001'] },
    async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.navigate()

      await authPage.fillCredentials('invalid@example.com', 'wrongpassword123')
      await authPage.submit()

      await expect(authPage.errorAlert).toBeVisible()
      await expect(page).toHaveURL('/login')
    }
  )

  test(
    'REQ-01.2 — empty form submission shows error alert and URL stays on /login',
    { tag: ['@high', '@e2e', '@auth', '@AUTH-E2E-002'] },
    async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.navigate()

      await authPage.submit()

      await expect(authPage.errorAlert).toBeVisible()
      await expect(page).toHaveURL('/login')
    }
  )
})

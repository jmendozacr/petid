import { test, expect } from '@playwright/test'
import { PetsPage } from './pets-page'

test.describe('Create Pet', () => {
  test(
    'REQ-02.1 — fill name and submit redirects to /dashboard',
    { tag: ['@critical', '@e2e', '@pets', '@PETS-E2E-001'] },
    async ({ page }) => {
      const petsPage = new PetsPage(page)
      await petsPage.navigateToNew()

      await petsPage.fillName(`E2E Pet ${Date.now()}`)
      await petsPage.submit()

      await expect(page).toHaveURL('/dashboard')
    }
  )

  test(
    'REQ-03.1 — created pet card is visible on dashboard after creation',
    { tag: ['@critical', '@e2e', '@pets', '@PETS-E2E-002'] },
    async ({ page }) => {
      const petsPage = new PetsPage(page)
      await petsPage.navigateToNew()

      const petName = `E2E Pet ${Date.now()}`
      await petsPage.fillName(petName)
      await petsPage.submit()

      await expect(page).toHaveURL('/dashboard')
      await expect(petsPage.petCardHeading(petName)).toBeVisible()
    }
  )
})

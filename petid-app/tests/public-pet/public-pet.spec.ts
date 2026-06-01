import { test, expect } from '@playwright/test'
import { PublicPetPage, ReportPage } from './public-pet-page'
import { getTestPetId } from '../helpers'

test.describe('Public Pet Page', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test(
    'REQ-01.1 — pet name is visible to an unauthenticated visitor',
    { tag: ['@critical', '@e2e', '@public-pet', '@PUBLIC-PET-E2E-001'] },
    async ({ page }) => {
      const petPage = new PublicPetPage(page)
      await petPage.navigate(getTestPetId())

      const petName = await petPage.getPetName()
      expect(petName).not.toBe('')
      await expect(page).not.toHaveURL(/\/login/)
    }
  )

  test(
    'REQ-01.2 — page loads and shows owner phone without a session cookie',
    { tag: ['@critical', '@e2e', '@public-pet', '@PUBLIC-PET-E2E-002'] },
    async ({ page }) => {
      const petPage = new PublicPetPage(page)
      await petPage.navigate(getTestPetId())

      await expect(page).not.toHaveURL(/\/login/)
      const petName = await petPage.getPetName()
      expect(petName).not.toBe('')
      await expect(petPage.ownerPhoneLink).toBeVisible()
    }
  )

  test(
    'REQ-02.1 — Report Found button navigates to the report form',
    { tag: ['@high', '@e2e', '@public-pet', '@PUBLIC-PET-E2E-003'] },
    async ({ page }) => {
      const petPage = new PublicPetPage(page)
      await petPage.navigate(getTestPetId())

      await petPage.clickReportFound()

      await expect(page).toHaveURL(new RegExp(`/p/${getTestPetId()}/report`))
    }
  )

  test(
    'REQ-03.1 — found report form shows success screen after submission',
    { tag: ['@high', '@e2e', '@public-pet', '@PUBLIC-PET-E2E-004'] },
    async ({ page }) => {
      const reportPage = new ReportPage(page)
      await reportPage.goto(`/p/${getTestPetId()}/report`)

      await reportPage.fillForm({
        message: 'Found near the park on Av. Libertador',
        location: 'Av. Libertador y Monroe',
        contact: '+54 11 1234-5678',
      })
      await reportPage.submit()

      expect(await reportPage.isSuccessVisible()).toBe(true)
    }
  )

  test(
    'REQ-03.2 — empty report form submission is rejected with a validation error',
    { tag: ['@high', '@e2e', '@public-pet', '@PUBLIC-PET-E2E-005'] },
    async ({ page }) => {
      const reportPage = new ReportPage(page)
      await reportPage.goto(`/p/${getTestPetId()}/report`)

      await reportPage.submit()

      expect(await reportPage.isSuccessVisible()).toBe(false)
      expect(await reportPage.isValidationErrorVisible()).toBe(true)
    }
  )
})

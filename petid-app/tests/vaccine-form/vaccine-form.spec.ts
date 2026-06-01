import { test, expect } from '@playwright/test'
import { VaccineFormPage } from './vaccine-form-page'
import { getTestPetId } from '../helpers'

test.describe('Vaccine Form', () => {
  test(
    'REQ-04.1 — next_due_date field is visible when type is vaccine',
    { tag: ['@high', '@e2e', '@vaccine-form', '@VACCINE-E2E-001'] },
    async ({ page }) => {
      const formPage = new VaccineFormPage(page)
      await formPage.navigate(getTestPetId())
      await formPage.openAddForm()

      await formPage.selectType('vaccine')

      expect(await formPage.isNextDueDateVisible()).toBe(true)
    }
  )

  test(
    'REQ-04.2 — next_due_date field is hidden when type is allergy',
    { tag: ['@high', '@e2e', '@vaccine-form', '@VACCINE-E2E-002'] },
    async ({ page }) => {
      const formPage = new VaccineFormPage(page)
      await formPage.navigate(getTestPetId())
      await formPage.openAddForm()

      await formPage.selectType('allergy')

      expect(await formPage.isNextDueDateVisible()).toBe(false)
    }
  )

  test(
    'REQ-05.1 + REQ-06.1 — vaccine record with next_due_date saves and shows badge',
    { tag: ['@critical', '@e2e', '@vaccine-form', '@VACCINE-E2E-003'] },
    async ({ page }) => {
      const formPage = new VaccineFormPage(page)
      await formPage.navigate(getTestPetId())
      await formPage.openAddForm()

      await formPage.fillVaccineRecord({
        description: 'Rabies vaccine E2E test',
        nextDueDate: '2027-06-01',
      })
      await formPage.submit()

      await page.waitForLoadState('networkidle')

      const badgeDate = await formPage.getLastRecordBadgeDate()
      expect(badgeDate).not.toBeNull()
      expect(badgeDate).toBe('2027-06-01')
    }
  )
})

import { test, expect, type Page } from '@playwright/test'
import { PetsPage } from '../pets/pets-page'
import { PetDetailActionsPage } from './pet-detail-page'
import { EditPetPage } from './edit-pet-page'

async function createPetAndGoToDetail(
  page: Page,
  petName: string
): Promise<{ petId: string; detailPage: PetDetailActionsPage }> {
  const petsPage = new PetsPage(page)
  await petsPage.navigateToNew()
  await petsPage.fillName(petName)
  await petsPage.submit()
  await expect(page).toHaveURL('/dashboard')
  await expect(petsPage.petCardHeading(petName)).toBeVisible()
  await petsPage.petCardHeading(petName).click()
  await page.waitForURL('**/dashboard/pets/**')
  await page.waitForLoadState('networkidle')
  const petId = page.url().split('/').pop()!
  return { petId, detailPage: new PetDetailActionsPage(page) }
}

test.describe('Edit & Delete Pet', () => {
  test(
    'REQ-01.1 — edit name and save redirects to pet detail with updated name',
    { tag: ['@critical', '@e2e', '@edit-delete-pet', '@EDIT-DELETE-PET-E2E-001'] },
    async ({ page }) => {
      const petName = `E2E Edit Pet ${Date.now()}`
      const updatedName = `E2E Updated ${Date.now()}`
      const { petId, detailPage } = await createPetAndGoToDetail(page, petName)

      await detailPage.clickEditPet()
      await page.waitForURL(`**/dashboard/pets/${petId}/edit`)
      await page.waitForLoadState('networkidle')

      const editPage = new EditPetPage(page)
      await editPage.clearAndFillName(updatedName)
      await editPage.submit()

      await expect(page).toHaveURL(`/dashboard/pets/${petId}`)
      await expect(page.getByRole('heading', { name: updatedName, exact: true })).toBeVisible()
    }
  )

  test(
    'REQ-02.1 — cancel delete modal stays on pet detail page',
    { tag: ['@critical', '@e2e', '@edit-delete-pet', '@EDIT-DELETE-PET-E2E-002'] },
    async ({ page }) => {
      const petName = `E2E Delete Cancel ${Date.now()}`
      const { petId, detailPage } = await createPetAndGoToDetail(page, petName)

      await detailPage.openDeleteModal()
      await detailPage.cancelDelete()

      await expect(page).toHaveURL(`/dashboard/pets/${petId}`)
      await expect(detailPage.deletePetButton).toBeVisible()
    }
  )

  test(
    'REQ-03.1 — confirm delete redirects to dashboard',
    { tag: ['@critical', '@e2e', '@edit-delete-pet', '@EDIT-DELETE-PET-E2E-003'] },
    async ({ page }) => {
      const petName = `E2E Delete Confirm ${Date.now()}`
      const { detailPage } = await createPetAndGoToDetail(page, petName)

      await detailPage.openDeleteModal()
      await detailPage.confirmDelete()

      await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
    }
  )
})

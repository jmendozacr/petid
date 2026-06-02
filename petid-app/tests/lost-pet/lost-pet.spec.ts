import { test, expect, type Page } from '@playwright/test'
import { PetsPage } from '../pets/pets-page'
import { PetDetailPage } from './lost-pet-page'
import { PublicPetPage } from '../public-pet/public-pet-page'

async function createPetAndGoToDetail(
  page: Page,
  petName: string
): Promise<{ petId: string; petDetailPage: PetDetailPage }> {
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
  return { petId, petDetailPage: new PetDetailPage(page) }
}

test.describe('Lost Pet Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().grantPermissions(['geolocation'])
    await page.context().setGeolocation({ latitude: 40.7128, longitude: -74.006 })
  })

  test(
    'REQ-01.1 & REQ-01.2 — confirm modal appears and button switches to Mark as Found',
    { tag: ['@critical', '@e2e', '@lost-pet', '@LOST-PET-E2E-001'] },
    async ({ page }) => {
      const petName = `E2E Lost Pet ${Date.now()}`
      const { petDetailPage } = await createPetAndGoToDetail(page, petName)

      await petDetailPage.markAsLostButton.click()
      await expect(petDetailPage.confirmLostButton).toBeVisible()

      await petDetailPage.confirmLostButton.click()
      await expect(petDetailPage.markAsFoundButton).toBeVisible({ timeout: 10000 })
    }
  )

  test(
    'REQ-02.1 — public page shows lost banner after marking as lost',
    { tag: ['@critical', '@e2e', '@lost-pet', '@LOST-PET-E2E-002'] },
    async ({ page }) => {
      const petName = `E2E Lost Pet ${Date.now()}`
      const { petId, petDetailPage } = await createPetAndGoToDetail(page, petName)

      await petDetailPage.markAsLostButton.click()
      await petDetailPage.confirmLostButton.click()
      await expect(petDetailPage.markAsFoundButton).toBeVisible({ timeout: 10000 })

      const publicPetPage = new PublicPetPage(page)
      await publicPetPage.navigate(petId)
      await expect(publicPetPage.lostBanner).toBeVisible()
    }
  )
})

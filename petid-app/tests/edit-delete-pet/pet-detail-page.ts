import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base-page'

export class PetDetailActionsPage extends BasePage {
  readonly editPetLink: Locator
  readonly deletePetButton: Locator
  readonly deleteModalCancelButton: Locator
  readonly deleteModalConfirmButton: Locator

  constructor(page: Page) {
    super(page)
    this.editPetLink = page.getByRole('link', { name: 'Edit Pet' })
    this.deletePetButton = page.getByRole('button', { name: 'Delete Pet' })
    this.deleteModalCancelButton = page.getByRole('button', { name: 'Cancel' })
    this.deleteModalConfirmButton = page.getByRole('button', { name: 'Delete', exact: true })
  }

  async navigate(petId: string): Promise<void> {
    await this.goto(`/dashboard/pets/${petId}`)
  }

  async clickEditPet(): Promise<void> {
    await this.editPetLink.click()
  }

  async openDeleteModal(): Promise<void> {
    await this.deletePetButton.click()
  }

  async cancelDelete(): Promise<void> {
    await this.deleteModalCancelButton.click()
  }

  async confirmDelete(): Promise<void> {
    await this.deleteModalConfirmButton.click()
  }
}

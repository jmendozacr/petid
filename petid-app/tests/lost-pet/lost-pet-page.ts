import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base-page'

export class PetDetailPage extends BasePage {
  readonly markAsLostButton: Locator
  readonly markAsFoundButton: Locator
  readonly confirmLostButton: Locator
  readonly cancelConfirmButton: Locator

  constructor(page: Page) {
    super(page)
    this.markAsLostButton = page.getByRole('button', { name: 'Mark as Lost' })
    this.markAsFoundButton = page.getByRole('button', { name: 'Mark as Found' })
    this.confirmLostButton = page.getByRole('button', { name: 'Yes, mark as lost' })
    this.cancelConfirmButton = page.getByRole('button', { name: 'Cancel' })
  }

  async navigate(petId: string): Promise<void> {
    await this.goto(`/dashboard/pets/${petId}`)
  }
}

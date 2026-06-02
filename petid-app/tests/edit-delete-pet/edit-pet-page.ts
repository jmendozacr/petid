import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base-page'

export class EditPetPage extends BasePage {
  readonly nameInput: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    super(page)
    this.nameInput = page.getByLabel('Name *')
    this.submitButton = page.getByRole('button', { name: 'Save Changes' })
  }

  async clearAndFillName(name: string): Promise<void> {
    await this.nameInput.clear()
    await this.nameInput.fill(name)
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }
}

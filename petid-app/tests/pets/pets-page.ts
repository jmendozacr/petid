import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base-page'

export class PetsPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  async navigateToNew(): Promise<void> {
    await this.goto('/dashboard/pets/new')
  }

  async fillName(name: string): Promise<void> {
    await this.page.getByLabel('Name *').fill(name)
  }

  async submit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save Pet' }).click()
  }

  petCardHeading(name: string): Locator {
    return this.page.getByRole('heading', { name, exact: true })
  }
}

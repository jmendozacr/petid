import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base-page'

export class PublicPetPage extends BasePage {
  readonly petHeading: Locator
  readonly ownerPhoneLink: Locator
  readonly lostBanner: Locator

  constructor(page: Page) {
    super(page)
    this.petHeading = page.getByRole('heading', { level: 1 })
    this.ownerPhoneLink = page.locator('a[href^="tel:"]').first()
    this.lostBanner = page.getByRole('img', { name: 'Alert' })
  }

  async navigate(petId: string): Promise<void> {
    await this.goto(`/p/${petId}`)
  }

  async getPetName(): Promise<string> {
    const text = await this.petHeading.textContent()
    return text?.trim() ?? ''
  }

  async getOwnerPhone(): Promise<string> {
    const text = await this.ownerPhoneLink.textContent()
    return text?.trim() ?? ''
  }

  async clickReportFound(): Promise<void> {
    await this.page
      .getByRole('link', { name: /report found pet|found this pet/i })
      .first()
      .click()
  }
}

export type ReportFormData = {
  message: string
  contact: string
  location: string
}

export class ReportPage extends BasePage {
  readonly messageInput: Locator
  readonly locationInput: Locator
  readonly contactInput: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    super(page)
    this.messageInput = page.getByLabel(/message/i)
    this.locationInput = page.getByLabel(/location/i)
    this.contactInput = page.getByLabel(/contact/i)
    this.submitButton = page.getByRole('button', { name: 'Submit Report' })
  }

  async fillForm(data: ReportFormData): Promise<void> {
    await this.messageInput.fill(data.message)
    await this.locationInput.fill(data.location)
    await this.contactInput.fill(data.contact)
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  async isSuccessVisible(): Promise<boolean> {
    try {
      await this.page.getByText('Report Submitted!').waitFor({ timeout: 8000 })
      return true
    } catch {
      return false
    }
  }

  async isValidationErrorVisible(): Promise<boolean> {
    const count = await this.page.locator('textarea:invalid').count()
    return count > 0
  }
}

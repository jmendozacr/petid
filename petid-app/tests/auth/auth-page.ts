import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base-page'

export class AuthPage extends BasePage {
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly signInButton: Locator
  readonly errorAlert: Locator

  constructor(page: Page) {
    super(page)
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.signInButton = page.getByRole('button', { name: 'Sign In' })
    this.errorAlert = page.locator('#email-error')
  }

  async navigate(): Promise<void> {
    await this.goto('/login')
  }

  async fillCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
  }

  async submit(): Promise<void> {
    await this.signInButton.click()
  }
}

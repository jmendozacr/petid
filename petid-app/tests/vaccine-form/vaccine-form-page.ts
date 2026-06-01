import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base-page'

export type VaccineRecordData = {
  description: string
  nextDueDate: string
}

export class VaccineFormPage extends BasePage {
  readonly addRecordButton: Locator
  readonly typeSelect: Locator
  readonly nextDueDateInput: Locator
  readonly descriptionTextarea: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    super(page)
    this.addRecordButton = page.getByRole('button', { name: 'Add Record' })
    this.typeSelect = page.getByLabel('Type')
    this.nextDueDateInput = page.getByLabel('Next due date')
    this.descriptionTextarea = page.getByPlaceholder('Enter details...')
    this.saveButton = page.getByRole('button', { name: 'Save Record' })
  }

  async navigate(petId: string): Promise<void> {
    await this.goto(`/dashboard/pets/${petId}`)
  }

  async openAddForm(): Promise<void> {
    await this.addRecordButton.click()
  }

  async selectType(type: 'vaccine' | 'allergy' | 'medical_note'): Promise<void> {
    await this.typeSelect.selectOption(type)
  }

  async isNextDueDateVisible(): Promise<boolean> {
    return this.nextDueDateInput.isVisible()
  }

  async fillVaccineRecord(data: VaccineRecordData): Promise<void> {
    await this.selectType('vaccine')
    await this.nextDueDateInput.fill(data.nextDueDate)
    await this.descriptionTextarea.fill(data.description)
  }

  async submit(): Promise<void> {
    await this.saveButton.click()
  }

  async getLastRecordBadgeDate(): Promise<string | null> {
    const badge = this.page.getByText(/next due:/i).first()
    if (!(await badge.isVisible())) return null
    const text = await badge.textContent()
    return text?.replace(/next due:/i, '').trim() ?? null
  }
}

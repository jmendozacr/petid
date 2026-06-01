import { test as setup, expect } from '@playwright/test'
import path from 'path'
import { getTestCredentials } from './helpers'

const authFile = path.join(__dirname, '.auth/user.json')

setup('authenticate', async ({ page }) => {
  const { email, password } = getTestCredentials()

  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await expect(page).toHaveURL('/dashboard')

  await page.context().storageState({ path: authFile })
})

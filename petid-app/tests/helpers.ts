export function getTestPetId(): string {
  const id = process.env.TEST_PET_ID
  if (!id) throw new Error('TEST_PET_ID is required. Copy .env.test.example to .env.test and fill in values.')
  return id
}

export function getTestCredentials(): { email: string; password: string } {
  const email = process.env.TEST_EMAIL
  const password = process.env.TEST_PASSWORD
  if (!email || !password) throw new Error('TEST_EMAIL and TEST_PASSWORD are required.')
  return { email, password }
}

export function calculatePetAge(
  birthdate: string | null,
  now: Date = new Date(),
): { years: number; months: number } | null {
  if (!birthdate) return null

  const birth = new Date(birthdate)
  if (isNaN(birth.getTime())) return null

  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()

  if (now.getDate() < birth.getDate()) {
    months--
  }

  if (months < 0) {
    years--
    months += 12
  }

  if (years < 0) return null

  return { years, months }
}

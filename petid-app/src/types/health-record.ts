export const HEALTH_RECORD_TYPE = {
  VACCINE: 'vaccine',
  ALLERGY: 'allergy',
  MEDICAL_NOTE: 'medical_note',
} as const

export type HealthRecordType = (typeof HEALTH_RECORD_TYPE)[keyof typeof HEALTH_RECORD_TYPE]

export type HealthRecord = {
  id: string
  pet_id: string
  type: HealthRecordType
  description: string
  record_date: string
  next_due_date?: string | null
  reminder_sent_at?: string | null
  created_at: string
}

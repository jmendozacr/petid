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
  created_at: string
}

export type HealthRecordState = {
  records: HealthRecord[]
  isLoading: boolean
  error: string | null
}

export type HealthRecordActions = {
  setRecords: (records: HealthRecord[]) => void
  addRecord: (record: HealthRecord) => void
  removeRecord: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export type HealthRecordStore = HealthRecordState & HealthRecordActions

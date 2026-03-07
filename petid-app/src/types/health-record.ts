export type HealthRecordType = 'vaccine' | 'allergy' | 'medical_note'

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

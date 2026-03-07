import { create } from 'zustand'
import type { HealthRecordStore, HealthRecord, HealthRecordState } from '@/types/health-record'

export const defaultHealthRecordState: HealthRecordState = {
  records: [],
  isLoading: false,
  error: null,
}

export const useHealthRecordStore = create<HealthRecordStore>()((set) => ({
  ...defaultHealthRecordState,

  setRecords: (records: HealthRecord[]) => set({ records, error: null }),

  addRecord: (record: HealthRecord) => set((state) => ({ 
    records: [...state.records, record] 
  })),

  removeRecord: (id: string) => set((state) => ({
    records: state.records.filter((r) => r.id !== id),
  })),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error, isLoading: false }),
}))

import { createClient } from '@/lib/supabase/client'
import type { HealthRecord } from '@/types/health-record'

export async function getHealthRecords(petId: string): Promise<HealthRecord[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('pet_id', petId)
    .order('record_date', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data as HealthRecord[]
}

export async function createHealthRecord(record: Omit<HealthRecord, 'id' | 'created_at'>): Promise<HealthRecord> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('health_records')
    .insert(record)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as HealthRecord
}

export async function deleteHealthRecord(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('health_records')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

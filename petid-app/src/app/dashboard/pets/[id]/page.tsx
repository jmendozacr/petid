'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Pet } from '@/types/pet'
import type { HealthRecord } from '@/types/health-record'

export default function PetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const petId = params.id as string
  const supabase = createClient()
  
  const [pet, setPet] = useState<Pet | null>(null)
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [newRecord, setNewRecord] = useState({
    type: 'vaccine' as 'vaccine' | 'allergy' | 'medical_note',
    description: '',
    record_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    async function fetchData() {
      const { data: petData } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single()

      if (petData) {
        setPet(petData)
      }

      const { data: recordsData } = await supabase
        .from('health_records')
        .select('*')
        .eq('pet_id', petId)
        .order('record_date', { ascending: false })

      if (recordsData) {
        setRecords(recordsData)
      }

      setLoading(false)
    }

    fetchData()
  }, [petId])

  async function handleAddRecord(e: React.FormEvent) {
    e.preventDefault()
    
    const { data, error } = await supabase
      .from('health_records')
      .insert({
        pet_id: petId,
        type: newRecord.type,
        description: newRecord.description,
        record_date: newRecord.record_date,
      })
      .select()
      .single()

    if (error) {
      alert(error.message)
      return
    }

    if (data) {
      setRecords([data, ...records])
      setShowAddRecord(false)
      setNewRecord({
        type: 'vaccine',
        description: '',
        record_date: new Date().toISOString().split('T')[0],
      })
    }
  }

  async function handleDeleteRecord(id: string) {
    const { error } = await supabase
      .from('health_records')
      .delete()
      .eq('id', id)

    if (!error) {
      setRecords(records.filter(r => r.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Pet not found</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    )
  }

  const vaccines = records.filter(r => r.type === 'vaccine')
  const allergies = records.filter(r => r.type === 'allergy')
  const medicalNotes = records.filter(r => r.type === 'medical_note')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Back
        </Button>
        <Button variant="destructive" onClick={() => router.push(`/dashboard/pets/${petId}/delete`)}>
          Delete Pet
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{pet.name}</CardTitle>
          <CardDescription>
            {pet.species} {pet.breed && `- ${pet.breed}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {pet.birthdate && (
              <div>
                <span className="text-muted-foreground">Birthdate:</span> {pet.birthdate}
              </div>
            )}
            {pet.color && (
              <div>
                <span className="text-muted-foreground">Color:</span> {pet.color}
              </div>
            )}
            {pet.weight && (
              <div>
                <span className="text-muted-foreground">Weight:</span> {pet.weight} kg
              </div>
            )}
            {pet.microchip_id && (
              <div>
                <span className="text-muted-foreground">Microchip:</span> {pet.microchip_id}
              </div>
            )}
            {pet.owner_phone && (
              <div>
                <span className="text-muted-foreground">Phone:</span> {pet.owner_phone}
              </div>
            )}
            {pet.emergency_contact && (
              <div>
                <span className="text-muted-foreground">Emergency:</span> {pet.emergency_contact}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Health Records</h2>
        <Button onClick={() => setShowAddRecord(!showAddRecord)}>
          {showAddRecord ? 'Cancel' : 'Add Record'}
        </Button>
      </div>

      {showAddRecord && (
        <Card>
          <CardHeader>
            <CardTitle>Add Health Record</CardTitle>
          </CardHeader>
          <form onSubmit={handleAddRecord}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  value={newRecord.type}
                  onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value as any })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="vaccine">Vaccine</option>
                  <option value="allergy">Allergy</option>
                  <option value="medical_note">Medical Note</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newRecord.record_date}
                  onChange={(e) => setNewRecord({ ...newRecord, record_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Enter details..."
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Save Record</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {vaccines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-success">Vaccines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {vaccines.map((record) => (
              <div key={record.id} className="flex items-start justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{record.description}</p>
                  <p className="text-sm text-muted-foreground">{record.record_date}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteRecord(record.id)}>
                  Delete
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {allergies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-danger">Allergies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allergies.map((record) => (
              <div key={record.id} className="flex items-start justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{record.description}</p>
                  <p className="text-sm text-muted-foreground">{record.record_date}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteRecord(record.id)}>
                  Delete
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {medicalNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Medical Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {medicalNotes.map((record) => (
              <div key={record.id} className="flex items-start justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{record.description}</p>
                  <p className="text-sm text-muted-foreground">{record.record_date}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteRecord(record.id)}>
                  Delete
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {records.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No health records yet
          </CardContent>
        </Card>
      )}
    </div>
  )
}

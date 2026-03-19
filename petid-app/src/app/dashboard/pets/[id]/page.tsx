'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QRCode, getPublicPetUrl } from '@/components/qr-code'
import { getPetById, updatePet, deletePet, uploadPetPhoto } from '@/services/pets-service'
import { getHealthRecords, createHealthRecord, deleteHealthRecord } from '@/services/health-record-service'
import type { Pet } from '@/types/pet'
import type { HealthRecord } from '@/types/health-record'

export default function PetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const petId = params.id as string
  
  const [pet, setPet] = useState<Pet | null>(null)
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [newRecord, setNewRecord] = useState({
    type: 'vaccine' as 'vaccine' | 'allergy' | 'medical_note',
    description: '',
    record_date: new Date().toISOString().split('T')[0],
  })

  const loadData = useCallback(async () => {
    try {
      const [petData, recordsData] = await Promise.all([
        getPetById(petId),
        getHealthRecords(petId)
      ])
      setPet(petData)
      setRecords(recordsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }, [petId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddRecord = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const data = await createHealthRecord({
        pet_id: petId,
        type: newRecord.type,
        description: newRecord.description,
        record_date: newRecord.record_date,
      })
      setRecords(prev => [data, ...prev])
      setShowAddRecord(false)
      setNewRecord({
        type: 'vaccine',
        description: '',
        record_date: new Date().toISOString().split('T')[0],
      })
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add record')
    }
  }, [petId, newRecord])

  const handleDeleteRecord = useCallback(async (id: string) => {
    try {
      await deleteHealthRecord(id)
      setRecords(prev => prev.filter(r => r.id !== id))
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete record')
    }
  }, [])

  const handleDeletePet = useCallback(async () => {
    setDeleting(true)
    try {
      await deletePet(petId)
      router.push('/dashboard')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete pet')
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }, [petId, router])

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    try {
      const photoUrl = await uploadPetPhoto(petId, file)
      await updatePet(petId, { photo_url: photoUrl })
      setPet(prev => prev ? { ...prev, photo_url: photoUrl } : null)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }, [petId])

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
        <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
          Delete Pet
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-48 h-48 rounded-lg overflow-hidden bg-muted relative">
                {pet.photo_url ? (
                  <img 
                    src={pet.photo_url} 
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    className="hidden"
                  />
                  <span className="text-white text-sm font-medium">
                    {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                  </span>
                </label>
              </div>
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{pet.name}</CardTitle>
              <CardDescription className="text-lg mb-4">
                {pet.species} {pet.breed && `- ${pet.breed}`}
              </CardDescription>
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
          </div>
        </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">QR Code</CardTitle>
          <CardDescription>Scan this to view pet info publicly</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <QRCode value={getPublicPetUrl(petId)} size={200} className="mb-4" />
          <p className="text-sm text-muted-foreground text-center">
            {getPublicPetUrl(petId)}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => navigator.clipboard.writeText(getPublicPetUrl(petId))}
          >
            Copy Link
          </Button>
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
                  onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value as 'vaccine' | 'allergy' | 'medical_note' })}
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

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Delete Pet</CardTitle>
              <CardDescription>
                Are you sure you want to delete {pet?.name}? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeletePet}
                  disabled={deleting}
                  className="flex-1"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

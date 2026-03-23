'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { usePet } from '@/hooks/usePet'
import { useHealthRecords } from '@/hooks/useHealthRecords'
import { DeleteConfirmModal } from '@/components/pet/DeleteConfirmModal'
import { HealthRecordItem } from '@/components/health-record/HealthRecordItem'
import { HealthRecordForm } from '@/components/health-record/HealthRecordForm'
import { QRCode, getPublicPetUrl } from '@/components/qr-code'
import { PhotoDisplay } from '@/components/ui/photo-display'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const petId = params.id as string

  const { pet, loading: petLoading, error: petError, update, remove, uploadPhoto, reload } = usePet(petId)
  const { vaccines, allergies, medicalNotes, add, remove: removeRecord, loading: recordsLoading } = useHealthRecords(petId)

  const [showAddRecord, setShowAddRecord] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null)

  const handleAddRecord = useCallback(async (data: { type: 'vaccine' | 'allergy' | 'medical_note'; description: string; record_date: string }) => {
    await add(data)
    setShowAddRecord(false)
  }, [add])

  const handleDeleteRecord = useCallback(async (id: string) => {
    setDeletingRecordId(id)
    try {
      await removeRecord(id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete record')
    } finally {
      setDeletingRecordId(null)
    }
  }, [removeRecord])

  const handleDeletePet = useCallback(async () => {
    setDeleting(true)
    try {
      await remove()
      router.push('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete pet')
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }, [remove, router])

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    try {
      await uploadPhoto(file)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }, [uploadPhoto])

  if (petLoading || recordsLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-9 w-20 rounded-md bg-muted" />
          <div className="h-9 w-24 rounded-md bg-muted" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-48 h-48 rounded-lg bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-8 w-48 rounded bg-muted" />
                <div className="h-5 w-32 rounded bg-muted" />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 rounded bg-muted" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-8">
            <div className="h-4 w-32 rounded bg-muted mx-auto" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (petError || !pet) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{petError || 'Pet not found'}</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    )
  }

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
                <PhotoDisplay photoUrl={pet.photo_url} alt={pet.name} />
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
        <HealthRecordForm 
          onSubmit={handleAddRecord} 
          onCancel={() => setShowAddRecord(false)}
        />
      )}

      {vaccines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-success">Vaccines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {vaccines.map((record) => (
              <HealthRecordItem 
                key={record.id} 
                record={record} 
                onDelete={handleDeleteRecord}
                isDeleting={deletingRecordId === record.id}
              />
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
              <HealthRecordItem 
                key={record.id} 
                record={record} 
                onDelete={handleDeleteRecord}
                isDeleting={deletingRecordId === record.id}
              />
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
              <HealthRecordItem 
                key={record.id} 
                record={record} 
                onDelete={handleDeleteRecord}
                isDeleting={deletingRecordId === record.id}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {vaccines.length === 0 && allergies.length === 0 && medicalNotes.length === 0 && (
        <Card>
          <EmptyState message="No health records yet" />
        </Card>
      )}

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="Delete Pet"
        itemName={pet.name}
        loading={deleting}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePet}
      />
    </div>
  )
}

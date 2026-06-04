'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { usePet } from '@/hooks/usePet'
import { useHealthRecords } from '@/hooks/useHealthRecords'
import { usePetStore } from '@/stores/pet-store'
import { DeleteConfirmModal } from '@/components/pet/DeleteConfirmModal'
import { LostPetToggleButton } from '@/components/pet/lost-pet-toggle-button'
import { HealthRecordItem } from '@/components/health-record/HealthRecordItem'
import { HealthRecordForm } from '@/components/health-record/HealthRecordForm'
import { QRCode, getPublicPetUrl, downloadQRCode, sanitizePetName } from '@/components/qr-code'
import { PetPhotoUpload } from '@/components/pet/PetPhotoUpload'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Pet } from '@/types/pet'
import type { HealthRecordType } from '@/types/health-record'

export default function PetDetailPage() {
  const t = useTranslations('petDetail')
  const params = useParams()
  const router = useRouter()
  const petId = params.id as string

  const { pet, loading: petLoading, error: petError, remove, uploadPhoto, applyUpdate } = usePet(petId)
  const { vaccines, allergies, medicalNotes, add, remove: removeRecord, loading: recordsLoading } = useHealthRecords(petId)
  const updatePet = usePetStore((s) => s.updatePet)

  function handleToggled(updatedPet: Pet) {
    applyUpdate(updatedPet)
    updatePet(updatedPet)
  }

  const [showAddRecord, setShowAddRecord] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleAddRecord(data: { type: HealthRecordType; description: string; record_date: string }) {
    await add(data)
    setShowAddRecord(false)
  }

  async function handleDeleteRecord(id: string) {
    setDeletingRecordId(id)
    try {
      await removeRecord(id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toastRecordError'))
    } finally {
      setDeletingRecordId(null)
    }
  }

  async function handleDeletePet() {
    setDeleting(true)
    try {
      await remove()
      router.push('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toastDeleteError'))
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  async function handlePhotoChange(file: File) {
    setUploadingPhoto(true)
    try {
      await uploadPhoto(file)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toastDeleteError'))
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(getPublicPetUrl(petId))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDownloadQR() {
    setDownloading(true)
    try {
      await downloadQRCode(pet!.id, pet!.name)
      toast.success(t('toastQrDownloaded', { filename: `${sanitizePetName(pet!.name)}-qrcode.png` }))
    } catch (error) {
      toast.error(t('toastQrError', { error: error instanceof Error ? error.message : 'Unknown error' }))
    } finally {
      setDownloading(false)
    }
  }

  if (petLoading || recordsLoading) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true">
        <span className="sr-only" aria-live="polite">{t('loading')}</span>
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
        <p className="text-muted-foreground">{petError || t('notFound')}</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">
          {t('backToDashboard')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} aria-label="Back to dashboard">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" asChild aria-label={t('editPet')}>
            <Link href={`/dashboard/pets/${pet.id}/edit`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteModal(true)}
            className="text-muted-foreground hover:text-danger hover:bg-danger/10"
            aria-label={t('deletePet')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <PetPhotoUpload
              photoUrl={pet.photo_url}
              uploading={uploadingPhoto}
              onPhotoChange={handlePhotoChange}
              alt={pet.name}
            />
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{pet.name}</CardTitle>
              <CardDescription className="text-lg mb-4">
                {pet.species} {pet.breed && `- ${pet.breed}`}
              </CardDescription>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {pet.birthdate && (
                  <div>
                    <span className="text-muted-foreground">{t('fieldBirthdate')}:</span> {pet.birthdate}
                  </div>
                )}
                {pet.color && (
                  <div>
                    <span className="text-muted-foreground">{t('fieldColor')}:</span> {pet.color}
                  </div>
                )}
                {pet.weight && (
                  <div>
                    <span className="text-muted-foreground">{t('fieldWeight')}:</span> {pet.weight} kg
                  </div>
                )}
                {pet.microchip_id && (
                  <div>
                    <span className="text-muted-foreground">{t('fieldMicrochip')}:</span> {pet.microchip_id}
                  </div>
                )}
                {pet.owner_phone && (
                  <div>
                    <span className="text-muted-foreground">{t('fieldPhone')}:</span> {pet.owner_phone}
                  </div>
                )}
                {pet.emergency_contact && (
                  <div>
                    <span className="text-muted-foreground">{t('fieldEmergency')}:</span> {pet.emergency_contact}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <LostPetToggleButton
        petId={pet.id}
        isLost={pet.is_lost ?? false}
        lostSince={pet.lost_since ?? null}
        onToggled={handleToggled}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('qrTitle')}</CardTitle>
          <CardDescription>{t('qrSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <QRCode value={getPublicPetUrl(petId)} size={200} className="mb-4" />
          <p className="text-sm text-muted-foreground text-center">
            {getPublicPetUrl(petId)}
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <Button variant="outline" size="sm" onClick={handleCopyLink} disabled={copied}>
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t('copyLinkCopied')}
                </>
              ) : t('copyLink')}
            </Button>
            <Button variant="outline" size="sm" disabled={downloading} onClick={handleDownloadQR}>
              {downloading ? t('downloading') : t('downloadQR')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('healthTitle')}</h2>
        <Button onClick={() => setShowAddRecord(!showAddRecord)}>
          {showAddRecord ? t('cancel') : t('addRecord')}
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
            <CardTitle className="text-lg text-success">{t('vaccines')}</CardTitle>
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
            <CardTitle className="text-lg text-danger">{t('allergies')}</CardTitle>
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
            <CardTitle className="text-lg">{t('medicalNotes')}</CardTitle>
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
          <EmptyState message={t('noRecords')} />
        </Card>
      )}

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title={t('deleteTitle')}
        itemName={pet.name}
        loading={deleting}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePet}
      />
    </div>
  )
}

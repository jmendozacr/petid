'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { DeleteConfirmModal } from '@/components/pet/DeleteConfirmModal'
import type { HealthRecord } from '@/types/health-record'

interface HealthRecordItemProps {
  record: HealthRecord
  onDelete: (id: string) => void
  isDeleting?: boolean
}

export function HealthRecordItem({ record, onDelete, isDeleting }: HealthRecordItemProps) {
  const t = useTranslations('healthRecord')
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div className="flex items-start justify-between p-3 border rounded">
      <div>
        <p className="font-medium">{record.description}</p>
        <p className="text-sm text-muted-foreground">{record.record_date}</p>
        {record.next_due_date && (
          <p className="text-xs text-primary mt-1">{t('nextDueDateLabel')} {record.next_due_date}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
      >
        {t('delete')}
      </Button>
      <DeleteConfirmModal
        isOpen={showConfirm}
        title={t('deleteConfirmTitle')}
        itemName={record.description}
        loading={isDeleting ?? false}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => {
          onDelete(record.id)
          setShowConfirm(false)
        }}
      />
    </div>
  )
}

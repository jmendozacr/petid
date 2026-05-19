'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import type { HealthRecord } from '@/types/health-record'

interface HealthRecordItemProps {
  record: HealthRecord
  onDelete: (id: string) => void
  isDeleting?: boolean
}

export function HealthRecordItem({ record, onDelete, isDeleting }: HealthRecordItemProps) {
  const t = useTranslations('healthRecord')

  return (
    <div className="flex items-start justify-between p-3 border rounded">
      <div>
        <p className="font-medium">{record.description}</p>
        <p className="text-sm text-muted-foreground">{record.record_date}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(record.id)}
        disabled={isDeleting}
      >
        {t('delete')}
      </Button>
    </div>
  )
}

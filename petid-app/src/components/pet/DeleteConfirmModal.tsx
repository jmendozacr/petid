'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DeleteConfirmModalProps {
  isOpen: boolean
  title: string
  itemName: string
  loading: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteConfirmModal({
  isOpen,
  title,
  itemName,
  loading,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  const t = useTranslations('deleteConfirm')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{t('description', { name: itemName })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1"
            >
              {loading ? t('deleting') : t('delete')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

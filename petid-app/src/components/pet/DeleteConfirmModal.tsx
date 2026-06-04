'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

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

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => { if (!open && !loading) onCancel() }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content
          role="alertdialog"
          aria-modal="true"
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
          onEscapeKeyDown={(e) => { if (loading) e.preventDefault() }}
          onPointerDownOutside={(e) => { if (loading) e.preventDefault() }}
        >
          <div className="bg-card rounded-xl border border-border shadow-warm-lg p-6 space-y-4">
            <div className="space-y-1.5">
              <Dialog.Title className="text-lg font-semibold text-foreground">
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                {t('description', { name: itemName })}
              </Dialog.Description>
            </div>
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
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

import { Button } from '@/components/ui/button'
import type { HealthRecord } from '@/types/health-record'

interface HealthRecordItemProps {
  record: HealthRecord
  onDelete: (id: string) => void
  isDeleting?: boolean
}

export function HealthRecordItem({ record, onDelete, isDeleting }: HealthRecordItemProps) {
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
        Delete
      </Button>
    </div>
  )
}

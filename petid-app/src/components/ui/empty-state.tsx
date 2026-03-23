import { CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  message: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({ message, icon, action }: EmptyStateProps) {
  return (
    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
      <p className="text-muted-foreground mb-4">{message}</p>
      {action}
    </CardContent>
  )
}

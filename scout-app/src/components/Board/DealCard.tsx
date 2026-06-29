import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { formatDate, formatScore, getScoreClass, formatSector } from '../../lib/utils'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface Deal {
  id: string
  company_name?: string
  status?: string
  sector?: string
  thesis_match_score?: number
  created_at?: string
  pipeline_stage?: string
  deck_file_path?: string
  [key: string]: any
}


export function DealCardVisual({ deal, isDragging, onClick }: { deal: Deal, isDragging?: boolean, onClick?: (e: React.MouseEvent) => void }) {
  return (
    <Card 
      className={`cursor-pointer transition-all ${isDragging ? 'shadow-lg border-primary invisible' : 'hover:border-accent hover:shadow-sm'}`}
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base font-semibold">{deal.company_name || 'Untitled'}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={deal.status === 'Error' ? 'destructive' : deal.status === 'Cancelled' ? 'outline' : deal.status === 'Ready' ? 'default' : 'secondary'}>
              {deal.status === 'Analyzing' && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
              {deal.status || 'Pending'}
            </Badge>
            {deal.sector && (
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-sm">
                {formatSector(deal.sector)}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
            <div className="text-xs text-muted-foreground">
              {formatDate(deal.created_at)}
            </div>
            {deal.status === 'Ready' && deal.thesis_match_score != null && (
              <div className={`text-sm font-mono font-semibold ${getScoreClass(deal.thesis_match_score)}`}>
                {formatScore(deal.thesis_match_score)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
  )
}

export function DealCard({ deal }: { deal: Deal }) {
  const navigate = useNavigate()
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    data: deal,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return
    e.stopPropagation()
    navigate(`/deal/${deal.id}`)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <DealCardVisual deal={deal} isDragging={isDragging} onClick={handleClick} />
    </div>
  )
}

import { DealCard } from './DealCard'
import { formatStage } from '../../lib/utils'

interface Deal {
  id: string
  company_name?: string
  status?: string
  sector?: string
  thesis_match_score?: number
  created_at?: string
  pipeline_stage?: string
}

import { useDroppable } from '@dnd-kit/core'

export function StageGroup({ stage, deals }: { stage: string; deals: Deal[] }) {
  const { isOver, setNodeRef } = useDroppable({
    id: stage,
  })

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col h-full w-[260px] xl:w-[280px] shrink-0 rounded-xl p-4 border transition-colors ${
        isOver ? 'bg-secondary/50 border-primary/50' : 'bg-secondary/30'
      }`}
    >
      <div className="flex items-center justify-between pb-3 shrink-0 border-b border-border/50">
        <span className="text-sm font-bold tracking-wide uppercase text-muted-foreground">{formatStage(stage)}</span>
        <span className="text-xs font-mono font-medium bg-background px-2 py-0.5 rounded-full border">
          {deals.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-3 mt-4 overflow-y-auto pb-4 flex-1">
        {deals.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground/60 border border-dashed rounded-lg">
            No deals
          </div>
        ) : (
          deals.map(deal => <DealCard key={deal.id} deal={deal} />)
        )}
      </div>
    </div>
  )
}

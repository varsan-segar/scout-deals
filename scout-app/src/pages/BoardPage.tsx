import { useLiveRecords } from 'lemma-sdk/react'
import { lemmaClient } from '../lemma-client'
import { StageGroup } from '../components/Board/StageGroup'
import { PIPELINE_STAGES } from '../lib/utils'
import { DndContext, DragEndEvent, DragStartEvent, closestCorners, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { useState } from 'react'
import { useUpdateRecord } from 'lemma-sdk/react'
import { DealCardVisual } from '../components/Board/DealCard'

export function BoardPage() {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const { records: deals = [], isLoading, error } = useLiveRecords({
    client: lemmaClient,
    podId: lemmaClient.podId,
    tableName: 'deals',
  })

  const grouped = PIPELINE_STAGES.reduce((acc, stage) => ({
    ...acc,
    [stage]: (deals as any[]).filter((d: any) => d.pipeline_stage === stage)
  }), {} as Record<string, any[]>)

  const readyCount = (deals as any[]).filter((d: any) => d.status === 'Ready').length

  const { update: updateDeal } = useUpdateRecord({
    client: lemmaClient,
    podId: lemmaClient.podId,
    tableName: 'deals'
  })

  const [activeDeal, setActiveDeal] = useState<any | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDeal(event.active.data.current)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDeal(null)
    const { active, over } = event
    if (!over) return

    const dealId = active.id as string
    const newStage = over.id as string

    const deal = (deals as any[]).find(d => d.id === dealId)
    if (deal && deal.pipeline_stage !== newStage) {
      await updateDeal({ pipeline_stage: newStage }, { recordId: dealId } as any)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <div className="text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-md border border-destructive/20">
          Error loading deals: {String(error)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-8 pb-0">
      <div className="flex items-end justify-between shrink-0 mb-6">
        <div>
          <h1 className="text-4xl font-serif tracking-tight mb-2">Deals Board</h1>
          <p className="text-sm text-muted-foreground">
            {(deals as any[]).length} companies · {readyCount} ready for review
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full overflow-x-auto pb-8 snap-x">
              {PIPELINE_STAGES.map(stage => (
                <div key={stage} className="snap-start shrink-0 h-full">
                  <StageGroup stage={stage} deals={grouped[stage] || []} />
                </div>
              ))}
            </div>
            <DragOverlay>
              {activeDeal ? (
                <div className="w-[260px] xl:w-[280px]">
                  <DealCardVisual deal={activeDeal} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
  )
}

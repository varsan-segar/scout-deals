import { useState } from 'react'
import { useLiveRecords, useCreateRecord, useUpdateRecord, useCurrentUser } from 'lemma-sdk/react'
import { lemmaClient } from '../../lemma-client'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { formatDate, formatSector, formatStage, PIPELINE_STAGES } from '../../lib/utils'
import { ExternalLink, Edit } from 'lucide-react'
import { EditDealSheet } from './EditDealSheet'

export function DealSidebar({ dealId, deal: propDeal }: { dealId: string, deal?: any }) {
  const { user } = useCurrentUser({ client: lemmaClient })
  const [isEditOpen, setIsEditOpen] = useState(false)

  const { records: deals } = useLiveRecords({
    client: lemmaClient,
    podId: lemmaClient.podId,
    tableName: 'deals',
    filters: [{ field: 'id', op: 'eq', value: dealId }]
  })
  const deal = propDeal || (deals?.[0] as any)

  const { records: notes } = useLiveRecords({
    client: lemmaClient,
    podId: lemmaClient.podId,
    tableName: 'notes',
    filters: [{ field: 'deal_id', op: 'eq', value: dealId }]
  })

  const { update: updateDeal } = useUpdateRecord({
    client: lemmaClient,
    podId: lemmaClient.podId,
    tableName: 'deals'
  })

  const { create: createNote } = useCreateRecord({
    client: lemmaClient,
    podId: lemmaClient.podId,
    tableName: 'notes'
  })

  const [newNote, setNewNote] = useState('')

  if (!deal) return null

  return (
    <div className="space-y-6">
      <Card className="shadow-none border-border/60">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Deal Info</CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => setIsEditOpen(true)}>
            <Edit size={14} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Sector</span>
            <span className="font-medium">{formatSector(deal.sector)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="secondary">{deal.status}</Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Added</span>
            <span className="font-medium">{formatDate(deal.created_at)}</span>
          </div>
          
          {deal.amount_raised && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Raised</span>
              <span className="font-medium">{deal.amount_raised}</span>
            </div>
          )}
          {deal.existing_investors && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Investors</span>
              <span className="font-medium truncate max-w-[150px]" title={deal.existing_investors}>{deal.existing_investors}</span>
            </div>
          )}
          {deal.year_founded && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Founded</span>
              <span className="font-medium">{deal.year_founded}</span>
            </div>
          )}
          {deal.revenue_model && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Revenue Model</span>
              <span className="font-medium truncate max-w-[120px]" title={deal.revenue_model}>{deal.revenue_model}</span>
            </div>
          )}
          {deal.website && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Website</span>
              <a href={deal.website} target="_blank" rel="noreferrer" className="text-primary flex items-center gap-1 hover:underline">
                Visit <ExternalLink size={12} />
              </a>
            </div>
          )}
          {deal.deck_file_path && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Pitch Deck</span>
              <Button variant="link" className="h-auto p-0 text-primary" onClick={async () => {
                try {
                  const urlRes = await lemmaClient.files.getUrl(deal.deck_file_path)
                  window.open(urlRes.url, '_blank')
                } catch (err) {
                  console.error(err)
                  alert('Failed to load PDF')
                }
              }}>
                View PDF <ExternalLink size={12} className="ml-1" />
              </Button>
            </div>
          )}
          
          <div className="pt-4 border-t border-border/50 space-y-2">
            <span className="text-sm text-muted-foreground block">Pipeline Stage</span>
            <Select 
              value={deal.pipeline_stage} 
              onValueChange={v => updateDeal({ pipeline_stage: v }, { recordId: dealId } as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PIPELINE_STAGES.map(s => (
                  <SelectItem key={s} value={s}>{formatStage(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Team Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2">
            {!notes?.length && <p className="text-sm text-muted-foreground italic">No notes yet.</p>}
            {(notes as any[])?.map(note => (
              <div key={note.id} className="p-3 bg-secondary/50 rounded-lg text-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-xs">{note.author_name || 'Anonymous'}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(note.created_at || new Date().toISOString())}</span>
                </div>
                <p className="leading-relaxed">{note.content}</p>
              </div>
            ))}
          </div>
          <form 
            className="flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault()
              if (!newNote.trim()) return
              await createNote({ 
                deal_id: dealId, 
                content: newNote,
                author_name: [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email?.split('@')[0] || 'Unknown',
                author_email: user?.email || ''
              })
              setNewNote('')
            }}
          >
            <Input 
              value={newNote} 
              onChange={e => setNewNote(e.target.value)}
              placeholder="Add note..." 
              className="text-sm"
            />
            <Button type="submit" size="sm" variant="secondary">Add</Button>
          </form>
        </CardContent>
      </Card>
      
      <EditDealSheet 
        deal={deal} 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        showAnalyzeButton={deal.status === 'Pending' || deal.status === 'Error' || deal.status === 'Cancelled'}
      />
    </div>
  )
}

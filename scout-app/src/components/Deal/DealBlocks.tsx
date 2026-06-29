import { ReactNode, useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { CertaintySignal } from '../ui/CertaintySignal'
import { formatScore, getScoreClass } from '../../lib/utils'
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { Button } from '../ui/button'

export function BriefSection({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <section className="mb-16">
      <div className="flex items-baseline gap-3 mb-6">
        <span className="font-serif text-2xl text-muted-foreground">{number}</span>
        <h2 className="font-serif text-2xl text-primary">{title}</h2>
      </div>
      <div className="h-px bg-border mb-8" />
      {children}
    </section>
  )
}

export function ThesisMatchBlock({ thesis }: { thesis: any }) {
  if (!thesis) return <div className="text-muted-foreground italic">No thesis data available.</div>
  
  const score = thesis.total_score || 0
  const colorClass = getScoreClass(score)
  
  return (
    <div className="flex flex-col gap-6">
      <div className={`text-6xl font-mono tracking-tighter ${colorClass}`}>
        {formatScore(score)}
      </div>
      <div className="space-y-4 max-w-sm">
        {['stage_match', 'sector_match', 'founder_type', 'geography', 'revenue_stage'].map(k => {
          const val = thesis.breakdown ? thesis.breakdown[k] : thesis[k];
          const scoreVal = val || 0;
          return (
            <div key={k} className="flex items-center gap-4">
              <span className="w-32 text-sm text-muted-foreground capitalize">{k.replace('_', ' ')}</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all" 
                  style={{ width: `${(scoreVal / 2) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs font-mono text-muted-foreground">{scoreVal}/2</span>
            </div>
          )
        })}
      </div>
      {thesis.summary && (
        <p className="text-sm text-muted-foreground leading-relaxed mt-4 p-4 bg-secondary/50 rounded-lg border">
          {thesis.summary}
        </p>
      )}
    </div>
  )
}

export function SnapshotBlock({ snapshot }: { snapshot: any }) {
  if (!snapshot) return null
  return (
    <div className="space-y-6 text-sm">
      <div>
        <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-xs mb-2">Description</h4>
        <p className="leading-relaxed">{snapshot.description}</p>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-xs mb-2">Problem</h4>
          <p className="leading-relaxed">{snapshot.problem}</p>
        </div>
        <div>
          <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-xs mb-2">Solution</h4>
          <p className="leading-relaxed">{snapshot.solution}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6 pt-4 border-t border-border/50">
        <div>
          <span className="block text-xs text-muted-foreground mb-1">Target User</span>
          <span className="font-medium">{snapshot.target_user}</span>
        </div>
        <div>
          <span className="block text-xs text-muted-foreground mb-1">Revenue Model</span>
          <span className="font-medium">{snapshot.revenue_model}</span>
        </div>
        <div>
          <span className="block text-xs text-muted-foreground mb-1">Funding Ask</span>
          <span className="font-medium">{snapshot.funding_ask}</span>
        </div>
      </div>
    </div>
  )
}

export function FounderBlock({ founders = [] }: { founders: any[] }) {
  if (!founders?.length) return null
  return (
    <div className="grid gap-4">
      {founders.map((f, i) => (
        <Card key={i} className="bg-secondary/30 shadow-none border-border/60">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-base">{f.name}</h3>
                <p className="text-sm text-muted-foreground">{f.role}</p>
              </div>
              <CertaintySignal level={f.confidence || 'low'} source={f.sources?.[0]} />
            </div>
            <p className="text-sm leading-relaxed mt-3">{f.background_summary}</p>
            {f.note && (
              <p className="text-xs italic text-muted-foreground mt-3 border-l-2 border-primary/20 pl-3">
                {f.note}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function MarketBlock({ market }: { market: any }) {
  if (!market) return null
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-8">
        {market.figures?.map((f: any) => (
          <div key={f.label} className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-muted-foreground">{f.label}</span>
            <span className="text-2xl font-serif">{f.value || '—'}</span>
          </div>
        ))}
        <div className="ml-auto">
           <CertaintySignal 
             level={market.confidence || (market.figures?.some((f: any) => f.confidence?.toLowerCase() === 'high') ? 'high' : 'low')} 
             source={market.sources?.[0] || market.figures?.[0]?.source_url} 
           />
        </div>
      </div>
      
      <div className="p-5 bg-secondary/30 rounded-lg border border-border/50 text-sm leading-relaxed space-y-4">
        <p>{market.analysis_text}</p>
        <div className="flex gap-8 pt-4 border-t border-border/50">
          <div>
            <span className="block text-xs text-muted-foreground mb-1">Growth Rate</span>
            <span className="font-medium">{market.growth_rate || 'Unknown'}</span>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground mb-1">Key Driver</span>
            <span className="font-medium">{market.growth_driver || 'Unknown'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CompetitorTable({ competitors = [] }: { competitors: any[] }) {
  if (!competitors?.length) return null
  return (
    <div className="grid grid-cols-2 gap-4">
      {competitors.map((c, i) => (
        <Card key={i} className="shadow-none border-border/60">
          <CardContent className="p-5">
            <h4 className="font-semibold mb-2">{c.name}</h4>
            <p className="text-sm text-muted-foreground mb-4">{c.description}</p>
            <div className="text-xs space-y-2">
              <div className="flex gap-2">
                <span className="text-muted-foreground font-medium shrink-0 w-24">Differentiator</span>
                <span>{c.key_differentiator}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground font-medium shrink-0 w-24">Positioning</span>
                <span>{c.positioning}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function TractionTable({ traction = [] }: { traction: any[] }) {
  if (!traction?.length) return null
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            <TableHead className="w-1/3">Metric</TableHead>
            <TableHead className="w-1/3">Value</TableHead>
            <TableHead>Slide</TableHead>
            <TableHead className="text-right">Confidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {traction.map((t, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{t.metric_name}</TableCell>
              <TableCell>{t.value}</TableCell>
              <TableCell className="text-muted-foreground font-mono text-xs">
                {t.slide_reference ? `Slide ${t.slide_reference}` : '—'}
              </TableCell>
              <TableCell className="text-right">
                <CertaintySignal level={t.confidence || 'low'} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function RiskFlagsBlock({ risks = [] }: { risks: any[] }) {
  if (!risks?.length) return <p className="text-sm text-muted-foreground italic">No major risks flagged.</p>
  
  return (
    <div className="space-y-3">
      {risks.map((r, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-lg border bg-secondary/30">
          <AlertTriangle className={`shrink-0 mt-0.5 ${r.severity === 'critical' ? 'text-destructive' : r.severity === 'moderate' ? 'text-amber-500' : 'text-muted-foreground'}`} size={18} />
          <div>
            <div className={`text-xs font-mono font-bold uppercase mb-1 tracking-wider ${r.severity === 'critical' ? 'text-destructive' : r.severity === 'moderate' ? 'text-amber-600' : 'text-muted-foreground'}`}>
              {r.severity}
            </div>
            <p className="text-sm leading-relaxed">{r.description}</p>
            {r.source_url?.startsWith('http') && (
              <a href={r.source_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-2 inline-block">
                Source ↗
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export function SourcesCollapsible({ sources = [] }: { sources: any[] }) {
  const [open, setOpen] = useState(false)
  
  if (!sources?.length) return null

  return (
    <div className="mt-16 pt-8 border-t border-border/50">
      <Button 
        variant="ghost"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors p-0 h-auto"
      >
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        Sources ({sources.length})
      </Button>
      
      {open && (
        <div className="flex flex-col gap-2 mt-4">
          {sources.map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-2 px-3 bg-secondary/50 rounded text-sm">
              <span className="font-mono text-xs text-muted-foreground w-24 shrink-0 truncate">{s.domain}</span>
              {s.url?.startsWith('http') ? (
                <a href={s.url} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate flex-1">
                  {s.title || s.url}
                </a>
              ) : (
                <span className="text-muted-foreground truncate flex-1">{s.title || s.url}</span>
              )}
              <span className="text-xs text-muted-foreground shrink-0">{s.used_for}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

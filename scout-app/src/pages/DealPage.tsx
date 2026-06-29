import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useLiveRecords, useUpdateRecord, useWorkflowStart } from 'lemma-sdk/react'
import { lemmaClient } from '../lemma-client'
import { ArrowLeft, AlertTriangle, RotateCcw, Info } from 'lucide-react'
import { Button } from '../components/ui/button'
import { AnalysisStatus } from '../components/Deal/AnalysisStatus'
import { DealSidebar } from '../components/Deal/DealSidebar'
import {
  BriefSection,
  ThesisMatchBlock,
  SnapshotBlock,
  FounderBlock,
  MarketBlock,
  CompetitorTable,
  TractionTable,
  RiskFlagsBlock,
  SourcesCollapsible
} from '../components/Deal/DealBlocks'
import { parseJSON } from '../lib/utils'

export function DealPage() {
  const { dealId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [retryingRunId, setRetryingRunId] = useState<string | null>(null)
  const [terminalStatus, setTerminalStatus] = useState<'Error' | 'Cancelled' | 'Ready' | null>(null)
  const [fileIndexStatus, setFileIndexStatus] = useState<string | null>(null)
  
  const { records: deals, isLoading, error } = useLiveRecords({
    client: lemmaClient,
    podId: lemmaClient.podId,
    tableName: 'deals',
    filters: [{ field: 'id', op: 'eq', value: dealId }]
  })

  const { records: briefs } = useLiveRecords({
    client: lemmaClient,
    podId: lemmaClient.podId,
    tableName: 'briefs',
    filters: [{ field: 'deal_id', op: 'eq', value: dealId }]
  })

  const { update: updateDeal } = useUpdateRecord({
    client: lemmaClient,
    podId: lemmaClient.podId,
    tableName: 'deals',
  })

  const { start: startWorkflow } = useWorkflowStart({ 
    client: lemmaClient, 
    podId: lemmaClient.podId,
    workflowName: 'deal-research'
  })

  const deal = deals?.[0]
  const d = deal as any
  const brief = briefs?.[0] as any

  useEffect(() => {
    if (!d?.deck_file_path) return
    if (d.status === 'Analyzing' || retryingRunId) return

    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const check = async () => {
      try {
        const file = await lemmaClient.files.get(d.deck_file_path as string)
        if (cancelled) return
        setFileIndexStatus(file.status)
        if (file.status !== 'COMPLETED' && file.status !== 'NOT_REQUIRED' && file.status !== 'ERROR' && file.status !== 'FAILED') {
          timeoutId = setTimeout(check, 2000)
        }
      } catch {
        if (cancelled) return
        setFileIndexStatus(null)
      }
    }
    check()
    return () => { cancelled = true; if (timeoutId) clearTimeout(timeoutId) }
  }, [d?.deck_file_path, d?.status, retryingRunId])

  const isIndexing = fileIndexStatus === 'PENDING' || fileIndexStatus === 'PROCESSING'
  const isFileError = fileIndexStatus === 'ERROR' || fileIndexStatus === 'FAILED'

  const workflowRunId = retryingRunId ?? (location.state as { workflowRunId?: string | null })?.workflowRunId ?? d?.workflow_run_id ?? null

  const thesis = parseJSON(brief?.thesis_breakdown_json, {})
  const snapshot = parseJSON(brief?.snapshot_json, {})
  const founders = parseJSON(brief?.founders_json, [])
  const market = parseJSON(brief?.market_json, {})
  const competitors = parseJSON(brief?.competitors_json, [])
  const traction = parseJSON(brief?.traction_json, [])
  const risks = parseJSON(brief?.risk_flags_json, [])
  const sources = parseJSON(brief?.sources_json, [])

  const handleRetry = async () => {
    if (!dealId) return
    setTerminalStatus(null)
    setRetryingRunId(null)
    if (!d?.deck_file_path) {
      alert("Cannot run analysis without a pitch deck. Please upload one first.")
      return
    }
    const run = await startWorkflow({ 
      deal_id: dealId,
      file_path: d?.deck_file_path || '',
      company_name: d?.company_name || '',
      sector: d?.sector || '',
    })
    await updateDeal({ status: 'Analyzing', workflow_run_id: run.id }, { recordId: dealId })
    setRetryingRunId(run.id as string)
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
  }
  if (error || !deal) {
    return <div className="p-12 text-destructive">Deal not found</div>
  }

  if ((d.status === 'Analyzing' || retryingRunId) && !terminalStatus) {
    return <AnalysisStatus dealId={dealId!} companyName={d.company_name} workflowRunId={workflowRunId} onTerminal={setTerminalStatus} />
  }

  if (d.status === 'Cancelled') {
    return (
      <div className="h-screen overflow-hidden bg-background">
        <div className="max-w-[1200px] mx-auto p-10 pt-12 flex gap-12 h-full">
          <main className="flex-1 max-w-3xl overflow-y-auto scrollbar-none">
            <Button variant="ghost" className="mb-8 -ml-4 text-muted-foreground" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} className="mr-2" /> Back
            </Button>

            <div className="py-20 text-center border-2 border-muted-foreground/30 rounded-xl bg-muted/5">
              <Info className="text-muted-foreground mx-auto mb-4" size={40} />
              <h2 className="text-xl font-semibold text-muted-foreground mb-2">Analysis Cancelled</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                The analysis for {d.company_name || 'this deal'} was cancelled and did not complete.
              </p>
              {isIndexing ? (
                <Button disabled>
                  <RotateCcw size={16} className="mr-2 animate-spin" /> Indexing...
                </Button>
              ) : isFileError ? (
                <Button disabled>
                  <RotateCcw size={16} className="mr-2" /> File Error
                </Button>
              ) : (
                <Button onClick={handleRetry}>
                  <RotateCcw size={16} className="mr-2" /> Run Analysis Again
                </Button>
              )}
            </div>
          </main>

          <aside className="w-[320px] shrink-0 overflow-y-auto scrollbar-none">
            <DealSidebar dealId={dealId!} deal={deal} />
          </aside>
        </div>
      </div>
    )
  }

  if (d.status === 'Error') {
    return (
      <div className="h-screen overflow-hidden bg-background">
        <div className="max-w-[1200px] mx-auto p-10 pt-12 flex gap-12 h-full">
          <main className="flex-1 max-w-3xl overflow-y-auto scrollbar-none">
            <Button variant="ghost" className="mb-8 -ml-4 text-muted-foreground" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} className="mr-2" /> Back
            </Button>

            <div className="py-20 text-center border-2 border-destructive/30 rounded-xl bg-destructive/5">
              <AlertTriangle className="text-destructive mx-auto mb-4" size={40} />
              <h2 className="text-xl font-semibold text-destructive mb-2">Analysis Failed</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                The analysis for {d.company_name || 'this deal'} encountered an error and could not complete.
              </p>
              {isIndexing ? (
                <Button disabled>
                  <RotateCcw size={16} className="mr-2 animate-spin" /> Indexing...
                </Button>
              ) : isFileError ? (
                <Button disabled>
                  <RotateCcw size={16} className="mr-2" /> File Error
                </Button>
              ) : (
                <Button onClick={handleRetry}>
                  <RotateCcw size={16} className="mr-2" /> Retry Analysis
                </Button>
              )}
            </div>
          </main>

          <aside className="w-[320px] shrink-0 overflow-y-auto scrollbar-none">
            <DealSidebar dealId={dealId!} deal={deal} />
          </aside>
        </div>
      </div>
    )
  }

  const isPending = d.status === 'Pending' || !brief

  return (
    <div className="h-screen overflow-hidden bg-background">
      <div className="max-w-[1200px] mx-auto p-10 pt-12 flex gap-12 h-full">
        <main className="flex-1 max-w-3xl overflow-y-auto scrollbar-none">
          <Button variant="ghost" className="mb-8 -ml-4 text-muted-foreground" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>

          <header className="mb-12">
            <h1 className="text-4xl font-serif font-bold tracking-tight mb-3 text-primary">
              {d.company_name || 'Untitled Company'}
            </h1>
            <p className="text-lg text-muted-foreground">Investment Brief</p>
          </header>

          {isPending ? (
            <div className="py-20 text-center border-2 border-dashed rounded-xl border-border/60">
              {isIndexing ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground mb-4">Indexing document... This should only take a moment.</p>
                  <Button disabled>
                    <RotateCcw size={16} className="mr-2 animate-spin" /> Indexing...
                  </Button>
                </>
              ) : isFileError ? (
                <>
                  <AlertTriangle className="text-destructive mx-auto mb-4" size={40} />
                  <p className="text-muted-foreground mb-4">File indexing failed. Please re-upload the deck.</p>
                  <Button disabled>
                    <RotateCcw size={16} className="mr-2" /> File Error
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">Analysis has not been run for this deal.</p>
                  <Button onClick={handleRetry}>
                    Run Analysis Now
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <BriefSection number="01" title="Thesis Match">
                <ThesisMatchBlock thesis={thesis} />
              </BriefSection>

              <BriefSection number="02" title="Company Snapshot">
                <SnapshotBlock snapshot={snapshot} />
              </BriefSection>

              <BriefSection number="03" title="Founding Team">
                <FounderBlock founders={founders} />
              </BriefSection>

              <BriefSection number="04" title="Market Analysis">
                <MarketBlock market={market} />
              </BriefSection>

              <BriefSection number="05" title="Competitive Landscape">
                <CompetitorTable competitors={competitors} />
              </BriefSection>

              <BriefSection number="06" title="Traction & Metrics">
                <TractionTable traction={traction} />
              </BriefSection>

              <BriefSection number="07" title="Risk Flags">
                <RiskFlagsBlock risks={risks} />
              </BriefSection>

              <SourcesCollapsible sources={sources} />
            </div>
          )}
        </main>

        <aside className="w-[320px] shrink-0 overflow-y-auto scrollbar-none">
          <DealSidebar dealId={dealId!} deal={deal} />
        </aside>
      </div>
    </div>
  )
}
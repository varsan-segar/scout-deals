import { useEffect, useRef } from 'react'
import { useFlowSession, useUpdateRecord } from 'lemma-sdk/react'
import { lemmaClient } from '../../lemma-client'
import { Check, Loader2, Circle, AlertTriangle, Info } from 'lucide-react'

const STEPS = [
  { id: 'intake', label: 'Intaking deal data' },
  { id: 'convert-deck', label: 'Converting pitch deck' },
  { id: 'extract-deck', label: 'Extracting deck content' },
  { id: 'research-team', label: 'Researching founding team' },
  { id: 'size-market', label: 'Estimating market opportunity' },
  { id: 'map-competitors', label: 'Mapping competitive landscape' },
  { id: 'synthesise-brief', label: 'Synthesising deal brief' },
  { id: 'score-deal', label: 'Computing thesis match score' },
]

function getStepState(nodeId: string, currentNodeId: string | null | undefined, stepHistory: any[] | undefined): 'done' | 'running' | 'waiting' {
  const step = stepHistory?.find(s => s.node_id === nodeId)
  if (step?.status === 'COMPLETED' || step?.status === 'FAILED') return 'done'
  if (currentNodeId === nodeId || step?.status === 'RUNNING') return 'running'
  return 'waiting'
}

export function AnalysisStatus({ dealId, companyName, workflowRunId, onTerminal }: { dealId: string; companyName?: string; workflowRunId: string | null; onTerminal?: (status: 'Error' | 'Cancelled' | 'Ready') => void }) {
  const { run, isPolling } = useFlowSession({
    client: lemmaClient,
    podId: lemmaClient.podId,
    runId: workflowRunId,
    autoPoll: !!workflowRunId,
    pollIntervalMs: 3000,
  })

  const { update: updateDeal } = useUpdateRecord({
    client: lemmaClient,
    podId: lemmaClient.podId,
    tableName: 'deals',
  })

  const hasMarkedError = useRef(false)
  const hasMarkedCancelled = useRef(false)
  const hasMarkedComplete = useRef(false)

  useEffect(() => {
    if (run?.status === 'FAILED' && !hasMarkedError.current) {
      hasMarkedError.current = true
      updateDeal({ status: 'Error' }, { recordId: dealId })
      onTerminal?.('Error')
    }
  }, [run?.status, dealId, updateDeal, onTerminal])

  useEffect(() => {
    if (run?.status === 'CANCELLED' && !hasMarkedCancelled.current) {
      hasMarkedCancelled.current = true
      updateDeal({ status: 'Cancelled' }, { recordId: dealId })
      onTerminal?.('Cancelled')
    }
  }, [run?.status, dealId, updateDeal, onTerminal])

  useEffect(() => {
    if (run?.status === 'COMPLETED' && !hasMarkedComplete.current) {
      hasMarkedComplete.current = true
      updateDeal({ status: 'Ready' }, { recordId: dealId })
      onTerminal?.('Ready')
    }
  }, [run?.status, dealId, updateDeal, onTerminal])

  const currentNodeId = run?.current_node_id ?? null
  const stepHistory = run?.step_history as any[] | undefined
  const runStatus = run?.status
  const isFinished = runStatus === 'COMPLETED' || runStatus === 'FAILED' || runStatus === 'CANCELLED'
  const isFailed = runStatus === 'FAILED'
  const isCancelled = runStatus === 'CANCELLED'

  return (
    <div className="max-w-2xl mx-auto mt-24 text-center px-6">
      <h1 className="text-3xl font-serif mb-3">Analysing {companyName || 'Company'}</h1>
      <p className="text-muted-foreground mb-12">
        {isFailed ? 'Analysis failed' :
         isCancelled ? 'Analysis cancelled' :
         isFinished ? 'Analysis complete' :
         isPolling ? 'Agents are researching this company - this usually takes 2-5 minutes' :
         'Starting analysis...'}
      </p>
      
      {isCancelled ? (
        <div className="p-6 border border-muted-foreground/30 bg-muted/5 rounded-xl text-left">
          <div className="flex items-center gap-3 mb-3">
            <Info className="text-muted-foreground" size={20} />
            <span className="font-semibold text-muted-foreground">Analysis Cancelled</span>
          </div>
          <p className="text-sm text-muted-foreground">The analysis was cancelled before it could complete. You can re-run it from the deal page.</p>
        </div>
      ) : isFailed ? (
        <div className="p-6 border border-destructive/30 bg-destructive/5 rounded-xl text-left">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="text-destructive" size={20} />
            <span className="font-semibold text-destructive">Analysis Failed</span>
          </div>
          <p className="text-sm text-muted-foreground">{run?.error || 'Unknown error'}</p>
        </div>
      ) : (
        <div className="flex flex-col text-left border rounded-xl overflow-hidden bg-card shadow-sm">
          {STEPS.map((step, i) => {
            let state: 'done' | 'running' | 'waiting' = 'waiting'
            if (!workflowRunId) {
              state = 'waiting'
            } else if (isFinished) {
              state = 'done'
            } else {
              state = getStepState(step.id, currentNodeId, stepHistory)
              if (state === 'waiting' && i === 0 && !currentNodeId) state = 'running'
            }

            const isDone = state === 'done'
            const isRunning = state === 'running'

            return (
              <div 
                key={step.id} 
                className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 border ${
                  isDone ? 'bg-secondary/20 border-border/50' :
                  isRunning ? 'bg-secondary/40 border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]' :
                  'bg-transparent border-transparent opacity-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {isDone ? <Check className="text-green-500" size={20} /> :
                   isRunning ? <Loader2 className="animate-spin text-primary" size={20} /> :
                   <Circle className="text-muted-foreground" size={20} />}
                </div>
                <span className={`text-sm font-medium ${isRunning ? 'text-primary animate-pulse' : isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
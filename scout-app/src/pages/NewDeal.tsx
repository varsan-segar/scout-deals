import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateRecord, useUploadFile, useUpdateRecord } from 'lemma-sdk/react'
import { lemmaClient } from '../lemma-client'
import { slugify, generateId, SECTORS, PIPELINE_STAGES } from '../lib/utils'
import { startDealResearch } from '../lib/workflow'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '../components/ui/sheet'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Label } from '../components/ui/label'
import { UploadCloud, FileText, X, Loader2 } from 'lucide-react'

export function NewDeal() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(true)

  const handleClose = useCallback(() => {
    setOpen(false)
    setTimeout(() => navigate(-1), 300) // wait for animation
  }, [navigate])

  const [companyName, setCompanyName] = useState('')
  const [website, setWebsite] = useState('')
  const [sector, setSector] = useState<string>(SECTORS[0])
  const [stage, setStage] = useState<string>(PIPELINE_STAGES[0])
  const [quickNote, setQuickNote] = useState('')
  const [amountRaised, setAmountRaised] = useState('')
  const [existingInvestors, setExistingInvestors] = useState('')
  const [yearFounded, setYearFounded] = useState('')
  const [revenueModel, setRevenueModel] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitStatus, setSubmitStatus] = useState<string | null>(null)

  const { upload: uploadFile, isSubmitting: isUploading } = useUploadFile({ client: lemmaClient })
  const { create: createDeal, isSubmitting: isCreating } = useCreateRecord({
    client: lemmaClient,
    podId: lemmaClient.podId,
    tableName: 'deals',
  })
  const { update: updateDeal } = useUpdateRecord({
    client: lemmaClient,
    podId: lemmaClient.podId,
    tableName: 'deals',
  })

  const handleSubmit = async (startAnalysis: boolean) => {
    if (!companyName) return
    setSubmitStatus('Uploading deck...')

    try {
      let deckPath = null
      let isPpt = false
      if (file) {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
        isPpt = ext === 'ppt' || ext === 'pptx'
        const uploadDir = isPpt ? '/decks/ppt' : '/decks/pdf'
        const fileName = `${slugify(companyName)}-${generateId()}.${ext}`
        const path = `${uploadDir}/${fileName}`
        await uploadFile(file, {
          directoryPath: uploadDir,
          name: fileName
        })
        deckPath = path

        if (isPpt) {
          setSubmitStatus('Converting presentation to PDF...')
          try {
            const run = await lemmaClient.functions.runs.create('convert_deck', {
              input: {
                file_path: deckPath
              }
            })
            const newPath = ((run as any).output || (run as any).result)?.new_file_path
            if (newPath) {
              deckPath = newPath
            }
          } catch (e) {
            console.error("Failed to convert deck", e)
          }
        }

        if (startAnalysis) {
          setSubmitStatus('Processing document...')
          // Poll until the file is ready or errors out
          let isReady = false
          const pollTimeout = Date.now() + 60000
          while (!isReady) {
            if (Date.now() > pollTimeout) {
              throw new Error("File processing timed out after 60 seconds")
            }
            const uploadedFile = await lemmaClient.files.get(deckPath)
            if (uploadedFile.status === 'COMPLETED' || uploadedFile.status === 'ERROR') {
              isReady = true
            } else {
              await new Promise(r => setTimeout(r, 1500))
            }
          }
        }
      }

      setSubmitStatus('Saving deal...')
      const deal = await createDeal({
        company_name: companyName,
        website_url: website,
        sector,
        pipeline_stage: stage,
        status: startAnalysis ? 'Analyzing' : 'Pending',
        deck_file_path: deckPath,
        quick_note: quickNote || undefined,
        amount_raised: amountRaised || undefined,
        existing_investors: existingInvestors || undefined,
        year_founded: yearFounded ? (() => { const y = parseInt(yearFounded, 10); return isNaN(y) ? undefined : y })() : undefined,
        revenue_model: revenueModel || undefined,
      })

      let workflowRunId: string | null = null
      if (startAnalysis && deal) {
        setSubmitStatus('Starting analysis...')
        const run = await startDealResearch({ 
          deal_id: deal.id as string, 
          file_path: deckPath || '', 
          company_name: companyName, 
          sector: sector 
        })
        workflowRunId = run.id as string
        await updateDeal({ workflow_run_id: run.id as string }, { recordId: deal.id as string })
      }

      setSubmitStatus(null)
      setOpen(false)
      setTimeout(() => deal?.id && navigate(`/deal/${deal.id}`, { state: { workflowRunId } }), 300)
    } catch (err) {
      console.error(err)
      setSubmitStatus(null)
      alert("Failed to create deal")
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent className="w-[500px] sm:max-w-none flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-xl font-serif">New Deal</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Company Name *</Label>
            <Input 
              value={companyName} 
              onChange={e => setCompanyName(e.target.value)} 
              placeholder="e.g. Acme Corp" 
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Website URL</Label>
            <Input 
              value={website} 
              onChange={e => setWebsite(e.target.value)} 
              placeholder="https://..." 
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Pitch Deck (PDF)</Label>
            {!file ? (
              <div 
                className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => document.getElementById('deck-upload')?.click()}
              >
                <UploadCloud className="text-muted-foreground" size={32} />
                <span className="text-sm font-medium">Click to upload deck</span>
                <span className="text-xs text-muted-foreground">PDF, PPT, or PPTX (Max 20MB)</span>
                <input 
                  id="deck-upload" 
                  type="file" 
                  accept=".pdf, .ppt, .pptx" 
                  className="hidden" 
                  onChange={e => {
                    if (e.target.files?.[0]) setFile(e.target.files[0])
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg border">
                <FileText className="text-primary" size={20} />
                <span className="flex-1 text-sm font-medium truncate">{file.name}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-secondary/80" onClick={() => setFile(null)}>
                  <X size={14} />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Sector</Label>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Stage</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {PIPELINE_STAGES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Amount Raised</Label>
              <Input 
                value={amountRaised} 
                onChange={e => setAmountRaised(e.target.value)} 
                placeholder="e.g. $2M Seed" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Existing Investors</Label>
              <Input 
                value={existingInvestors} 
                onChange={e => setExistingInvestors(e.target.value)} 
                placeholder="e.g. Sequoia, a16z" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Year Founded</Label>
              <Input 
                value={yearFounded} 
                onChange={e => setYearFounded(e.target.value)} 
                placeholder="e.g. 2021" 
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Revenue Model</Label>
              <Input 
                value={revenueModel} 
                onChange={e => setRevenueModel(e.target.value)} 
                placeholder="e.g. SaaS, B2B" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Quick Note</Label>
            <Textarea 
              value={quickNote} 
              onChange={e => setQuickNote(e.target.value)} 
              placeholder="Initial thoughts or context..." 
              className="min-h-[100px]"
            />
          </div>
        </div>

        <SheetFooter className="p-6 border-t bg-secondary/30 flex gap-3 mt-auto items-center">
          <div className="flex w-full gap-3">
            <Button className="flex-1" variant="outline" onClick={() => handleSubmit(false)} disabled={!companyName || submitStatus !== null}>
              Save Deal
            </Button>
            <Button className="flex-1" onClick={() => handleSubmit(true)} disabled={!companyName || submitStatus !== null}>
              {submitStatus !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Working...
                </>
              ) : 'Save & Start Analysis'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

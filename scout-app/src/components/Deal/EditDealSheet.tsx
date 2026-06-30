import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '../ui/sheet'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { Loader2 } from 'lucide-react'
import { useUpdateRecord } from 'lemma-sdk/react'
import { lemmaClient } from '../../lemma-client'
import { SECTORS, PIPELINE_STAGES, formatStage } from '../../lib/utils'
import { startDealResearch } from '../../lib/workflow'

interface EditDealSheetProps {
  deal: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaveSuccess?: () => void
  showAnalyzeButton?: boolean
}

export function EditDealSheet({ deal, open, onOpenChange, onSaveSuccess, showAnalyzeButton = true }: EditDealSheetProps) {
  const navigate = useNavigate()
  const [isStarting, setIsStarting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    company_name: deal.company_name || '',
    website_url: deal.website_url || '',
    sector: deal.sector || SECTORS[0],
    pipeline_stage: deal.pipeline_stage || PIPELINE_STAGES[0],
    amount_raised: deal.amount_raised || '',
    existing_investors: deal.existing_investors || '',
    year_founded: deal.year_founded || '',
    revenue_model: deal.revenue_model || '',
    quick_note: deal.quick_note || ''
  })

  useEffect(() => {
    if (open) {
      setFormData({
        company_name: deal.company_name || '',
        website_url: deal.website_url || '',
        sector: deal.sector || SECTORS[0],
        pipeline_stage: deal.pipeline_stage || PIPELINE_STAGES[0],
        amount_raised: deal.amount_raised || '',
        existing_investors: deal.existing_investors || '',
        year_founded: deal.year_founded || '',
        revenue_model: deal.revenue_model || '',
        quick_note: deal.quick_note || ''
      })
    }
  }, [open, deal])
  
  const { update: updateDeal } = useUpdateRecord({
    client: lemmaClient,
    podId: lemmaClient.podId,
    tableName: 'deals',
  })

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await updateDeal({ 
        company_name: formData.company_name,
        website_url: formData.website_url,
        sector: formData.sector,
        pipeline_stage: formData.pipeline_stage,
        amount_raised: formData.amount_raised,
        existing_investors: formData.existing_investors,
        year_founded: formData.year_founded ? parseInt(formData.year_founded as string, 10) : undefined,
        revenue_model: formData.revenue_model,
        quick_note: formData.quick_note
      }, { recordId: deal.id })
      onOpenChange(false)
      if (onSaveSuccess) onSaveSuccess()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleStartAnalysis = async () => {
    try {
      setIsStarting(true)
      const run = await startDealResearch({ 
        deal_id: deal.id,
        file_path: deal.deck_file_path || '',
        company_name: deal.company_name || '',
        sector: deal.sector || '',
      })
      await updateDeal({ 
        company_name: formData.company_name,
        website_url: formData.website_url,
        sector: formData.sector,
        pipeline_stage: formData.pipeline_stage,
        amount_raised: formData.amount_raised,
        existing_investors: formData.existing_investors,
        year_founded: formData.year_founded ? parseInt(formData.year_founded as string, 10) : undefined,
        revenue_model: formData.revenue_model,
        quick_note: formData.quick_note,
        status: 'Analyzing', 
        workflow_run_id: run.id 
      }, { recordId: deal.id })
      onOpenChange(false)
      navigate(`/deal/${deal.id}`, { state: { workflowRunId: run.id } })
    } catch (err) {
      console.error(err)
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-none flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-xl font-serif">Edit Deal {showAnalyzeButton && "& Analyze"}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Company Name *</Label>
              <Input 
                value={formData.company_name} 
                onChange={e => setFormData({ ...formData, company_name: e.target.value })} 
                placeholder="e.g. Acme Corp" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Website</Label>
              <Input 
                value={formData.website_url} 
                onChange={e => setFormData({ ...formData, website_url: e.target.value })} 
                placeholder="e.g. https://acme.com" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Sector</Label>
              <Select value={formData.sector} onValueChange={(val) => setFormData({ ...formData, sector: val })}>
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
              <Label className="text-sm font-semibold">Pipeline Stage</Label>
              <Select value={formData.pipeline_stage} onValueChange={(val) => setFormData({ ...formData, pipeline_stage: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {PIPELINE_STAGES.map(s => (
                    <SelectItem key={s} value={s}>{formatStage(s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Amount Raised</Label>
              <Input 
                value={formData.amount_raised} 
                onChange={e => setFormData({ ...formData, amount_raised: e.target.value })} 
                placeholder="e.g. $1.5M" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Existing Investors</Label>
              <Input 
                value={formData.existing_investors} 
                onChange={e => setFormData({ ...formData, existing_investors: e.target.value })} 
                placeholder="e.g. Sequoia, YC" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Year Founded</Label>
              <Input 
                value={formData.year_founded} 
                type="number"
                onChange={e => setFormData({ ...formData, year_founded: e.target.value })} 
                placeholder="e.g. 2023" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Revenue Model</Label>
              <Input 
                value={formData.revenue_model} 
                onChange={e => setFormData({ ...formData, revenue_model: e.target.value })} 
                placeholder="e.g. B2B SaaS" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Quick Note</Label>
            <Textarea 
              value={formData.quick_note} 
              onChange={e => setFormData({ ...formData, quick_note: e.target.value })} 
              placeholder="Initial thoughts or context..." 
              className="min-h-[100px]"
            />
          </div>
        </div>
        <SheetFooter className="p-6 border-t bg-secondary/30 flex gap-3 mt-auto items-center">
          <div className="flex w-full gap-3">
            <Button className="flex-1" variant="outline" onClick={handleSave} disabled={isSaving || isStarting || !formData.company_name}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Deal
            </Button>
            {showAnalyzeButton && (
              <Button className="flex-1" onClick={handleStartAnalysis} disabled={isSaving || isStarting || !formData.company_name}>
                {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save & Start Analysis
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

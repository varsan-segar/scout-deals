import { useState } from 'react'
import { useRecords, useCreateRecord, useUpdateRecord, useDeleteRecord } from 'lemma-sdk/react'
import { lemmaClient } from '../lemma-client'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Checkbox } from '../components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { Settings, Plus, Trash2, Save, X } from 'lucide-react'

const SECTOR_OPTIONS = ["FinTech", "HealthTech", "EdTech", "SaaS B2B", "Consumer", "D2C", "PropTech", "DeepTech", "Other"]
const STAGE_OPTIONS = ["Screening", "Interested", "Meeting", "Term Sheet", "Passed"]
const GEOGRAPHY_OPTIONS = ["India", "US", "UK", "UAE", "SE Asia", "Europe", "Middle East", "Africa", "Latin America", "APAC"]

export function ThesisPage() {
  const { records: configList, isLoading } = useRecords({
    client: lemmaClient,
    podId: lemmaClient.podId,
    tableName: 'thesis_config',
  })
  
  const { create: createConfig } = useCreateRecord({
    client: lemmaClient,
    podId: lemmaClient.podId,
    tableName: 'thesis_config',
  })

  const { update: updateConfig } = useUpdateRecord({
    client: lemmaClient,
    podId: lemmaClient.podId,
    tableName: 'thesis_config',
  })

  const { remove: deleteConfig } = useDeleteRecord({
    client: lemmaClient,
    podId: lemmaClient.podId,
    tableName: 'thesis_config',
  })

  const config = configList?.[0] as any
  const [editing, setEditing] = useState(false)
  const [localConfig, setLocalConfig] = useState<any>(null)

  const parseTextArray = (value: unknown): string[] => {
    if (!value) return ['']
    if (Array.isArray(value)) return value
    if (typeof value === 'string') {
      if (value.trim() === '') return ['']
      try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) return parsed
        return value.split(',').map(s => s.trim()).filter(Boolean)
      } catch {
        return value.split(',').map(s => s.trim()).filter(Boolean)
      }
    }
    return ['']
  }

  const stringifyArray = (arr: string[]): string => {
    return JSON.stringify(arr.filter(Boolean))
  }

  const handleEdit = () => {
    setLocalConfig(config || {
      preferred_stages: '',
      preferred_sectors: '',
      founder_prefs: '',
      geography_focus: '',
      pre_revenue_ok: true,
      anti_thesis: '',
    })
    setEditing(true)
  }

  const handleSave = async () => {
    const toSave = {
      ...localConfig,
      preferred_stages: stringifyArray(parseTextArray(localConfig.preferred_stages)),
      preferred_sectors: stringifyArray(parseTextArray(localConfig.preferred_sectors)),
      founder_prefs: stringifyArray(parseTextArray(localConfig.founder_prefs)),
      geography_focus: stringifyArray(parseTextArray(localConfig.geography_focus)),
      anti_thesis: stringifyArray(parseTextArray(localConfig.anti_thesis)),
    }
    if (config?.id) {
      await updateConfig(toSave, { recordId: config.id })
    } else {
      await createConfig(toSave)
    }
    setEditing(false)
  }

  const updateField = (field: string, value: string) => {
    setLocalConfig({ ...localConfig, [field]: value })
  }

  const updateArrayField = (field: string, index: number, value: string) => {
    const newArr = [...parseTextArray(localConfig[field])]
    newArr[index] = value
    setLocalConfig({ ...localConfig, [field]: newArr })
  }

  const addArrayItem = (field: string) => {
    const arr = [...parseTextArray(localConfig[field]), '']
    setLocalConfig({ ...localConfig, [field]: arr })
  }

  const removeArrayItem = (field: string, index: number) => {
    const newArr = [...parseTextArray(localConfig[field])]
    newArr.splice(index, 1)
    setLocalConfig({ ...localConfig, [field]: newArr })
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h1 className="text-4xl font-serif tracking-tight mb-2">Thesis Config</h1>
          <p className="text-sm text-muted-foreground">
            Configure the parameters used by AI agents to score and screen deals.
          </p>
        </div>
        {!editing ? (
          <Button onClick={handleEdit} variant="outline">
            <Settings size={16} className="mr-2" /> Edit Config
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => setEditing(false)} variant="ghost">Cancel</Button>
            <Button onClick={handleSave}>
              <Save size={16} className="mr-2" /> Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <Card className="shadow-none border-border/60">
          <CardHeader>
            <CardTitle>Core Thesis</CardTitle>
            <CardDescription>The fundamental investment thesis that drives all decisions.</CardDescription>
          </CardHeader>
          <CardContent>
            {editing ? (
              <Textarea 
                value={localConfig.anti_thesis || ''}
                onChange={e => updateField('anti_thesis', e.target.value)}
                placeholder="We avoid companies that..."
                className="min-h-[120px]"
              />
            ) : (
              <p className="text-sm leading-relaxed">{config?.anti_thesis ? parseTextArray(config.anti_thesis).join(', ') : 'Not configured.'}</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/60">
          <CardHeader>
            <CardTitle>Anti-Thesis / Dealbreakers</CardTitle>
            <CardDescription>What makes you pass on a deal.</CardDescription>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-3">
                {parseTextArray(localConfig.anti_thesis).map((val: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <Input 
                      value={val} 
                      onChange={e => updateArrayField('anti_thesis', i, e.target.value)} 
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeArrayItem('anti_thesis', i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addArrayItem('anti_thesis')} className="mt-2">
                  <Plus size={14} className="mr-1" /> Add Item
                </Button>
              </div>
            ) : (
              <ul className="list-disc pl-5 space-y-2 text-sm">
                {config?.anti_thesis && parseTextArray(config.anti_thesis).length ? (
                  parseTextArray(config.anti_thesis).map((val: string, i: number) => (
                    <li key={i}>{val}</li>
                  ))
                ) : (
                  <li className="text-muted-foreground italic list-none -ml-5">Not configured.</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/60">
          <CardHeader>
            <CardTitle>Preferred Sectors</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Select onValueChange={val => {
                    const current = parseTextArray(localConfig.preferred_sectors).filter(Boolean)
                    setLocalConfig({ ...localConfig, preferred_sectors: [...current, val] })
                  }}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a sector..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTOR_OPTIONS.filter(o => !parseTextArray(localConfig.preferred_sectors).includes(o)).map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Or type custom..."
                    className="w-48 shrink-0"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim()
                        if (val) {
                          const current = parseTextArray(localConfig.preferred_sectors).filter(Boolean)
                          setLocalConfig({ ...localConfig, preferred_sectors: [...current, val] })
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {parseTextArray(localConfig.preferred_sectors).filter(Boolean).map((val: string, i: number) => (
                    <Badge key={i} variant="secondary" className="gap-1 pr-1">
                      {val}
                      <button onClick={() => removeArrayItem('preferred_sectors', i)} className="hover:text-destructive ml-1">
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="list-disc pl-5 space-y-2 text-sm">
                {config?.preferred_sectors && parseTextArray(config.preferred_sectors).length ? (
                  parseTextArray(config.preferred_sectors).map((val: string, i: number) => (
                    <li key={i}>{val}</li>
                  ))
                ) : (
                  <li className="text-muted-foreground italic list-none -ml-5">Not configured.</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/60">
          <CardHeader>
            <CardTitle>Preferred Stages</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Select onValueChange={val => {
                    const current = parseTextArray(localConfig.preferred_stages).filter(Boolean)
                    setLocalConfig({ ...localConfig, preferred_stages: [...current, val] })
                  }}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a stage..." />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGE_OPTIONS.filter(o => !parseTextArray(localConfig.preferred_stages).includes(o)).map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Or type custom..."
                    className="w-48 shrink-0"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim()
                        if (val) {
                          const current = parseTextArray(localConfig.preferred_stages).filter(Boolean)
                          setLocalConfig({ ...localConfig, preferred_stages: [...current, val] })
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {parseTextArray(localConfig.preferred_stages).filter(Boolean).map((val: string, i: number) => (
                    <Badge key={i} variant="secondary" className="gap-1 pr-1">
                      {val}
                      <button onClick={() => removeArrayItem('preferred_stages', i)} className="hover:text-destructive ml-1">
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="list-disc pl-5 space-y-2 text-sm">
                {config?.preferred_stages && parseTextArray(config.preferred_stages).length ? (
                  parseTextArray(config.preferred_stages).map((val: string, i: number) => (
                    <li key={i}>{val}</li>
                  ))
                ) : (
                  <li className="text-muted-foreground italic list-none -ml-5">Not configured.</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/60">
          <CardHeader>
            <CardTitle>Founder Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-3">
                {parseTextArray(localConfig.founder_prefs).map((val: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <Input 
                      value={val} 
                      onChange={e => updateArrayField('founder_prefs', i, e.target.value)} 
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeArrayItem('founder_prefs', i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addArrayItem('founder_prefs')} className="mt-2">
                  <Plus size={14} className="mr-1" /> Add Item
                </Button>
              </div>
            ) : (
              <ul className="list-disc pl-5 space-y-2 text-sm">
                {config?.founder_prefs && parseTextArray(config.founder_prefs).length ? (
                  parseTextArray(config.founder_prefs).map((val: string, i: number) => (
                    <li key={i}>{val}</li>
                  ))
                ) : (
                  <li className="text-muted-foreground italic list-none -ml-5">Not configured.</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/60">
          <CardHeader>
            <CardTitle>Geography Focus</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Select onValueChange={val => {
                    const current = parseTextArray(localConfig.geography_focus).filter(Boolean)
                    setLocalConfig({ ...localConfig, geography_focus: [...current, val] })
                  }}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a geography..." />
                    </SelectTrigger>
                    <SelectContent>
                      {GEOGRAPHY_OPTIONS.filter(o => !parseTextArray(localConfig.geography_focus).includes(o)).map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Or type custom..."
                    className="w-48 shrink-0"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim()
                        if (val) {
                          const current = parseTextArray(localConfig.geography_focus).filter(Boolean)
                          setLocalConfig({ ...localConfig, geography_focus: [...current, val] })
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {parseTextArray(localConfig.geography_focus).filter(Boolean).map((val: string, i: number) => (
                    <Badge key={i} variant="secondary" className="gap-1 pr-1">
                      {val}
                      <button onClick={() => removeArrayItem('geography_focus', i)} className="hover:text-destructive ml-1">
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="list-disc pl-5 space-y-2 text-sm">
                {config?.geography_focus && parseTextArray(config.geography_focus).length ? (
                  parseTextArray(config.geography_focus).map((val: string, i: number) => (
                    <li key={i}>{val}</li>
                  ))
                ) : (
                  <li className="text-muted-foreground italic list-none -ml-5">Not configured.</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/60">
          <CardHeader>
            <CardTitle>Pre-Revenue OK</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pre_revenue_ok"
                  checked={localConfig.pre_revenue_ok}
                  onCheckedChange={checked => updateField('pre_revenue_ok', checked.toString())}
                />
                <Label htmlFor="pre_revenue_ok" className="cursor-pointer">
                  We invest in pre-revenue companies
                </Label>
              </div>
            ) : (
              <p className="text-sm">{config?.pre_revenue_ok ? 'Yes' : 'No'}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
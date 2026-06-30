import { Link } from 'react-router-dom'
import {
  BookOpen,
  Plus,
  LayoutDashboard,
  Columns3,
  List,
  Settings,
  FileText,
  ExternalLink,
  ArrowRight,
  Lightbulb,
  Info,
  AlertTriangle,
  ChevronRight,
  Search,
  BrainCircuit,
  Users,
  Building2,
  Map,
  Target,
  ShieldAlert,
  GitPullRequest,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../components/ui/collapsible'
import { Button } from '../components/ui/button'

const pages = [
  { path: '/dashboard', icon: LayoutDashboard, name: 'Dashboard', desc: 'Overview of all deals with stats, charts, and recent activity' },
  { path: '/pipeline', icon: Columns3, name: 'Deal Board', desc: 'Kanban board to drag deals through screening stages' },
  { path: '/deals', icon: List, name: 'All Deals', desc: 'Searchable table of every deal with quick status view' },
  { path: '/deal/new', icon: Plus, name: 'New Deal', desc: 'Create a deal and upload a pitch deck to start analysis' },
  { path: '/deal/:id', icon: FileText, name: 'Deal Detail', desc: 'Full brief: analysis status, team, market, competitors, score' },
  { path: '/thesis', icon: Settings, name: 'Thesis Config', desc: 'Set scoring criteria, sectors, regions, and stage preferences' },
]

const agentSteps = [
  { icon: Search, name: 'Extract Deck', desc: 'Extracts structured data from uploaded pitch deck PDF' },
  { icon: Users, name: 'Research Team', desc: 'Researches founding team backgrounds via web search' },
  { icon: Users, name: 'Synthesise Team', desc: 'Synthesizes team research into structured founder profiles' },
  { icon: Building2, name: 'Size Market', desc: 'Analyzes TAM, SAM, SOM, growth rate, and market drivers' },
  { icon: Building2, name: 'Synthesise Market', desc: 'Synthesizes market research into structured market data' },
  { icon: Map, name: 'Map Competitors', desc: 'Identifies competitive landscape and positioning' },
  { icon: Map, name: 'Synthesise Competitors', desc: 'Synthesizes competitor data into structured profiles' },
  { icon: BrainCircuit, name: 'Synthesise Brief', desc: 'Generates risk flags, source citations, and aggregate brief' },
  { icon: Target, name: 'Score Deal', desc: 'Computes deterministic 0-10 thesis match score based on config' },
]

export function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-12">
      {/* Hero */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs font-mono">v1.0</Badge>
          <Badge variant="secondary">User Guide</Badge>
        </div>
        <h1 className="text-4xl font-serif font-bold tracking-tight">How to Use Scout</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          AI-powered deal screening for VC and angel investors. Upload a pitch deck, and Scout
          automatically generates a structured brief with team research, market sizing, competitive
          analysis, and a thesis match score.
        </p>
      </div>

      <Separator />

      {/* Pages Guide */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="text-primary" size={24} />
          <h2 className="text-2xl font-serif font-bold">App Pages</h2>
        </div>
        <p className="text-muted-foreground">
          Scout has six main screens. Here is what each one does and when to use it.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {pages.map((page) => (
            <Card key={page.path}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <page.icon size={18} className="text-primary" />
                  <CardTitle className="text-base">{page.name}</CardTitle>
                </div>
                <CardDescription>{page.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  to={page.path === '/deal/:id' ? '/deals' : page.path}
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  Open <ArrowRight size={14} />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* How to: Create a Deal */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Plus className="text-primary" size={24} />
          <h2 className="text-2xl font-serif font-bold">Create a Deal</h2>
        </div>

        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Before you start</AlertTitle>
          <AlertDescription>
            You need a PDF pitch deck ready to upload. Scout supports standard PDF pitch decks
            (not password-protected).
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {[
            { num: 1, title: 'Open the New Deal form', detail: 'Click the "New Deal" button in the sidebar, or navigate to any deal page and click "New Deal". The form opens as a slide-over panel on the right.',},
            { num: 2, title: 'Fill in deal details', detail: 'Enter the company name, stage (Pre-Seed, Seed, Series A, etc.), sector, and deal source. Add a description of what the company does.',},
            { num: 3, title: 'Upload the pitch deck', detail: 'Click the file upload area and select your PDF. Scout will convert and store the deck automatically.',},
            { num: 4, title: 'Submit to start analysis', detail: 'Click "Create Deal". This immediately launches the deal-research pipeline — Scout extracts the deck, researches the team, sizes the market, maps competitors, and computes a thesis score.',},
          ].map((step) => (
            <div key={step.num} className="flex gap-4">
              <Badge className="h-8 w-8 rounded-full p-0 flex items-center justify-center shrink-0 mt-0.5">
                {step.num}
              </Badge>
              <div className="space-y-1">
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* How to: Read a Brief */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <FileText className="text-primary" size={24} />
          <h2 className="text-2xl font-serif font-bold">Read a Brief</h2>
        </div>
        <p className="text-muted-foreground">
          After analysis completes, the deal detail page shows a full structured brief. Here is
          how to navigate it.
        </p>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="status">
            <AccordionTrigger className="text-base font-medium">Analysis Status</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>While the pipeline runs, a status tracker shows <strong>9 steps</strong> with real-time progress. Each step shows "Running", "Completed", or "Failed". If a step fails, you can click <strong>Retry</strong> to restart the pipeline from scratch.</p>
              <p>Once all steps complete, the status automatically transitions to <Badge variant="secondary">Ready</Badge> and the brief sections appear.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="score">
            <AccordionTrigger className="text-base font-medium">Thesis Match Score</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>The score bar (0-10) at the top of the brief shows how well the deal matches your configured thesis. Scores are color-coded:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><Badge variant="secondary">8-10</Badge> Strong match</li>
                <li><Badge variant="secondary">4-7</Badge> Moderate match</li>
                <li><Badge variant="secondary">0-3</Badge> Weak match</li>
              </ul>
              <p>Click on the score to see a breakdown of how each criterion contributed.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="sections">
            <AccordionTrigger className="text-base font-medium">Brief Sections</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>The brief is organized into collapsible sections:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Snapshot</strong> — Company stage, sector, deal source, description</li>
                <li><strong>Team</strong> — Founder backgrounds and key team profiles</li>
                <li><strong>Market</strong> — TAM/SAM/SOM, growth rate, key drivers</li>
                <li><strong>Competitors</strong> — Competitive landscape and positioning</li>
                <li><strong>Risks</strong> — Automatically identified risk flags</li>
                <li><strong>Sources</strong> — Citations for all research data</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="sidebar">
            <AccordionTrigger className="text-base font-medium">Deal Sidebar</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>The right sidebar shows:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Pipeline stage</strong> — Current screening stage; click to move the deal</li>
                <li><strong>Notes</strong> — Add or view notes on the deal</li>
                <li><strong>Actions</strong> — Retry analysis, delete deal, edit details</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <Separator />

      {/* How to: Use Pipeline Board */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <GitPullRequest className="text-primary" size={24} />
          <h2 className="text-2xl font-serif font-bold">Manage the Pipeline</h2>
        </div>

        <Collapsible className="space-y-4">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm">
              <Info className="h-4 w-4 mr-2" />
              What do the stages mean?
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="text-sm text-muted-foreground space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { stage: 'Screening', desc: 'Analysis pipeline is running or brief is ready for review.' },
                { stage: 'Interested', desc: 'Brief reviewed; deeper due diligence in progress.' },
                { stage: 'Meeting', desc: 'Meeting scheduled or in progress with the founding team.' },
                { stage: 'Term Sheet', desc: 'Negotiating terms for investment.' },
                { stage: 'Passed', desc: 'Decided not to proceed with the deal.' },
              ].map((s) => (
                <Card key={s.stage} className="p-3">
                  <p className="font-medium text-sm">{s.stage}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                </Card>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="space-y-4">
          <div className="flex gap-4">
            <Badge className="h-8 w-8 rounded-full p-0 flex items-center justify-center shrink-0 mt-0.5">1</Badge>
            <div className="space-y-1">
              <h3 className="font-semibold">Drag deals between stages</h3>
              <p className="text-sm text-muted-foreground">Grab a deal card and drop it into any stage column. The stage updates immediately.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Badge className="h-8 w-8 rounded-full p-0 flex items-center justify-center shrink-0 mt-0.5">2</Badge>
            <div className="space-y-1">
              <h3 className="font-semibold">Click a deal to open it</h3>
              <p className="text-sm text-muted-foreground">Click any deal card to navigate to its detail page and view the full brief.</p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* How to: Configure Thesis */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="text-primary" size={24} />
          <h2 className="text-2xl font-serif font-bold">Configure Thesis</h2>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Applies across all deals</AlertTitle>
          <AlertDescription>
            Your thesis configuration is global — it affects the match score for every deal in the pipeline.
            Changes take effect immediately on new analysis runs.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {[
            { num: 1, title: 'Set the title', detail: 'Give your thesis a name, e.g., "Early-Stage B2B SaaS Thesis".' },
            { num: 2, title: 'Configure criteria', detail: 'Add scoring criteria for sectors, stages, business models, and technical requirements. Each criterion has a weight (importance) and target values.' },
            { num: 3, title: 'Set preferences', detail: 'Choose preferred geographic regions, minimum team size, revenue thresholds, and other filters.' },
            { num: 4, title: 'Save', detail: 'Click Save. The compute_thesis_score function reads this config on every analysis run.' },
          ].map((step) => (
            <div key={step.num} className="flex gap-4">
              <Badge className="h-8 w-8 rounded-full p-0 flex items-center justify-center shrink-0 mt-0.5">
                {step.num}
              </Badge>
              <div className="space-y-1">
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Analysis Steps Reference */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-primary" size={24} />
          <h2 className="text-2xl font-serif font-bold">Analysis Pipeline Steps</h2>
        </div>
        <p className="text-muted-foreground">
          When you create a deal, Scout runs a 9-step pipeline. Here is what each step does.
        </p>
        <div className="space-y-2">
          {agentSteps.map((step, i) => (
            <Card key={step.name} className="flex items-center gap-4 p-4">
              <Badge variant="outline" className="h-8 w-8 rounded-full p-0 flex items-center justify-center shrink-0 font-mono">
                {i + 1}
              </Badge>
              <step.icon size={20} className="text-primary shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm">{step.name}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Troubleshooting */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-primary" size={24} />
          <h2 className="text-2xl font-serif font-bold">Troubleshooting</h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="analysis-failed">
            <AccordionTrigger className="text-base font-medium">Analysis step failed</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>If a step fails, the status tracker shows it in red. Click the <strong>Retry</strong> button (visible at the top of the deal page when a step fails) to restart the pipeline from the beginning.</p>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Common causes</AlertTitle>
                <AlertDescription>
                  PDF could not be parsed, web search timed out, or the thesis config has an invalid value.
                </AlertDescription>
              </Alert>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="not-loading">
            <AccordionTrigger className="text-base font-medium">Brief not loading after analysis</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              If the status shows "Ready" but the brief sections do not appear, try refreshing the page. The brief data is loaded via real-time subscription and may need a moment to sync.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="upload-error">
            <AccordionTrigger className="text-base font-medium">Deck upload error</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              Ensure your PDF is not password-protected and is under 20MB. Supported format: PDF only.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <Separator />

      {/* Resources */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="text-primary" size={24} />
          <h2 className="text-2xl font-serif font-bold">Resources</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ExternalLink size={16} />
                GitHub Repository
              </CardTitle>
              <CardDescription>
                Source code, architecture docs, setup instructions, and tech stack details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="https://github.com/varsan-segar/scout-deals"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                github.com/varsan-segar/scout-deals <ExternalLink size={14} />
              </a>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ExternalLink size={16} />
                Lemma Platform
              </CardTitle>
              <CardDescription>
                Backend platform documentation for agent and workflow development.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="https://lemma.work"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                lemma.work <ExternalLink size={14} />
              </a>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

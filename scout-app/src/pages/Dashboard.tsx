import { useLiveRecords } from 'lemma-sdk/react'
import { lemmaClient } from '../lemma-client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { PIPELINE_STAGES, SECTORS, formatScore, getScoreClass } from '../lib/utils'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '../components/ui/chart'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Loader2, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Dashboard() {
  const navigate = useNavigate()
  const { records: deals = [], isLoading, error } = useLiveRecords({
    client: lemmaClient,
    podId: lemmaClient.podId,
    tableName: 'deals',
  })

  if (error) {
    return (
      <div className="p-10 max-w-[1600px] mx-auto text-destructive">
        Error loading deals: {String(error)}
      </div>
    )
  }

  const dealsList = deals as any[]
  
  const totalDeals = dealsList.length
  const readyDeals = dealsList.filter(d => d.status === 'Ready').length
  const pendingDeals = dealsList.filter(d => d.status === 'Pending').length
  const analyzingDeals = dealsList.filter(d => d.status === 'Analyzing').length
  const cancelledDeals = dealsList.filter(d => d.status === 'Cancelled').length

  // Pipeline Data
  const pipelineData = PIPELINE_STAGES.map(stage => ({
    stage,
    total: dealsList.filter(d => d.pipeline_stage === stage).length
  }))

  const pipelineConfig = {
    total: {
      label: "Deals",
      color: "hsl(var(--primary))",
    }
  }

  // Sector Data
  const sectorData = SECTORS.map((sector, index) => ({
    name: sector,
    value: dealsList.filter(d => d.sector === sector).length,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`
  })).filter(s => s.value > 0)

  const sectorConfig = Object.fromEntries(
    SECTORS.map((sector, index) => [
      sector,
      { label: sector, color: `hsl(var(--chart-${(index % 5) + 1}))` }
    ])
  )

  // Score Distribution Data
  const scoreBuckets = [
    { label: "0-2", min: 0, max: 2, total: 0 },
    { label: "2-4", min: 2, max: 4, total: 0 },
    { label: "4-6", min: 4, max: 6, total: 0 },
    { label: "6-8", min: 6, max: 8, total: 0 },
    { label: "8-10", min: 8, max: 10.1, total: 0 },
  ]
  dealsList.forEach(d => {
    if (d.thesis_match_score !== null && d.thesis_match_score !== undefined) {
      const s = d.thesis_match_score
      const bucket = scoreBuckets.find(b => s >= b.min && s < b.max)
      if (bucket) bucket.total++
    }
  })
  const scoreConfig = {
    total: {
      label: "Deals",
      color: "hsl(var(--primary))",
    }
  }

  // Recent Deals (top 5 by created_at or updated_at)
  const recentDeals = [...dealsList]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="p-10 max-w-[1600px] mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-serif tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your deal pipeline and analysis status.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalDeals}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ready for Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{readyDeals}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Analyzing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-muted-foreground">{analyzingDeals}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-muted-foreground">{pendingDeals}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-muted-foreground">{cancelledDeals}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Pipeline Distribution */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Pipeline Distribution</CardTitle>
                <CardDescription>Number of deals in each pipeline stage.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={pipelineConfig} className="h-[300px] w-full">
                  <BarChart data={pipelineData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="stage"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.replace('_', ' ')}
                    />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip cursor={{ fill: 'var(--accent)' }} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Deals by Sector */}
            <Card>
              <CardHeader>
                <CardTitle>Sectors</CardTitle>
                <CardDescription>Deal distribution across sectors.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-0">
                <ChartContainer config={sectorConfig} className="h-[300px] w-full max-w-[300px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={sectorData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={4}>
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
                <CardDescription>Thesis match score buckets.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={scoreConfig} className="h-[250px] w-full">
                  <BarChart data={scoreBuckets}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip cursor={{ fill: 'var(--accent)' }} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Recent Deals Table */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>The 5 latest deals added to your pipeline.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-border/50">
                  <Table>
                    <TableHeader className="bg-secondary/30">
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Sector</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentDeals.map(deal => (
                        <TableRow key={deal.id}>
                          <TableCell className="font-medium">{deal.company_name}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{deal.sector}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize text-xs font-normal">
                              {deal.pipeline_stage}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize text-xs font-normal bg-secondary">
                              {deal.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {deal.thesis_match_score !== null && deal.thesis_match_score !== undefined ? (
                              <div className={`font-mono font-bold ${getScoreClass(deal.thesis_match_score)}`}>
                                {formatScore(deal.thesis_match_score)}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/deal/${deal.id}`)}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {recentDeals.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No deals yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

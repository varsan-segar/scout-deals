import { useNavigate } from 'react-router-dom'
import { useLiveRecords } from 'lemma-sdk/react'
import { lemmaClient } from '../lemma-client'
import { formatDate, formatSector, formatStage } from '../lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'

export function AllDealsPage() {
  const navigate = useNavigate()
  const { records: deals = [], isLoading, error } = useLiveRecords({
    client: lemmaClient,
    podId: lemmaClient.podId,
    tableName: 'deals',
  })

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
    <div className="p-10 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-serif tracking-tight mb-2">All Deals</h1>
        <p className="text-sm text-muted-foreground">
          Browse and manage all deals in your workspace.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(deals as any[]).map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="font-medium">{deal.company_name}</TableCell>
                  <TableCell>{formatSector(deal.sector)}</TableCell>
                  <TableCell>{formatStage(deal.pipeline_stage)}</TableCell>
                  <TableCell>
                    <Badge variant={deal.status === 'Error' ? 'destructive' : deal.status === 'Cancelled' ? 'outline' : deal.status === 'Ready' ? 'default' : 'secondary'}>
                      {deal.status === 'Analyzing' && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                      {deal.status || 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(deal.created_at)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/deal/${deal.id}`)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(deals as any[]).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No deals found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

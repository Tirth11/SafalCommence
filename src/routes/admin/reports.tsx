import { Download, FileText } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader, Panel } from '@/components/admin/primitives'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const REPORTS = [
  {
    name: 'Sales report',
    body: 'Orders, gross merchandise value and net sales by day, seller or category.',
    metrics: ['Orders: 4,286', 'GMV: $30,600', 'Net sales: $28,600'],
  },
  {
    name: 'Seller report',
    body: 'Registered, active and suspended sellers with sales contribution.',
    metrics: ['Registered: 612', 'Active: 485', 'Seller sales: $28,600'],
  },
  {
    name: 'Product report',
    body: 'Catalogue size, active listings and out-of-stock coverage.',
    metrics: ['Products: 13,120', 'Active: 12,450', 'Out of stock: 312'],
  },
  {
    name: 'Commission report',
    body: 'Platform commission by seller and by category for the selected period.',
    metrics: ['Total commission: $2,700', 'Avg rate: 9.2%', 'Top: Electronics'],
  },
  {
    name: 'Settlement report',
    body: 'Eligible, paid and on-hold settlements with net payable values.',
    metrics: ['Eligible: $1,600', 'Paid: $330', 'On hold: $760'],
  },
  {
    name: 'Refund report',
    body: 'Refund count and value, split by reason and seller.',
    metrics: ['Refunds: 18', 'Value: $530', 'Rejected: 4'],
  },
]

export function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Phase 1 reporting. Exports respect your role — masked fields stay masked in the file."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Reports', to: '/admin/reports' }]}
      />

      <Panel title="Report period" className="mb-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="grid gap-[7px]">
            <Label htmlFor="period">Period</Label>
            <Select defaultValue="30">
              <SelectTrigger id="period" className="w-[190px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-[7px]">
            <Label htmlFor="format">Format</Label>
            <Select defaultValue="csv">
              <SelectTrigger id="format" className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-[7px]">
            <Label htmlFor="scope">Seller scope</Label>
            <Select defaultValue="all">
              <SelectTrigger id="scope" className="w-[190px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sellers</SelectItem>
                <SelectItem value="active">Active sellers only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {REPORTS.map((report) => (
          <div key={report.name} className="flex flex-col rounded-lg border bg-card p-5 shadow-xs">
            <span className="grid size-10 place-items-center rounded-md bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-200">
              <FileText className="size-5" />
            </span>
            <h3 className="mt-4 text-[15px] font-semibold">{report.name}</h3>
            <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">{report.body}</p>
            <ul className="mt-4 grid gap-1.5 border-t pt-3.5">
              {report.metrics.map((m) => (
                <li key={m} className="text-[12px] font-medium text-ink-700 tabular dark:text-ink-200">
                  {m}
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => toast.success('Export queued', { description: `${report.name} · CSV` })}
            >
              <Download className="size-4" />
              Export
            </Button>
          </div>
        ))}
      </div>
    </>
  )
}

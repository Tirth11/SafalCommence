import { useState } from 'react'
import { Percent, Plus } from 'lucide-react'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { DataTable, type Column } from '@/components/admin/data-table'
import { MoneyRows, PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { COMMISSION_RULES, type CommissionRule } from '@/data/admin'
import { inr } from '@/lib/utils'

export function CommissionPage() {
  const [example, setExample] = useState(10000)
  const [rate, setRate] = useState(10)
  const { config, open, setOpen, ask } = useActionDialog()

  const commission = Math.round((example * rate) / 100)

  const columns: Column<CommissionRule>[] = [
    {
      key: 'rule',
      header: 'Rule',
      sortBy: (r) => r.name,
      cell: (r) => (
        <span className="block">
          <span className="block font-semibold text-ink-900 dark:text-white">{r.name}</span>
          <span className="block text-[11px] text-ink-500 tabular">{r.id}</span>
        </span>
      ),
    },
    { key: 'scope', header: 'Applies to', cell: (r) => <span className="block">{r.seller ?? r.category ?? 'All sellers and categories'}</span> },
    { key: 'level', header: 'Scope', hideBelow: 'lg', cell: (r) => <span className="text-ink-500">{r.scope}</span> },
    { key: 'type', header: 'Type', hideBelow: 'lg', cell: (r) => r.type },
    {
      key: 'value',
      header: 'Commission',
      align: 'right',
      cell: (r) => <span className="font-bold tabular text-ink-950 dark:text-white">{r.value}</span>,
    },
    { key: 'from', header: 'Effective from', hideBelow: 'md', cell: (r) => <span className="whitespace-nowrap text-ink-500">{r.from}</span> },
    { key: 'until', header: 'Effective until', hideBelow: 'xl', cell: (r) => <span className="whitespace-nowrap text-ink-500">{r.until}</span> },
    { key: 'status', header: 'Status', sortBy: (r) => r.status, cell: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: (r) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() =>
            ask({
              title: `Edit ${r.name}`,
              description: `Changing commission affects every order placed after the effective date. Current value: ${r.value}.`,
              confirmLabel: 'Save Change',
              extraFields: [
                { key: 'value', label: 'Commission value', placeholder: r.value, required: true },
                { key: 'from', label: 'Effective from', placeholder: 'DD MMM YYYY', required: true },
              ],
              requireNote: true,
              successMessage: 'Commission rule updated',
            })
          }
        >
          Edit
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Commission"
        description="Platform commission is applied per completed order. Rules resolve as seller override → category override → global default."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Commission', to: '/admin/commission' }]}
        actions={
          <Button
            size="sm"
            onClick={() =>
              ask({
                title: 'Add commission rule',
                description: 'Create a seller or category override. Overrides always beat the global default.',
                confirmLabel: 'Create Rule',
                extraFields: [
                  { key: 'name', label: 'Rule name', placeholder: 'e.g. Electronics category', required: true },
                  { key: 'value', label: 'Commission value', placeholder: 'e.g. 8%', required: true },
                  { key: 'from', label: 'Effective from', placeholder: 'DD MMM YYYY', required: true },
                ],
                requireNote: true,
                successMessage: 'Commission rule created',
              })
            }
          >
            <Plus className="size-4" />
            Add Rule
          </Button>
        }
      />

      <Alert variant="warning" className="mb-4">
        <Percent />
        <AlertTitle>Super Admin only</AlertTitle>
        <AlertDescription>
          Operations Admins can view commission but cannot change platform-wide rates. Every change is written to the audit
          log with the old and new value.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Panel title="Default commission" description="Applied when no seller or category override matches.">
            <div className="flex flex-wrap items-end gap-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Current default</p>
                <p className="mt-1 text-[38px] font-bold leading-none tracking-[-0.03em] text-ink-950 tabular dark:text-white">
                  10%
                </p>
              </div>
              <div className="grid gap-[7px]">
                <Label htmlFor="new-default">New default (%)</Label>
                <Input
                  id="new-default"
                  type="number"
                  min={0}
                  max={40}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="h-11 w-[120px]"
                />
              </div>
              <Button
                size="sm"
                onClick={() =>
                  ask({
                    title: 'Change default commission',
                    description: `The platform default will change from 10% to ${rate}%. Orders already placed are not affected.`,
                    confirmLabel: 'Change Default',
                    extraFields: [{ key: 'from', label: 'Effective from', placeholder: 'DD MMM YYYY', required: true }],
                    requireNote: true,
                    successMessage: `Default commission set to ${rate}%`,
                  })
                }
              >
                Save default
              </Button>
            </div>
        </Panel>

        <Panel title="Commission calculator" description="Check what a seller receives before changing a rate.">
          <div className="grid gap-[7px]">
            <Label htmlFor="calc-value">Product value (₹)</Label>
            <Input
              id="calc-value"
              type="number"
              min={0}
              value={example}
              onChange={(e) => setExample(Number(e.target.value))}
            />
          </div>
          <MoneyRows
            className="mt-4"
            rows={[
              { label: 'Product value', value: inr(example) },
              { label: `Commission at ${rate}%`, value: `− ${inr(commission)}`, tone: 'negative' },
              { label: 'Seller gross receivable', value: inr(example - commission), tone: 'total' },
            ]}
          />
          <p className="mt-4 text-[12px] leading-relaxed text-ink-500">
            Shipping, refunds and other deductions are applied separately at settlement and remain individually visible to
            the seller.
          </p>
        </Panel>
      </div>

      <div className="mt-4">
        <DataTable
            rows={COMMISSION_RULES}
            columns={columns}
            searchKeys={(r) => `${r.name} ${r.id} ${r.seller ?? ''} ${r.category ?? ''} ${r.scope}`}
            searchPlaceholder="Search rule, seller or category"
            filters={[
              { key: 'status', label: 'Status', options: ['Active', 'Scheduled', 'Expired'] },
              { key: 'scope', label: 'Scope', options: ['Global', 'Category', 'Seller'] },
            ]}
            exportName="Commission rules"
            empty={{ title: 'No commission rules', body: 'Only the platform default is configured.' }}
          />
      </div>

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}

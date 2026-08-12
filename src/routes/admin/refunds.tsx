import { useState } from 'react'
import { Check, Undo2, X } from 'lucide-react'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { AdminLink } from '@/components/admin/admin-link'
import { DataTable, type Column } from '@/components/admin/data-table'
import { DefinitionList, MoneyRows, PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { REFUNDS, RETURNS, type Refund, type ReturnRequest } from '@/data/admin'
import { money } from '@/lib/utils'

const REFUND_STATUSES = ['Requested', 'Under Review', 'Approved', 'Refund Initiated', 'Refunded', 'Rejected']
const REJECT_REASONS = [
  'Return window closed',
  'Product used or damaged by customer',
  'Claim could not be verified',
  'Duplicate refund request',
  'Policy exclusion',
]

export function RefundsPage() {
  const [selected, setSelected] = useState<Refund | null>(REFUNDS[2] ?? null)
  const { config, open, setOpen, ask } = useActionDialog()

  const columns: Column<Refund>[] = [
    {
      key: 'refund',
      header: 'Refund',
      sortBy: (r) => r.id,
      cell: (r) => (
        <button type="button" onClick={() => setSelected(r)} className="block text-left">
          <span className="block font-semibold tabular text-ink-900 hover:text-brand-700 dark:text-white">{r.id}</span>
          <span className="block text-[11px] text-ink-500 tabular">{r.order}</span>
        </button>
      ),
    },
    { key: 'buyer', header: 'Buyer', sortBy: (r) => r.buyer, cell: (r) => r.buyer },
    { key: 'seller', header: 'Seller', hideBelow: 'md', sortBy: (r) => r.seller, cell: (r) => r.seller },
    {
      key: 'amount',
      header: 'Refund amount',
      align: 'right',
      sortBy: (r) => r.amount,
      cell: (r) => (
        <span className="block">
          <span className="block font-semibold tabular text-ink-900 dark:text-white">{money(r.amount)}</span>
          {r.amount < r.orderValue && (
            <span className="block text-[11px] text-ink-400 tabular">of {money(r.orderValue)}</span>
          )}
        </span>
      ),
    },
    { key: 'reason', header: 'Reason', hideBelow: 'lg', cell: (r) => <span className="block max-w-[240px] truncate">{r.reason}</span> },
    { key: 'requested', header: 'Requested', hideBelow: 'md', sortBy: (r) => r.requested, cell: (r) => <span className="whitespace-nowrap text-ink-500">{r.requested}</span> },
    { key: 'status', header: 'Status', sortBy: (r) => r.status, cell: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: (r) => (
        <Button variant="outline" size="sm" className="h-8" onClick={() => setSelected(r)}>
          Review
        </Button>
      ),
    },
  ]

  const openDecision = selected && ['Requested', 'Under Review'].includes(selected.status)

  return (
    <>
      <PageHeader
        title="Refund requests"
        description="Review the order, the payment and both sides of the story before releasing money."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Payments', to: '/admin/payments' }, { label: 'Refunds', to: '/admin/refunds' }]}
      />

      <DataTable
        rows={REFUNDS}
        columns={columns}
        searchKeys={(r) => `${r.id} ${r.order} ${r.buyer} ${r.seller} ${r.reason}`}
        searchPlaceholder="Search refund, order, buyer or seller"
        filters={[{ key: 'status', label: 'Status', options: REFUND_STATUSES }]}
        exportName="Refunds"
        empty={{ title: 'No refund requests', body: 'There are no refund requests to review.' }}
      />

      {selected && (
        <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Panel
            title={`Refund review · ${selected.id}`}
            description={`Requested ${selected.requested}`}
            actions={<StatusBadge status={selected.status} />}
          >
            <DefinitionList
              items={[
                { label: 'Order', value: <AdminLink to={`/admin/orders/${selected.order}`} className="tabular text-brand-600 hover:underline dark:text-brand-300">{selected.order}</AdminLink> },
                { label: 'Buyer', value: selected.buyer },
                { label: 'Seller', value: selected.seller },
                { label: 'Order value', value: <span className="tabular">{money(selected.orderValue)}</span> },
              ]}
            />
            <div className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Buyer reason</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-700 dark:text-ink-200">{selected.reason}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Seller response</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-700 dark:text-ink-200">
                  {selected.sellerComment ?? 'No response from the seller yet.'}
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="Refund amount">
            <MoneyRows
              rows={[
                { label: 'Order value', value: money(selected.orderValue) },
                { label: 'Requested refund', value: money(selected.amount) },
                {
                  label: 'Commission reversal',
                  value: `− ${money(Math.round(selected.amount * 0.1))}`,
                  tone: 'negative',
                  hint: 'from seller settlement',
                },
                { label: 'Payable to buyer', value: money(selected.amount), tone: 'total' },
              ]}
            />
            {openDecision ? (
              <div className="mt-5 grid gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    ask({
                      title: 'Approve refund',
                      description: `You are about to refund ${money(selected.amount)} to ${selected.buyer}. Continue?`,
                      confirmLabel: 'Approve Refund',
                      successMessage: `Refund of ${money(selected.amount)} approved`,
                    })
                  }
                >
                  <Check className="size-4" />
                  Approve Refund
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    ask({
                      title: 'Modify refund amount',
                      description: 'Enter the amount to refund. The original order value stays recorded separately.',
                      confirmLabel: 'Approve Modified Refund',
                      extraFields: [{ key: 'amount', label: 'Refund amount ($)', placeholder: String(selected.amount), required: true }],
                      requireNote: true,
                      successMessage: 'Partial refund approved',
                    })
                  }
                >
                  <Undo2 className="size-4" />
                  Modify Amount
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/8"
                  onClick={() =>
                    ask({
                      title: 'Reject refund request',
                      description: `${selected.buyer} will be notified with the reason you select.`,
                      confirmLabel: 'Reject Refund',
                      destructive: true,
                      reasons: REJECT_REASONS,
                      requireNote: true,
                      successMessage: 'Refund request rejected',
                    })
                  }
                >
                  <X className="size-4" />
                  Reject Refund
                </Button>
              </div>
            ) : (
              <p className="mt-5 rounded-sm border bg-muted/60 px-3.5 py-3 text-[12px] text-ink-500">
                This request is already {selected.status.toLowerCase()} — no further action is available.
              </p>
            )}
          </Panel>
        </div>
      )}

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}

/* ------------------------------------------------------------- returns ---- */
const RETURN_STATUSES = [
  'Return Requested',
  'Under Review',
  'Approved',
  'Pickup Scheduled',
  'Product Received',
  'Quality Check',
  'Refund Initiated',
  'Refunded',
  'Rejected',
]

export function ReturnsPage() {
  const columns: Column<ReturnRequest>[] = [
    { key: 'ret', header: 'Return', sortBy: (r) => r.id, cell: (r) => <span className="font-semibold tabular text-ink-900 dark:text-white">{r.id}</span> },
    {
      key: 'order',
      header: 'Order',
      cell: (r) => (
        <AdminLink to={`/admin/orders/${r.order}`} className="tabular text-brand-600 hover:underline dark:text-brand-300">
          {r.order}
        </AdminLink>
      ),
    },
    { key: 'buyer', header: 'Buyer', sortBy: (r) => r.buyer, cell: (r) => r.buyer },
    { key: 'seller', header: 'Seller', hideBelow: 'md', sortBy: (r) => r.seller, cell: (r) => r.seller },
    { key: 'product', header: 'Product', hideBelow: 'lg', cell: (r) => <span className="block max-w-[220px] truncate">{r.product}</span> },
    { key: 'reason', header: 'Reason', hideBelow: 'xl', cell: (r) => r.reason },
    { key: 'requested', header: 'Requested', sortBy: (r) => r.requested, cell: (r) => <span className="whitespace-nowrap text-ink-500">{r.requested}</span> },
    { key: 'status', header: 'Status', sortBy: (r) => r.status, cell: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <>
      <PageHeader
        title="Return requests"
        description="Returns move through review, pickup, quality check and refund. Each step is visible to the buyer and the seller."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Orders', to: '/admin/orders' }, { label: 'Returns', to: '/admin/returns' }]}
      />

      <DataTable
        rows={RETURNS}
        columns={columns}
        searchKeys={(r) => `${r.id} ${r.order} ${r.buyer} ${r.seller} ${r.product} ${r.reason}`}
        searchPlaceholder="Search return, order, buyer, seller or product"
        filters={[{ key: 'status', label: 'Status', options: RETURN_STATUSES }]}
        rowHref={(r) => ({ to: `/admin/orders/${r.order}` })}
        exportName="Returns"
        empty={{ title: 'No return requests', body: 'There are no returns to process right now.' }}
      />

      <Panel className="mt-5" title="Return lifecycle">
        <ol className="flex flex-wrap items-center gap-2">
          {RETURN_STATUSES.slice(0, 8).map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden className="text-ink-300">→</span>}
              <StatusBadge status={step} />
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[12px] text-ink-500">
          A return can exit as <span className="font-semibold">Rejected</span> at review or quality check. Refunds are only
          initiated after the product passes quality check, unless an admin overrides with a recorded reason.
        </p>
      </Panel>
    </>
  )
}

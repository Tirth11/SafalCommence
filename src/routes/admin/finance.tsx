import { useNavigate, useParams } from '@tanstack/react-router'
import { Ban, Banknote, Check, Download, Landmark, TriangleAlert, X } from 'lucide-react'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { DataTable, type Column } from '@/components/admin/data-table'
import { DefinitionList, EmptyState, MoneyRows, PageHeader, Panel, Timeline } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  REFUNDS,
  RETURNS,
  SETTLEMENTS,
  TRANSACTIONS,
  type Refund,
  type ReturnRequest,
  type Settlement,
  type Transaction,
} from '@/data/admin'
import { inr } from '@/lib/utils'

/* --------------------------------------------------------- transactions --- */
export function AdminPaymentsPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const activeFilters = { status: search.status ?? '', gateway: search.gateway ?? '' }

  function setFilter(key: string, value: string) {
    const next = { ...search, [key]: value }
    if (!value) delete next[key]
    navigate(adminLinkProps({ to: '/admin/payments', search: next }))
  }

  const rows = TRANSACTIONS.filter(
    (t) => (!activeFilters.status || t.status === activeFilters.status) && (!activeFilters.gateway || t.gateway === activeFilters.gateway)
  )
  const failedView = activeFilters.status === 'Failed'

  const columns: Column<Transaction>[] = [
    {
      key: 'id',
      header: 'Transaction',
      sortBy: (t) => t.id,
      cell: (t) => (
        <span className="block">
          <span className="block font-semibold tabular text-ink-900 dark:text-white">{t.id}</span>
          <span className="block text-[11px] text-ink-500 tabular">{t.ref}</span>
        </span>
      ),
    },
    {
      key: 'order',
      header: 'Order',
      cell: (t) => (
        <AdminLink to={`/admin/orders/${t.order}`} className="tabular text-brand-600 hover:underline dark:text-brand-300">
          {t.order}
        </AdminLink>
      ),
    },
    { key: 'buyer', header: 'Buyer', hideBelow: 'md', sortBy: (t) => t.buyer, cell: (t) => t.buyer },
    { key: 'gateway', header: 'Gateway', hideBelow: 'lg', cell: (t) => t.gateway },
    { key: 'method', header: 'Method', hideBelow: 'lg', cell: (t) => t.method },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      sortBy: (t) => t.amount,
      cell: (t) => <span className="font-semibold tabular text-ink-900 dark:text-white">{inr(t.amount)}</span>,
    },
    { key: 'date', header: 'Date', hideBelow: 'xl', sortBy: (t) => t.date, cell: (t) => <span className="whitespace-nowrap text-ink-500">{t.date}</span> },
    { key: 'status', header: 'Status', sortBy: (t) => t.status, cell: (t) => <StatusBadge status={t.status} /> },
    ...(failedView
      ? [
          {
            key: 'failure',
            header: 'Failure reason',
            cell: (t: Transaction) => (
              <span className="block max-w-[260px]">
                <span className="block text-[12px] font-medium text-destructive">{t.failureReason ?? '—'}</span>
                <span className="block truncate text-[11px] text-ink-500">{t.gatewayMessage}</span>
              </span>
            ),
          } satisfies Column<Transaction>,
        ]
      : []),
  ]

  return (
    <>
      <PageHeader
        title={failedView ? 'Failed payments' : activeFilters.status ? `${activeFilters.status} transactions` : 'All transactions'}
        description={
          failedView
            ? 'Inspect gateway failures. Payments can only move to Successful through verified gateway reconciliation — never by hand.'
            : 'Every payment attempt across the marketplace, with gateway references for reconciliation.'
        }
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Payments', to: '/admin/payments' }]}
      />

      {failedView && (
        <Alert variant="warning" className="mb-4">
          <TriangleAlert />
          <AlertTitle>Manual status changes are disabled</AlertTitle>
          <AlertDescription>
            A failed payment becomes successful only when the gateway webhook or a reconciliation file confirms capture.
          </AlertDescription>
        </Alert>
      )}

      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={(t) => `${t.id} ${t.order} ${t.buyer} ${t.ref}`}
        searchPlaceholder="Search transaction, order, buyer or gateway reference"
        filters={[
          { key: 'status', label: 'Status', options: ['Initiated', 'Pending', 'Successful', 'Failed', 'Partially Refunded', 'Refunded'] },
          { key: 'gateway', label: 'Gateway', options: ['Razorpay'] },
        ]}
        activeFilters={activeFilters}
        onFilterChange={setFilter}
        exportName="Payments"
        empty={{ title: 'No transactions found', body: 'No payment matches the current filters.' }}
      />

      <p className="mt-4 text-[12px] text-ink-500">
        Card numbers, CVV and gateway credentials are never stored or displayed in the portal.
      </p>
    </>
  )
}

/* -------------------------------------------------------------- refunds --- */
export function AdminRefundsPage() {
  const { config, open, setOpen, ask } = useActionDialog()

  const columns: Column<Refund>[] = [
    {
      key: 'id',
      header: 'Refund',
      sortBy: (r) => r.id,
      cell: (r) => <span className="font-semibold tabular text-ink-900 dark:text-white">{r.id}</span>,
    },
    {
      key: 'order',
      header: 'Order',
      cell: (r) => (
        <AdminLink to={`/admin/orders/${r.order}`} className="tabular text-brand-600 hover:underline dark:text-brand-300">
          {r.order}
        </AdminLink>
      ),
    },
    { key: 'buyer', header: 'Buyer', hideBelow: 'md', cell: (r) => r.buyer },
    { key: 'seller', header: 'Seller', hideBelow: 'lg', cell: (r) => r.seller },
    {
      key: 'amount',
      header: 'Refund amount',
      align: 'right',
      sortBy: (r) => r.amount,
      cell: (r) => (
        <span className="block">
          <span className="block font-semibold tabular text-ink-900 dark:text-white">{inr(r.amount)}</span>
          {r.amount < r.orderValue && (
            <span className="block text-[11px] text-ink-500 tabular">partial of {inr(r.orderValue)}</span>
          )}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      hideBelow: 'lg',
      cell: (r) => (
        <span className="block max-w-[240px]">
          <span className="block truncate text-[12px] text-ink-700 dark:text-ink-200">{r.reason}</span>
          {r.sellerComment && <span className="block truncate text-[11px] text-ink-500">Seller: {r.sellerComment}</span>}
        </span>
      ),
    },
    { key: 'requested', header: 'Requested', hideBelow: 'xl', sortBy: (r) => r.requested, cell: (r) => <span className="whitespace-nowrap text-ink-500">{r.requested}</span> },
    { key: 'status', header: 'Status', sortBy: (r) => r.status, cell: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: (r) =>
        ['Requested', 'Under Review'].includes(r.status) ? (
          <div className="inline-flex gap-1.5">
            <Button
              size="sm"
              className="h-8"
              onClick={() =>
                ask({
                  title: 'Approve refund',
                  description: `You are about to refund ${inr(r.amount)} to ${r.buyer}. Commission and the seller's settlement are reversed. Continue?`,
                  confirmLabel: 'Approve Refund',
                  extraFields: [{ key: 'amount', label: 'Refund amount (₹)', placeholder: String(r.amount), required: true }],
                  successMessage: 'Refund approved',
                })
              }
            >
              <Check className="size-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-destructive/30 text-destructive hover:bg-destructive/8"
              onClick={() =>
                ask({
                  title: 'Reject refund request',
                  description: `${r.buyer} will be notified that the refund was declined. The reason is shared with the buyer.`,
                  confirmLabel: 'Reject Refund',
                  destructive: true,
                  reasons: ['Outside return window', 'Product used or damaged by buyer', 'Return not received', 'Claim not substantiated'],
                  requireNote: true,
                  successMessage: 'Refund rejected',
                })
              }
            >
              <X className="size-4" />
              Reject
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" className="h-8" asChild>
            <AdminLink to={`/admin/orders/${r.order}`}>View</AdminLink>
          </Button>
        ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Refund requests"
        description="Review buyer claims against the order, payment and the seller's response before releasing money."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Refunds', to: '/admin/refunds' }]}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Awaiting review', value: '2', hint: 'Requested + under review' },
          { label: 'Refund exposure', value: inr(REFUNDS.filter((r) => ['Requested', 'Under Review'].includes(r.status)).reduce((s, r) => s + r.amount, 0)), hint: 'Open requests' },
          { label: 'Refunded this week', value: inr(2449), hint: '1 refund' },
          { label: 'Rejected this week', value: '1', hint: 'Outside return window' },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border bg-card p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">{c.label}</p>
            <p className="mt-2 text-[22px] font-bold leading-none tabular text-ink-950 dark:text-white">{c.value}</p>
            <p className="mt-2 text-[11px] text-ink-500">{c.hint}</p>
          </div>
        ))}
      </div>

      <DataTable
        rows={REFUNDS}
        columns={columns}
        searchKeys={(r) => `${r.id} ${r.order} ${r.buyer} ${r.seller} ${r.reason}`}
        searchPlaceholder="Search refund, order, buyer or seller"
        filters={[{ key: 'status', label: 'Status', options: ['Requested', 'Under Review', 'Approved', 'Refund Initiated', 'Refunded', 'Rejected'] }]}
        exportName="Refunds"
        empty={{ title: 'No refund requests', body: 'Nothing is waiting on a refund decision right now.' }}
      />

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}

/* -------------------------------------------------------------- returns --- */
export function AdminReturnsPage() {
  const { config, open, setOpen, ask } = useActionDialog()

  const columns: Column<ReturnRequest>[] = [
    { key: 'id', header: 'Return', sortBy: (r) => r.id, cell: (r) => <span className="font-semibold tabular text-ink-900 dark:text-white">{r.id}</span> },
    {
      key: 'order',
      header: 'Order',
      cell: (r) => (
        <AdminLink to={`/admin/orders/${r.order}`} className="tabular text-brand-600 hover:underline dark:text-brand-300">
          {r.order}
        </AdminLink>
      ),
    },
    { key: 'buyer', header: 'Buyer', hideBelow: 'md', cell: (r) => r.buyer },
    { key: 'seller', header: 'Seller', hideBelow: 'lg', cell: (r) => r.seller },
    { key: 'product', header: 'Product', cell: (r) => <span className="block max-w-[200px] truncate">{r.product}</span> },
    { key: 'reason', header: 'Reason', hideBelow: 'lg', cell: (r) => <span className="text-[12px] text-ink-600 dark:text-ink-300">{r.reason}</span> },
    { key: 'requested', header: 'Requested', hideBelow: 'xl', cell: (r) => <span className="whitespace-nowrap text-ink-500">{r.requested}</span> },
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
              title: `Advance return ${r.id}`,
              description: `Move this return to the next stage. Current status: ${r.status}.`,
              confirmLabel: 'Update Return',
              reasons: ['Quality check passed', 'Quality check failed', 'Pickup completed', 'Buyer claim confirmed'],
              requireNote: true,
              successMessage: 'Return updated',
            })
          }
        >
          Manage
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Return requests"
        description="Track returns from request through pickup, quality check and refund."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Returns', to: '/admin/returns' }]}
      />

      <Panel className="mb-4" title="Return lifecycle">
        <ol className="flex flex-wrap items-center gap-2">
          {['Return Requested', 'Under Review', 'Approved', 'Pickup Scheduled', 'Product Received', 'Quality Check', 'Refund Initiated', 'Refunded'].map(
            (s, i) => (
              <li key={s} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden className="text-ink-300">→</span>}
                <StatusBadge status={s} />
              </li>
            )
          )}
        </ol>
      </Panel>

      <DataTable
        rows={RETURNS}
        columns={columns}
        searchKeys={(r) => `${r.id} ${r.order} ${r.buyer} ${r.seller} ${r.product}`}
        searchPlaceholder="Search return, order, buyer or product"
        filters={[{ key: 'status', label: 'Status', options: ['Return Requested', 'Under Review', 'Approved', 'Pickup Scheduled', 'Product Received', 'Quality Check', 'Refund Initiated', 'Refunded', 'Rejected'] }]}
        exportName="Returns"
        empty={{ title: 'No return requests', body: 'No returns are open right now.' }}
      />

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}

/* ---------------------------------------------------------- settlements --- */
export function AdminSettlementsPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const { config, open, setOpen, ask } = useActionDialog()

  const activeFilters = { status: search.status ?? '' }
  function setFilter(key: string, value: string) {
    const next = { ...search, [key]: value }
    if (!value) delete next[key]
    navigate(adminLinkProps({ to: '/admin/settlements', search: next }))
  }

  const rows = SETTLEMENTS.filter((s) => !activeFilters.status || s.status === activeFilters.status)

  const columns: Column<Settlement>[] = [
    {
      key: 'id',
      header: 'Settlement',
      sortBy: (s) => s.id,
      cell: (s) => (
        <AdminLink
          to={`/admin/settlements/${s.id}`}
          className="font-semibold tabular text-ink-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-300"
        >
          {s.id}
        </AdminLink>
      ),
    },
    {
      key: 'seller',
      header: 'Seller',
      sortBy: (s) => s.seller,
      cell: (s) => (
        <span className="block">
          <AdminLink to={`/admin/sellers/${s.sellerId}`} className="block text-ink-800 hover:text-brand-700 dark:text-ink-100">
            {s.seller}
          </AdminLink>
          <span className="block text-[11px] text-ink-500 tabular">{s.orders} orders</span>
        </span>
      ),
    },
    { key: 'period', header: 'Period', hideBelow: 'md', cell: (s) => <span className="whitespace-nowrap text-ink-500">{s.period}</span> },
    { key: 'gross', header: 'Gross sales', align: 'right', sortBy: (s) => s.gross, cell: (s) => <span className="tabular">{inr(s.gross)}</span> },
    { key: 'refunds', header: 'Refunds', align: 'right', hideBelow: 'xl', cell: (s) => <span className="tabular text-destructive">{s.refunds ? `− ${inr(s.refunds)}` : '—'}</span> },
    { key: 'commission', header: 'Commission', align: 'right', hideBelow: 'lg', cell: (s) => <span className="tabular text-destructive">− {inr(s.commission)}</span> },
    {
      key: 'net',
      header: 'Net payable',
      align: 'right',
      sortBy: (s) => s.net,
      cell: (s) => <span className="font-bold tabular text-ink-950 dark:text-white">{inr(s.net)}</span>,
    },
    { key: 'status', header: 'Status', sortBy: (s) => s.status, cell: (s) => <StatusBadge status={s.status} /> },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: (s) =>
        s.status === 'Eligible' ? (
          <Button
            size="sm"
            className="h-8"
            onClick={() =>
              ask({
                title: 'Mark settlement paid',
                description: `Confirm that ${inr(s.net)} has been paid to ${s.seller}.`,
                confirmLabel: 'Confirm Payment',
                extraFields: [
                  { key: 'date', label: 'Payment date', placeholder: '12 Aug 2026', required: true },
                  { key: 'reference', label: 'Payment reference number', placeholder: 'HDFC/NEFT/882910', required: true },
                ],
                requireNote: true,
                successMessage: `${s.id} marked paid`,
              })
            }
          >
            Mark Paid
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="h-8" asChild>
            <AdminLink to={`/admin/settlements/${s.id}`}>View</AdminLink>
          </Button>
        ),
    },
  ]

  const totals = {
    eligible: SETTLEMENTS.filter((s) => s.status === 'Eligible').reduce((sum, s) => sum + s.net, 0),
    pending: SETTLEMENTS.filter((s) => s.status === 'Pending').reduce((sum, s) => sum + s.net, 0),
    hold: SETTLEMENTS.filter((s) => s.status === 'On Hold').reduce((sum, s) => sum + s.net, 0),
    paid: SETTLEMENTS.filter((s) => s.status === 'Paid').reduce((sum, s) => sum + s.net, 0),
  }

  return (
    <>
      <PageHeader
        title={activeFilters.status ? `${activeFilters.status} settlements` : 'Seller settlements'}
        description="Phase 1 settles manually: verify the batch, pay from the bank, then record the reference here."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Settlements', to: '/admin/settlements' }]}
        actions={
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            Export batch
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Eligible now', value: inr(totals.eligible), hint: 'Ready to pay' },
          { label: 'Pending', value: inr(totals.pending), hint: 'Return window open' },
          { label: 'On hold', value: inr(totals.hold), hint: 'Blocked by review' },
          { label: 'Paid', value: inr(totals.paid), hint: 'Completed batches' },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border bg-card p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">{c.label}</p>
            <p className="mt-2 text-[22px] font-bold leading-none tabular text-ink-950 dark:text-white">{c.value}</p>
            <p className="mt-2 text-[11px] text-ink-500">{c.hint}</p>
          </div>
        ))}
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={(s) => `${s.id} ${s.seller} ${s.period} ${s.reference ?? ''}`}
        searchPlaceholder="Search settlement, seller or reference"
        filters={[{ key: 'status', label: 'Status', options: ['Pending', 'Eligible', 'Processing', 'Paid', 'On Hold'] }]}
        activeFilters={activeFilters}
        onFilterChange={setFilter}
        rowHref={(s) => ({ to: `/admin/settlements/${s.id}` })}
        exportName="Settlements"
        empty={{ title: 'No settlement pending', body: 'All eligible seller settlements have been processed.' }}
      />

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}

export function AdminSettlementDetailPage() {
  const { settlementId } = useParams({ strict: false }) as { settlementId?: string }
  const { config, open, setOpen, ask } = useActionDialog()
  const s = SETTLEMENTS.find((x) => x.id === settlementId)

  if (!s) {
    return (
      <Panel padded={false}>
        <EmptyState
          title="Settlement not found"
          body="This settlement reference does not exist."
          action={
            <Button variant="outline" size="sm" asChild>
              <AdminLink to="/admin/settlements">Back to settlements</AdminLink>
            </Button>
          }
        />
      </Panel>
    )
  }

  const eligibleSales = s.gross - s.refunds

  return (
    <>
      <PageHeader
        title={`Settlement ${s.id}`}
        description={`${s.seller} · ${s.period} · ${s.orders} orders`}
        breadcrumb={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'Settlements', to: '/admin/settlements' },
          { label: s.id, to: `/admin/settlements/${s.id}` },
        ]}
        actions={
          <>
            <StatusBadge status={s.status} />
            <Button variant="outline" size="sm">
              <Download className="size-4" />
              Settlement report
            </Button>
            {s.status === 'Eligible' && (
              <>
                <Button
                  size="sm"
                  onClick={() =>
                    ask({
                      title: 'Mark settlement paid',
                      description: `Confirm that ${inr(s.net)} has been paid to ${s.seller}.`,
                      confirmLabel: 'Confirm Payment',
                      extraFields: [
                        { key: 'date', label: 'Payment date', placeholder: '12 Aug 2026', required: true },
                        { key: 'reference', label: 'Payment reference number', placeholder: 'HDFC/NEFT/882910', required: true },
                      ],
                      requireNote: true,
                      successMessage: `${s.id} marked paid`,
                    })
                  }
                >
                  <Banknote className="size-4" />
                  Mark as Paid
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/8"
                  onClick={() =>
                    ask({
                      title: 'Place settlement on hold',
                      description: `${s.seller} will see "Settlement On Hold" with a support message. The seller keeps trading.`,
                      confirmLabel: 'Hold Settlement',
                      destructive: true,
                      reasons: ['Return risk', 'Dispute', 'Fraud investigation', 'KYC issue', 'Bank account issue'],
                      requireNote: true,
                      successMessage: 'Settlement placed on hold',
                    })
                  }
                >
                  <Ban className="size-4" />
                  Hold
                </Button>
              </>
            )}
          </>
        }
      />

      {s.status === 'On Hold' && (
        <Alert variant="destructive" className="mb-4">
          <TriangleAlert />
          <AlertTitle>Settlement on hold</AlertTitle>
          <AlertDescription>{s.holdReason}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title="Calculation">
          <MoneyRows
            rows={[
              { label: 'Gross sales', value: inr(s.gross), hint: `${s.orders} orders` },
              { label: 'Refunds', value: s.refunds ? `− ${inr(s.refunds)}` : '—', tone: 'negative' },
              { label: 'Eligible sales', value: inr(eligibleSales) },
              { label: 'Platform commission', value: `− ${inr(s.commission)}`, tone: 'negative' },
              { label: 'Shipping / deductions', value: s.deductions ? `− ${inr(s.deductions)}` : '—', tone: 'negative' },
              { label: 'Net settlement', value: inr(s.net), tone: 'total' },
            ]}
          />
        </Panel>

        <div className="grid content-start gap-4">
          <Panel title="Seller & payment">
            <DefinitionList
              columns={1}
              items={[
                {
                  label: 'Seller',
                  value: (
                    <AdminLink to={`/admin/sellers/${s.sellerId}`} className="text-brand-600 hover:underline dark:text-brand-300">
                      {s.seller}
                    </AdminLink>
                  ),
                  hint: s.sellerId,
                },
                { label: 'Settlement period', value: s.period },
                { label: 'Status', value: <StatusBadge status={s.status} /> },
                { label: 'Payment date', value: s.date ?? 'Not yet paid' },
                { label: 'Bank reference', value: s.reference ? <span className="tabular">{s.reference}</span> : '—' },
              ]}
            />
          </Panel>

          <Panel title="Lifecycle">
            <Timeline
              steps={[
                { label: 'Orders delivered', at: s.period, done: true },
                { label: 'Return window completed', at: 'Delivery + 7 days', done: s.status !== 'Pending' },
                { label: 'Eligible', at: s.status === 'Pending' ? 'Awaiting window' : 'Calculated', done: s.status !== 'Pending' },
                { label: 'Paid', at: s.date ?? (s.status === 'On Hold' ? 'On hold' : 'Pending'), done: s.status === 'Paid' },
              ]}
            />
          </Panel>

          <p className="flex items-start gap-2 text-[12px] text-ink-500">
            <Landmark className="mt-0.5 size-4 shrink-0" />
            Payments are made outside the portal in Phase 1. Recording the reference here closes the loop and writes the
            audit entry.
          </p>
        </div>
      </div>

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}

/* ----------------------------------------------------------- commission --- */
export function AdminCommissionPage() {
  const { config, open, setOpen, ask } = useActionDialog()

  return (
    <>
      <PageHeader
        title="Commission"
        description="Platform commission that applies to every completed order. Super Admin only."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Commission', to: '/admin/commission' }]}
        actions={
          <Button
            size="sm"
            onClick={() =>
              ask({
                title: 'Add commission rule',
                description: 'Rules resolve most-specific first: product → seller → category → global default.',
                confirmLabel: 'Create Rule',
                extraFields: [
                  { key: 'name', label: 'Rule name', placeholder: 'Electronics category', required: true },
                  { key: 'value', label: 'Commission value', placeholder: '8%', required: true },
                  { key: 'from', label: 'Effective from', placeholder: '01 Sep 2026', required: true },
                ],
                requireNote: true,
                successMessage: 'Commission rule created',
              })
            }
          >
            Add rule
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Panel title="Default commission" description="Applies when no seller or category override matches.">
          <div className="flex items-end gap-4">
            <p className="text-[44px] font-bold leading-none tracking-[-0.03em] tabular text-ink-950 dark:text-white">10%</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                ask({
                  title: 'Change default commission',
                  description:
                    'This applies to every order without a more specific rule. Existing orders keep the rate that applied when they were placed.',
                  confirmLabel: 'Update Commission',
                  extraFields: [{ key: 'value', label: 'New default commission (%)', placeholder: '10', required: true }],
                  requireNote: true,
                  successMessage: 'Default commission updated',
                })
              }
            >
              Change
            </Button>
          </div>

          <div className="mt-6 rounded-lg border bg-muted/50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Worked example</p>
            <MoneyRows
              className="mt-2"
              rows={[
                { label: 'Product value', value: inr(10000) },
                { label: 'Commission at 10%', value: `− ${inr(1000)}`, tone: 'negative' },
                { label: 'Seller gross receivable', value: inr(9000), tone: 'total' },
              ]}
            />
            <p className="mt-3 text-[12px] text-ink-500">
              Shipping and other deductions stay separately visible on the settlement so sellers can reconcile every rupee.
            </p>
          </div>
        </Panel>

        <Panel title="Commission rules" padded={false} description="Global default plus seller and category overrides.">
          <CommissionRules />
        </Panel>
      </div>

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}

function CommissionRules() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead className="bg-muted/60">
          <tr className="text-[11px] uppercase tracking-[0.06em] text-ink-500">
            <th className="px-5 py-2.5 font-bold">Rule</th>
            <th className="px-4 py-2.5 font-bold">Scope</th>
            <th className="px-4 py-2.5 font-bold">Type</th>
            <th className="px-4 py-2.5 text-right font-bold">Value</th>
            <th className="px-4 py-2.5 font-bold">Effective</th>
            <th className="px-4 py-2.5 font-bold">Status</th>
          </tr>
        </thead>
        <tbody>
          {COMMISSION_ROWS.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-5 py-3">
                <span className="block font-semibold text-ink-900 dark:text-white">{r.name}</span>
                <span className="block text-[11px] text-ink-500 tabular">{r.id}</span>
              </td>
              <td className="px-4 py-3 text-ink-600 dark:text-ink-300">
                {r.scope}
                {r.target && <span className="block text-[11px] text-ink-500">{r.target}</span>}
              </td>
              <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{r.type}</td>
              <td className="px-4 py-3 text-right font-bold tabular text-ink-950 dark:text-white">{r.value}</td>
              <td className="px-4 py-3 whitespace-nowrap text-ink-500">
                {r.from} → {r.until}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const COMMISSION_ROWS = [
  { id: 'CR-001', name: 'Platform default', scope: 'Global', target: '', type: 'Percentage', value: '10%', from: '01 Jan 2026', until: '—', status: 'Active' },
  { id: 'CR-014', name: 'Electronics category', scope: 'Category', target: 'Electronics', type: 'Percentage', value: '8%', from: '01 Apr 2026', until: '—', status: 'Active' },
  { id: 'CR-021', name: 'Fashion launch rate', scope: 'Category', target: 'Fashion', type: 'Percentage', value: '6%', from: '01 Jul 2026', until: '30 Sep 2026', status: 'Active' },
  { id: 'CR-030', name: 'ABC Electronics negotiated', scope: 'Seller', target: 'ABC Electronics', type: 'Percentage', value: '7.5%', from: '01 Sep 2026', until: '—', status: 'Scheduled' },
  { id: 'CR-008', name: 'Beauty introductory rate', scope: 'Category', target: 'Beauty', type: 'Percentage', value: '5%', from: '01 Feb 2026', until: '30 Jun 2026', status: 'Expired' },
]

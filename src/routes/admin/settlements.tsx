import { useNavigate, useParams } from '@tanstack/react-router'
import { Banknote, Check, FileText, Landmark, TriangleAlert } from 'lucide-react'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { DataTable, type Column } from '@/components/admin/data-table'
import { DefinitionList, EmptyState, MoneyRows, PageHeader, Panel, Timeline } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { SELLERS, SETTLEMENTS, type Settlement } from '@/data/admin'
import { money } from '@/lib/utils'

const STATUSES = ['Pending', 'Eligible', 'Processing', 'Paid', 'On Hold']
const HOLD_REASONS = ['Return risk', 'Dispute', 'Fraud investigation', 'KYC issue', 'Bank account issue']

export function SettlementsPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()

  const activeFilters = { status: search.status ?? '' }
  function setFilter(key: string, value: string) {
    const next = { ...search, [key]: value }
    if (!value) delete next[key]
    navigate(adminLinkProps({ to: '/admin/settlements', search: next }))
  }

  const rows = SETTLEMENTS.filter((s) => !activeFilters.status || s.status === activeFilters.status)
  const eligibleTotal = SETTLEMENTS.filter((s) => s.status === 'Eligible').reduce((sum, s) => sum + s.net, 0)

  const columns: Column<Settlement>[] = [
    {
      key: 'settlement',
      header: 'Settlement',
      sortBy: (s) => s.id,
      cell: (s) => (
        <span className="block">
          <AdminLink
            to={`/admin/settlements/${s.id}`}
            className="block font-semibold tabular text-ink-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-300"
          >
            {s.id}
          </AdminLink>
          <span className="block text-[11px] text-ink-500 tabular">{s.orders} orders</span>
        </span>
      ),
    },
    {
      key: 'seller',
      header: 'Seller',
      sortBy: (s) => s.seller,
      cell: (s) => (
        <AdminLink to={`/admin/sellers/${s.sellerId}`} className="text-ink-800 hover:text-brand-700 dark:text-ink-100">
          {s.seller}
        </AdminLink>
      ),
    },
    { key: 'period', header: 'Period', hideBelow: 'md', cell: (s) => <span className="whitespace-nowrap text-ink-500">{s.period}</span> },
    { key: 'gross', header: 'Gross sales', align: 'right', sortBy: (s) => s.gross, cell: (s) => <span className="tabular">{money(s.gross)}</span> },
    { key: 'refunds', header: 'Refunds', align: 'right', hideBelow: 'lg', cell: (s) => <span className="tabular text-destructive">{s.refunds ? `− ${money(s.refunds)}` : '—'}</span> },
    { key: 'commission', header: 'Commission', align: 'right', hideBelow: 'md', cell: (s) => <span className="tabular text-destructive">− {money(s.commission)}</span> },
    { key: 'deductions', header: 'Other', align: 'right', hideBelow: 'xl', cell: (s) => <span className="tabular">{s.deductions ? `− ${money(s.deductions)}` : '—'}</span> },
    {
      key: 'net',
      header: 'Net payable',
      align: 'right',
      sortBy: (s) => s.net,
      cell: (s) => <span className="font-bold tabular text-ink-950 dark:text-white">{money(s.net)}</span>,
    },
    { key: 'status', header: 'Status', sortBy: (s) => s.status, cell: (s) => <StatusBadge status={s.status} /> },
    { key: 'date', header: 'Settled', hideBelow: 'xl', cell: (s) => <span className="whitespace-nowrap text-ink-500">{s.date ?? '—'}</span> },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: (s) => (
        <Button variant="outline" size="sm" className="h-8" asChild>
          <AdminLink to={`/admin/settlements/${s.id}`}>{s.status === 'Eligible' ? 'Process' : 'View'}</AdminLink>
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title={activeFilters.status ? `${activeFilters.status} settlements` : 'Seller settlements'}
        description="Delivered orders become eligible once the return window closes. Phase 1 settlements are paid externally and marked here."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Settlements', to: '/admin/settlements' }]}
        actions={
          <Button variant="outline" size="sm">
            <FileText className="size-4" />
            Generate settlement report
          </Button>
        }
      />

      {eligibleTotal > 0 && (
        <Alert variant="info" className="mb-4">
          <Banknote />
          <AlertTitle>{money(eligibleTotal)} ready to pay</AlertTitle>
          <AlertDescription>
            Verify each settlement, pay through your bank, then record the payment reference to mark it paid. Bulk payment is
            intentionally not available.
          </AlertDescription>
        </Alert>
      )}

      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={(s) => `${s.id} ${s.seller} ${s.period} ${s.reference ?? ''}`}
        searchPlaceholder="Search settlement ID, seller or payment reference"
        filters={[{ key: 'status', label: 'Status', options: STATUSES }]}
        activeFilters={activeFilters}
        onFilterChange={setFilter}
        exportName="Settlements"
        empty={{ title: 'No settlement pending', body: 'All eligible seller settlements have been processed.' }}
      />
    </>
  )
}

/* ------------------------------------------------------ settlement detail -- */
export function SettlementDetailPage() {
  const { settlementId } = useParams({ strict: false }) as { settlementId?: string }
  const { config, open, setOpen, ask } = useActionDialog()

  const settlement = SETTLEMENTS.find((s) => s.id === settlementId)

  if (!settlement) {
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

  const seller = SELLERS.find((s) => s.id === settlement.sellerId)
  const eligibleSales = settlement.gross - settlement.refunds
  const canPay = settlement.status === 'Eligible' || settlement.status === 'Processing'

  return (
    <>
      <PageHeader
        title={`Settlement ${settlement.id}`}
        description={`${settlement.seller} · ${settlement.period} · ${settlement.orders} orders`}
        breadcrumb={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'Settlements', to: '/admin/settlements' },
          { label: settlement.id, to: `/admin/settlements/${settlement.id}` },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <FileText className="size-4" />
              Download report
            </Button>
            {settlement.status !== 'On Hold' && settlement.status !== 'Paid' && (
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/8"
                onClick={() =>
                  ask({
                    title: 'Hold settlement',
                    description: `${settlement.seller} will see "Settlement On Hold" with a support message. No payout is released until the hold is lifted.`,
                    confirmLabel: 'Hold Settlement',
                    destructive: true,
                    reasons: HOLD_REASONS,
                    requireNote: true,
                    successMessage: 'Settlement placed on hold',
                  })
                }
              >
                <TriangleAlert className="size-4" />
                Hold Settlement
              </Button>
            )}
            {canPay && (
              <Button
                size="sm"
                onClick={() =>
                  ask({
                    title: 'Confirm settlement payment',
                    description: `Confirm that ${money(settlement.net)} has been paid to ${settlement.seller}.`,
                    confirmLabel: 'Confirm Payment',
                    extraFields: [
                      { key: 'date', label: 'Payment date', placeholder: 'DD MMM YYYY', required: true },
                      { key: 'reference', label: 'Payment reference number', placeholder: 'HDFC/NEFT/000000', required: true },
                    ],
                    requireNote: true,
                    successMessage: `${settlement.id} marked paid`,
                  })
                }
              >
                <Check className="size-4" />
                Mark as Paid
              </Button>
            )}
          </>
        }
      />

      {settlement.holdReason && (
        <Alert variant="destructive" className="mb-4">
          <TriangleAlert />
          <AlertTitle>Settlement on hold</AlertTitle>
          <AlertDescription>{settlement.holdReason}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title="Settlement calculation">
          <MoneyRows
            rows={[
              { label: 'Gross sales', value: money(settlement.gross), hint: `${settlement.orders} orders` },
              { label: 'Refunds', value: `− ${money(settlement.refunds)}`, tone: 'negative' },
              { label: 'Eligible sales', value: money(eligibleSales) },
              { label: 'Platform commission', value: `− ${money(settlement.commission)}`, tone: 'negative', hint: '10% default' },
              { label: 'Shipping & other deductions', value: `− ${money(settlement.deductions)}`, tone: 'negative' },
              { label: 'Net settlement', value: money(settlement.net), tone: 'total' },
            ]}
          />
          <div className="mt-5 flex items-center justify-between gap-3 rounded-sm border bg-muted/60 px-4 py-3">
            <span className="text-[12px] font-semibold text-ink-600 dark:text-ink-300">Status</span>
            <StatusBadge status={settlement.status} />
          </div>
        </Panel>

        <div className="grid content-start gap-4">
          <Panel title="Payout account">
            {seller ? (
              <DefinitionList
                columns={1}
                items={[
                  { label: 'Account holder', value: seller.bank.holder },
                  { label: 'Bank', value: seller.bank.bank },
                  { label: 'Account number', value: <span className="tabular">XXXX{seller.bank.last4}</span> },
                  { label: 'IFSC', value: <span className="tabular">{seller.bank.ifsc}</span> },
                  { label: 'Verification', value: <StatusBadge status={seller.bank.verified ? 'Verified' : 'Pending'} /> },
                ]}
              />
            ) : (
              <p className="text-[13px] text-ink-500">Seller bank details unavailable.</p>
            )}
          </Panel>

          {settlement.reference && (
            <Panel title="Payment record">
              <DefinitionList
                columns={1}
                items={[
                  { label: 'Payment date', value: settlement.date ?? '—' },
                  { label: 'Reference number', value: <span className="tabular">{settlement.reference}</span> },
                ]}
              />
            </Panel>
          )}

          <Panel title="Settlement lifecycle">
            <Timeline
              steps={[
                { label: 'Orders delivered', at: settlement.period, done: true },
                { label: 'Return window completed', at: 'Delivery + 7 days', done: settlement.status !== 'Pending' },
                { label: 'Eligible for settlement', at: settlement.status === 'Pending' ? 'Awaiting window' : 'Calculated', done: settlement.status !== 'Pending' },
                { label: 'Payment processed', at: settlement.date ?? 'Not yet processed', done: settlement.status === 'Paid' },
                { label: 'Seller notified', at: settlement.status === 'Paid' ? 'Sent' : 'Pending', done: settlement.status === 'Paid' },
              ]}
            />
          </Panel>

          <p className="flex items-start gap-2 text-[12px] text-ink-500">
            <Landmark className="mt-0.5 size-4 shrink-0" />
            Marking a settlement paid records the actor, amount, date and bank reference in the audit log. It does not move
            money on its own.
          </p>
        </div>
      </div>

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}

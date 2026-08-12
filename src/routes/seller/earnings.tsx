import { useParams } from '@tanstack/react-router'
import { Banknote, Download, Globe, Landmark, Store, TriangleAlert, Wallet } from 'lucide-react'

import { AdminLink } from '@/components/admin/admin-link'
import { DataTable, type Column } from '@/components/admin/data-table'
import { DefinitionList, EmptyState, MoneyRows, PageHeader, Panel, Timeline } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { SellerStatusBanner } from '@/components/seller/status-banner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  SELLER_BUSINESS,
  SELLER_SETTLEMENTS,
  SELLER_TRANSACTIONS,
  SETTLEMENT_SUMMARY,
  type SellerSettlement,
  type SellerTransaction,
} from '@/data/seller'
import { usePlan } from '@/store/storefront-store'
import { inr } from '@/lib/utils'

/* --------------------------------------------------------- transactions --- */
export function SellerTransactionsPage() {
  const plan = usePlan()

  const columns: Column<SellerTransaction>[] = [
    {
      key: 'order',
      header: 'Order',
      sortBy: (t) => t.order,
      cell: (t) => (
        <span className="block">
          <AdminLink
            to={`/seller/orders/${t.order}`}
            className="block font-semibold tabular text-ink-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-300"
          >
            {t.order}
          </AdminLink>
          <span className="block text-[11px] text-ink-500 tabular">{t.id}</span>
        </span>
      ),
    },
    {
      key: 'channel',
      header: 'Source',
      sortBy: (t) => t.channel,
      cell: (t) => (
        <span
          className={
            'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ' +
            (t.channel === 'store'
              ? 'border-teal-100 bg-teal-50 text-teal-600 dark:border-teal-600/40 dark:bg-teal-600/15 dark:text-teal-100'
              : 'border-brand-100 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200')
          }
        >
          {t.channel === 'store' ? <Globe className="size-3" /> : <Store className="size-3" />}
          {t.channel === 'store' ? 'Online Store' : 'SafalMarketHub'}
        </span>
      ),
    },
    { key: 'date', header: 'Date', hideBelow: 'xl', sortBy: (t) => t.date, cell: (t) => <span className="whitespace-nowrap text-ink-500">{t.date}</span> },
    { key: 'gross', header: 'Gross sale', align: 'right', sortBy: (t) => t.gross, cell: (t) => <span className="tabular">{inr(t.gross)}</span> },
    {
      key: 'commission',
      header: 'SafalMarketHub fee',
      align: 'right',
      cell: (t) => (
        <span className="block">
          <span className="block tabular text-destructive">− {inr(t.commission)}</span>
          <span className="block text-[11px] text-ink-400">
            {t.channel === 'store' ? `${plan.ownStoreFee ?? 0}% platform fee` : `${plan.commission}% commission`}
          </span>
        </span>
      ),
    },
    {
      key: 'refund',
      header: 'Refund',
      align: 'right',
      hideBelow: 'lg',
      cell: (t) => <span className="tabular text-destructive">{t.refund ? `− ${inr(t.refund)}` : '—'}</span>,
    },
    {
      key: 'other',
      header: 'Other deduction',
      align: 'right',
      hideBelow: 'xl',
      cell: (t) => <span className="tabular">{t.otherDeduction ? `− ${inr(t.otherDeduction)}` : '—'}</span>,
    },
    {
      key: 'earnings',
      header: 'Your earnings',
      align: 'right',
      sortBy: (t) => t.earnings,
      cell: (t) => (
        <span className={'font-bold tabular ' + (t.earnings < 0 ? 'text-destructive' : 'text-ink-950 dark:text-white')}>
          {inr(t.earnings)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortBy: (t) => t.status,
      cell: (t) => (
        <span className="flex flex-col items-start gap-1">
          <StatusBadge
            status={
              t.status === 'Settlement Pending'
                ? 'Pending'
                : t.status === 'Settlement Eligible'
                  ? 'Eligible'
                  : t.status === 'Settled'
                    ? 'Paid'
                    : 'Returned'
            }
          />
          {t.settlementId && (
            <AdminLink
              to={`/seller/settlements/${t.settlementId}`}
              className="text-[11px] font-semibold text-brand-600 hover:underline dark:text-brand-300"
            >
              {t.settlementId}
            </AdminLink>
          )}
        </span>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Every order-level entry that builds up to your settlements."
        breadcrumb={[{ label: 'Dashboard', to: '/seller' }, { label: 'Transactions', to: '/seller/transactions' }]}
      />

      <SellerStatusBanner className="mb-5" />

      {/* The fee split, stated where sellers actually check their money */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-4 shadow-xs">
          <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-400">
            <Store className="size-3.5" />
            Marketplace sales
          </p>
          <p className="mt-2 text-[19px] font-bold tabular text-ink-950 dark:text-white">{plan.commission}% commission</p>
          <p className="mt-1 text-[12px] text-ink-500">SafalMarketHub brought the customer.</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-xs">
          <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-400">
            <Globe className="size-3.5" />
            Your own store
          </p>
          <p className="mt-2 text-[19px] font-bold tabular text-ink-950 dark:text-white">
            {plan.ownStoreFee === null ? 'Not on this plan' : `${plan.ownStoreFee}% platform fee`}
          </p>
          <p className="mt-1 text-[12px] text-ink-500">
            {plan.ownStoreFee === null ? 'Upgrade to sell on your own storefront.' : 'You brought the customer.'}
          </p>
        </div>
      </div>

      <DataTable
        rows={SELLER_TRANSACTIONS}
        columns={columns}
        searchKeys={(t) => `${t.id} ${t.order} ${t.settlementId ?? ''}`}
        searchPlaceholder="Search order or transaction ID"
        filters={[
          { key: 'status', label: 'Status', options: ['Settlement Pending', 'Settlement Eligible', 'Settled', 'Reversed'] },
          { key: 'channel', label: 'Source', options: ['SafalMarketHub', 'Online Store'] },
        ]}
        exportName="Transactions"
        empty={{ title: 'No transactions yet', body: 'Transactions appear once customers start buying your products.' }}
      />
    </>
  )
}

/* ---------------------------------------------------------- settlements --- */
export function SellerSettlementsPage() {
  const columns: Column<SellerSettlement>[] = [
    {
      key: 'id',
      header: 'Settlement',
      sortBy: (s) => s.id,
      cell: (s) => (
        <span className="block">
          <AdminLink
            to={`/seller/settlements/${s.id}`}
            className="block font-semibold tabular text-ink-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-300"
          >
            {s.id}
          </AdminLink>
          <span className="block text-[11px] text-ink-500 tabular">{s.orders} orders</span>
        </span>
      ),
    },
    { key: 'period', header: 'Period', hideBelow: 'md', cell: (s) => <span className="whitespace-nowrap text-ink-500">{s.period}</span> },
    { key: 'gross', header: 'Gross sales', align: 'right', sortBy: (s) => s.gross, cell: (s) => <span className="tabular">{inr(s.gross)}</span> },
    { key: 'refunds', header: 'Refunds', align: 'right', hideBelow: 'lg', cell: (s) => <span className="tabular text-destructive">{s.refunds ? `− ${inr(s.refunds)}` : '—'}</span> },
    { key: 'commission', header: 'Commission', align: 'right', hideBelow: 'md', cell: (s) => <span className="tabular text-destructive">− {inr(s.commission)}</span> },
    { key: 'deductions', header: 'Deductions', align: 'right', hideBelow: 'xl', cell: (s) => <span className="tabular">{s.deductions ? `− ${inr(s.deductions)}` : '—'}</span> },
    {
      key: 'net',
      header: 'Net settlement',
      align: 'right',
      sortBy: (s) => s.net,
      cell: (s) => <span className="font-bold tabular text-ink-950 dark:text-white">{inr(s.net)}</span>,
    },
    { key: 'status', header: 'Status', sortBy: (s) => s.status, cell: (s) => <StatusBadge status={s.status} /> },
    { key: 'date', header: 'Settlement date', hideBelow: 'lg', cell: (s) => <span className="whitespace-nowrap text-ink-500">{s.settledOn ?? '—'}</span> },
  ]

  const onHold = SELLER_SETTLEMENTS.find((s) => s.status === 'On Hold')

  return (
    <>
      <PageHeader
        title="Settlements"
        description="What SafalMarketHub owes you, what's on the way, and what has been paid."
        breadcrumb={[{ label: 'Dashboard', to: '/seller' }, { label: 'Settlements', to: '/seller/settlements' }]}
      />

      <SellerStatusBanner className="mb-5" />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Pending', value: SETTLEMENT_SUMMARY.pending, hint: 'Not yet eligible' },
          { label: 'Eligible', value: SETTLEMENT_SUMMARY.eligible, hint: 'Ready for processing' },
          { label: 'Processing', value: SETTLEMENT_SUMMARY.processing, hint: 'Payment in progress' },
          { label: 'Paid', value: SETTLEMENT_SUMMARY.paid, hint: 'Lifetime received' },
        ].map((card) => (
          <div key={card.label} className="rounded-lg border bg-card p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">{card.label}</p>
            <p className="mt-2 text-[22px] font-bold leading-none tracking-[-0.03em] tabular text-ink-950 dark:text-white">
              {inr(card.value)}
            </p>
            <p className="mt-2 text-[11px] text-ink-500">{card.hint}</p>
          </div>
        ))}
      </div>

      {onHold && (
        <Alert variant="warning" className="mb-4">
          <TriangleAlert />
          <AlertTitle>Settlement temporarily on hold</AlertTitle>
          <AlertDescription>
            {onHold.holdReason}{' '}
            <AdminLink to="/seller/support" className="font-semibold underline">
              Contact support
            </AdminLink>
          </AlertDescription>
        </Alert>
      )}

      {SELLER_SETTLEMENTS.length === 0 ? (
        <div className="rounded-lg border bg-card shadow-xs">
          <EmptyState
            icon={Wallet}
            title="No settlements yet"
            body="Your settlement history will appear here once eligible orders are completed."
          />
        </div>
      ) : (
        <DataTable
          rows={SELLER_SETTLEMENTS}
          columns={columns}
          searchKeys={(s) => `${s.id} ${s.period} ${s.reference ?? ''}`}
          searchPlaceholder="Search settlement ID or period"
          filters={[{ key: 'status', label: 'Status', options: ['Pending', 'Eligible', 'Processing', 'Paid', 'On Hold'] }]}
          rowHref={(s) => ({ to: `/seller/settlements/${s.id}` })}
          exportName="Settlements"
          empty={{ title: 'No settlements match', body: 'Try a different status filter.' }}
        />
      )}
    </>
  )
}

/* ------------------------------------------------------ settlement detail -- */
export function SellerSettlementDetailPage() {
  const { settlementId } = useParams({ strict: false }) as { settlementId?: string }
  const s = SELLER_SETTLEMENTS.find((x) => x.id === settlementId)

  if (!s) {
    return (
      <Panel padded={false}>
        <EmptyState
          title="Settlement not found"
          body="This settlement reference does not exist."
          action={
            <Button variant="outline" size="sm" asChild>
              <AdminLink to="/seller/settlements">Back to settlements</AdminLink>
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
        description={`${s.period} · ${s.orders} orders`}
        breadcrumb={[
          { label: 'Dashboard', to: '/seller' },
          { label: 'Settlements', to: '/seller/settlements' },
          { label: s.id, to: `/seller/settlements/${s.id}` },
        ]}
        actions={
          <>
            <StatusBadge status={s.status} />
            <Button variant="outline" size="sm">
              <Download className="size-4" />
              Download statement
            </Button>
          </>
        }
      />

      {s.status === 'On Hold' && (
        <Alert variant="warning" className="mb-5">
          <TriangleAlert />
          <AlertTitle>Settlement temporarily on hold</AlertTitle>
          <AlertDescription>
            {s.holdReason ?? 'This settlement is under review.'}{' '}
            <AdminLink to="/seller/support" className="font-semibold underline">
              Contact support
            </AdminLink>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title="Settlement breakdown">
          <MoneyRows
            rows={[
              { label: 'Gross sales', value: inr(s.gross), hint: `${s.orders} orders` },
              { label: 'Refunds', value: s.refunds ? `− ${inr(s.refunds)}` : '—', tone: 'negative' },
              { label: 'Eligible sales', value: inr(eligibleSales) },
              { label: 'Platform commission', value: `− ${inr(s.commission)}`, tone: 'negative' },
              { label: 'Other deductions', value: s.deductions ? `− ${inr(s.deductions)}` : '—', tone: 'negative', hint: 'shipping, adjustments' },
              { label: 'Net settlement', value: inr(s.net), tone: 'total' },
            ]}
          />
        </Panel>

        <div className="grid content-start gap-4">
          <Panel title="Payment">
            <DefinitionList
              columns={1}
              items={[
                { label: 'Payment status', value: <StatusBadge status={s.status} /> },
                { label: 'Payment date', value: s.settledOn ?? 'Not yet processed' },
                { label: 'Bank reference', value: s.reference ? <span className="tabular">{s.reference}</span> : '—' },
                { label: 'Paid to', value: <span className="tabular">{SELLER_BUSINESS.bank.masked}</span>, hint: SELLER_BUSINESS.bank.bank },
              ]}
            />
          </Panel>

          <Panel title="Settlement lifecycle">
            <Timeline
              steps={[
                { label: 'Orders delivered', at: s.period, done: true },
                { label: 'Return window completed', at: 'Delivery + 7 days', done: s.status !== 'Pending' },
                { label: 'Eligible for settlement', at: s.status === 'Pending' ? 'Awaiting window' : 'Calculated', done: s.status !== 'Pending' },
                { label: 'Payment processed', at: s.settledOn ?? (s.status === 'On Hold' ? 'On hold' : 'Pending'), done: s.status === 'Paid' },
              ]}
            />
          </Panel>

          <p className="flex items-start gap-2 text-[12px] text-ink-500">
            <Landmark className="mt-0.5 size-4 shrink-0" />
            Settlements are credited to your verified bank account. Change it from Business Profile → Bank settings.
          </p>
        </div>
      </div>

      <Panel className="mt-4" title="Included transactions" padded={false}>
        <ul className="divide-y">
          {SELLER_TRANSACTIONS.filter((t) => t.settlementId === s.id).map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
              <AdminLink to={`/seller/orders/${t.order}`} className="w-[128px] shrink-0 text-[13px] font-semibold tabular text-brand-600 hover:underline dark:text-brand-300">
                {t.order}
              </AdminLink>
              <span className="min-w-0 flex-1 text-[12px] text-ink-500">{t.date}</span>
              <span className="text-[13px] tabular text-ink-600 dark:text-ink-300">{inr(t.gross)}</span>
              <span className="text-[13px] tabular text-destructive">− {inr(t.commission)}</span>
              <span className="w-[92px] text-right text-[13px] font-bold tabular text-ink-950 dark:text-white">
                {inr(t.earnings)}
              </span>
            </li>
          ))}
          {SELLER_TRANSACTIONS.filter((t) => t.settlementId === s.id).length === 0 && (
            <li className="px-5 py-8">
              <p className="text-center text-[13px] text-ink-500">
                Transactions are attached to this settlement once the return window closes.
              </p>
            </li>
          )}
        </ul>
        <div className="flex items-center gap-2 border-t bg-muted/40 px-5 py-3">
          <Banknote className="size-4 text-ink-400" />
          <p className="text-[12px] text-ink-500">
            Every deduction stays individually visible — you can always reconcile a settlement back to its orders.
          </p>
        </div>
      </Panel>
    </>
  )
}

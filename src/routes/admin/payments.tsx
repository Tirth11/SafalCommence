import { useNavigate } from '@tanstack/react-router'
import { CircleAlert, Lock } from 'lucide-react'

import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { DataTable, type Column } from '@/components/admin/data-table'
import { PageHeader } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { TRANSACTIONS, type Transaction } from '@/data/admin'
import { money } from '@/lib/utils'

const STATUSES = ['Initiated', 'Pending', 'Successful', 'Failed', 'Partially Refunded', 'Refunded']
const METHODS = ['UPI', 'Credit Card', 'Netbanking']

export function PaymentsPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()

  const activeFilters = { status: search.status ?? '', method: search.method ?? '' }
  const failedView = activeFilters.status === 'Failed'

  function setFilter(key: string, value: string) {
    const next = { ...search, [key]: value }
    if (!value) delete next[key]
    navigate(adminLinkProps({ to: '/admin/payments', search: next }))
  }

  const rows = TRANSACTIONS.filter(
    (t) =>
      (!activeFilters.status || t.status === activeFilters.status) &&
      (!activeFilters.method || t.method === activeFilters.method)
  )

  const columns: Column<Transaction>[] = [
    {
      key: 'txn',
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
    { key: 'gateway', header: 'Gateway', hideBelow: 'xl', cell: (t) => t.gateway },
    { key: 'method', header: 'Method', hideBelow: 'lg', cell: (t) => t.method },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      sortBy: (t) => t.amount,
      cell: (t) => <span className="font-semibold tabular text-ink-900 dark:text-white">{money(t.amount)}</span>,
    },
    { key: 'date', header: 'Date', hideBelow: 'md', sortBy: (t) => t.date, cell: (t) => <span className="whitespace-nowrap text-ink-500">{t.date}</span> },
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
        title={failedView ? 'Failed payments' : activeFilters.status ? `${activeFilters.status} payments` : 'All transactions'}
        description={
          failedView
            ? 'Investigate failures against the gateway. Status can only change through verified gateway reconciliation.'
            : 'Payment transactions across the marketplace, with gateway references for reconciliation.'
        }
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Payments', to: '/admin/payments' }]}
      />

      {failedView && (
        <Alert variant="warning" className="mb-4">
          <CircleAlert />
          <AlertTitle>Manual status changes are blocked</AlertTitle>
          <AlertDescription>
            A failed payment cannot be marked successful from the portal. Resolve it through gateway reconciliation, which
            writes the corrected status back to SafalMarketHub.
          </AlertDescription>
        </Alert>
      )}

      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={(t) => `${t.id} ${t.order} ${t.buyer} ${t.ref} ${t.method}`}
        searchPlaceholder="Search transaction, order, buyer or gateway reference"
        filters={[
          { key: 'status', label: 'Status', options: STATUSES },
          { key: 'method', label: 'Method', options: METHODS },
        ]}
        activeFilters={activeFilters}
        onFilterChange={setFilter}
        exportName="Transactions"
        empty={{ title: 'No transactions found', body: 'No payment matches the current filters.' }}
      />

      <p className="mt-4 flex items-start gap-2 text-[12px] text-ink-500">
        <Lock className="mt-0.5 size-4 shrink-0" />
        Full card numbers, CVV and gateway credentials are never stored or displayed. Exports follow the same masking rules.
      </p>
    </>
  )
}

import { useNavigate } from '@tanstack/react-router'
import { FileCheck, Store } from 'lucide-react'

import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { DataTable, type Column } from '@/components/admin/data-table'
import { PageHeader } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { SELLERS, type Seller } from '@/data/admin'
import { money } from '@/lib/utils'

const SELLER_STATUSES = ['Registered', 'Onboarding', 'Pending Review', 'Active', 'Suspended', 'Payout Hold', 'Closed']
const KYC_STATUSES = ['Not Submitted', 'Submitted', 'Under Review', 'Verified', 'Changes Required', 'Rejected']
const BUSINESS_TYPES = ['Private Limited', 'LLP', 'Proprietorship']
const STATES = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Kerala', 'Gujarat', 'West Bengal']

/** Shared list surface for All / Pending / Active / Suspended / Payout Hold. */
export function SellersPage({ mode = 'sellers' }: { mode?: 'sellers' | 'kyc' }) {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const isKyc = mode === 'kyc'

  const activeFilters = {
    status: search.status ?? '',
    kyc: search.kyc ?? '',
    businessType: search.businessType ?? '',
    state: search.state ?? '',
  }

  function setFilter(key: string, value: string) {
    const next = { ...search, [key]: value }
    if (!value) delete next[key]
    navigate(adminLinkProps({ to: isKyc ? '/admin/kyc' : '/admin/sellers', search: next }))
  }

  let rows = SELLERS.filter(
    (s) =>
      (!activeFilters.status || s.status === activeFilters.status) &&
      (!activeFilters.kyc || s.kyc === activeFilters.kyc) &&
      (!activeFilters.businessType || s.businessType === activeFilters.businessType) &&
      (!activeFilters.state || s.state === activeFilters.state)
  )
  if (isKyc) rows = rows.filter((s) => ['Submitted', 'Under Review', 'Changes Required'].includes(s.kyc))

  const sellerColumns: Column<Seller>[] = [
    {
      key: 'store',
      header: 'Seller',
      sortBy: (s) => s.storeName,
      cell: (s) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-[11px] font-bold text-ink-600 dark:text-ink-300">
            {s.storeName.slice(0, 2).toUpperCase()}
          </span>
          <span className="min-w-0">
            <AdminLink
              to={`/admin/sellers/${s.id}`}
              className="block truncate font-semibold text-ink-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-300"
            >
              {s.storeName}
            </AdminLink>
            <span className="block truncate text-[11px] text-ink-500">
              {s.id} · {s.legalName}
            </span>
          </span>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner & contact',
      hideBelow: 'lg',
      cell: (s) => (
        <span className="block">
          <span className="block text-ink-800 dark:text-ink-100">{s.owner}</span>
          <span className="block text-[11px] text-ink-500">{s.email}</span>
          <span className="block text-[11px] text-ink-500 tabular">{s.phone}</span>
        </span>
      ),
    },
    { key: 'gstin', header: 'GSTIN', hideBelow: 'xl', cell: (s) => <span className="tabular text-ink-600 dark:text-ink-300">{s.gstin}</span> },
    { key: 'kyc', header: 'KYC', sortBy: (s) => s.kyc, cell: (s) => <StatusBadge status={s.kyc} /> },
    { key: 'status', header: 'Seller status', sortBy: (s) => s.status, cell: (s) => <StatusBadge status={s.status} /> },
    { key: 'products', header: 'Products', align: 'right', hideBelow: 'md', sortBy: (s) => s.products, cell: (s) => <span className="tabular">{s.products}</span> },
    { key: 'orders', header: 'Orders', align: 'right', hideBelow: 'md', sortBy: (s) => s.orders, cell: (s) => <span className="tabular">{s.orders}</span> },
    {
      key: 'sales',
      header: 'Total sales',
      align: 'right',
      sortBy: (s) => s.sales,
      cell: (s) => <span className="font-semibold tabular text-ink-900 dark:text-white">{s.sales ? money(s.sales) : '—'}</span>,
    },
    { key: 'registered', header: 'Registered', hideBelow: 'xl', sortBy: (s) => s.registered, cell: (s) => <span className="whitespace-nowrap text-ink-500">{s.registered}</span> },
  ]

  const kycColumns: Column<Seller>[] = [
    sellerColumns[0],
    { key: 'business', header: 'Business type', hideBelow: 'lg', cell: (s) => s.businessType },
    { key: 'gstin', header: 'GSTIN', hideBelow: 'md', cell: (s) => <span className="tabular">{s.gstin}</span> },
    { key: 'pan', header: 'PAN', hideBelow: 'xl', cell: (s) => <span className="tabular">{s.pan}</span> },
    {
      key: 'docs',
      header: 'Documents',
      cell: (s) => {
        const verified = s.documents.filter((d) => d.status === 'Verified').length
        const issues = s.documents.filter((d) => d.status === 'Issue Found').length
        return (
          <span className="block">
            <span className="block text-ink-800 dark:text-ink-100 tabular">
              {verified}/{s.documents.length} verified
            </span>
            {issues > 0 && <span className="block text-[11px] font-semibold text-destructive">{issues} issue found</span>}
          </span>
        )
      },
    },
    { key: 'submitted', header: 'Submitted', sortBy: (s) => s.submittedOn ?? '', cell: (s) => <span className="whitespace-nowrap text-ink-500">{s.submittedOn ?? '—'}</span> },
    { key: 'kyc', header: 'Status', sortBy: (s) => s.kyc, cell: (s) => <StatusBadge status={s.kyc} /> },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: (s) => (
        <Button size="sm" variant="outline" asChild>
          <AdminLink to={`/admin/sellers/${s.id}`} search={{ tab: 'kyc' }}>
            Review
          </AdminLink>
        </Button>
      ),
    },
  ]

  const heading = isKyc
    ? { title: 'KYC review queue', description: 'Sellers who have submitted verification documents and are waiting on a decision.' }
    : {
        title: activeFilters.status ? `${activeFilters.status} sellers` : 'All sellers',
        description: 'Every seller organisation on SafalMarketHub, with onboarding and payout state.',
      }

  return (
    <>
      <PageHeader
        title={heading.title}
        description={heading.description}
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: isKyc ? 'KYC queue' : 'Sellers', to: isKyc ? '/admin/kyc' : '/admin/sellers' }]}
        actions={
          !isKyc && (
            <Button variant="outline" size="sm" asChild>
              <AdminLink to="/admin/kyc">
                <FileCheck className="size-4" />
                KYC queue
              </AdminLink>
            </Button>
          )
        }
      />

      <DataTable
        rows={rows}
        columns={isKyc ? kycColumns : sellerColumns}
        searchKeys={(s) => `${s.storeName} ${s.legalName} ${s.owner} ${s.email} ${s.phone} ${s.gstin} ${s.id}`}
        searchPlaceholder="Search name, business, email, phone, GSTIN or seller ID"
        filters={
          isKyc
            ? [{ key: 'kyc', label: 'KYC', options: KYC_STATUSES }]
            : [
                { key: 'status', label: 'Status', options: SELLER_STATUSES },
                { key: 'kyc', label: 'KYC', options: KYC_STATUSES },
                { key: 'businessType', label: 'Type', options: BUSINESS_TYPES },
                { key: 'state', label: 'State', options: STATES },
              ]
        }
        activeFilters={activeFilters}
        onFilterChange={setFilter}
        rowHref={(s) => ({ to: `/admin/sellers/${s.id}` })}
        exportName={isKyc ? 'KYC queue' : 'Sellers'}
        empty={
          isKyc
            ? { title: 'No sellers pending approval', body: "You're all caught up. There are currently no seller applications awaiting review." }
            : { title: 'No sellers found', body: 'No seller matches the current filters. Clear a filter and try again.' }
        }
      />

      {!isKyc && (
        <p className="mt-4 flex items-start gap-2 text-[12px] text-ink-500">
          <Store className="mt-0.5 size-4 shrink-0" />
          Seller data is scoped per organisation on the seller side — this cross-organisation view is platform-level
          access, and every action you take here is written to the audit log.
        </p>
      )}
    </>
  )
}

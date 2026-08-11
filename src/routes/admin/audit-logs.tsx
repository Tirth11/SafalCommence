import { Lock } from 'lucide-react'

import { DataTable, type Column } from '@/components/admin/data-table'
import { PageHeader } from '@/components/admin/primitives'
import { AUDIT_LOG, type AuditEntry } from '@/data/admin'

const MODULES = ['Sellers', 'Products', 'Orders', 'Payments', 'Settlements', 'Commission', 'Admin Users']
const ACTIONS = [...new Set(AUDIT_LOG.map((a) => a.action))]

export function AuditLogsPage() {
  const columns: Column<AuditEntry>[] = [
    {
      key: 'at',
      header: 'Timestamp',
      sortBy: (a) => a.at,
      cell: (a) => <span className="whitespace-nowrap font-medium tabular text-ink-800 dark:text-ink-100">{a.at}</span>,
    },
    {
      key: 'admin',
      header: 'Admin user',
      sortBy: (a) => a.admin,
      cell: (a) => (
        <span className="block">
          <span className="block font-semibold text-ink-900 dark:text-white">{a.admin}</span>
          <span className="block text-[11px] text-ink-500">{a.role}</span>
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      sortBy: (a) => a.action,
      cell: (a) => (
        <span className="block">
          <span className="block font-semibold text-ink-900 dark:text-white">{a.action}</span>
          <span className="block text-[11px] text-ink-500">{a.module}</span>
        </span>
      ),
    },
    {
      key: 'target',
      header: 'Target record',
      hideBelow: 'md',
      cell: (a) => <span className="block max-w-[220px] truncate text-ink-700 dark:text-ink-200">{a.target}</span>,
    },
    {
      key: 'change',
      header: 'Change',
      hideBelow: 'lg',
      cell: (a) => (
        <span className="flex items-center gap-2 text-[12px]">
          <span className="rounded-sm bg-muted px-1.5 py-0.5 text-ink-500 line-through">{a.oldValue}</span>
          <span aria-hidden className="text-ink-300">→</span>
          <span className="rounded-sm bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-200">
            {a.newValue}
          </span>
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      hideBelow: 'xl',
      cell: (a) => <span className="block max-w-[240px] text-[12px] text-ink-600 dark:text-ink-300">{a.reason ?? '—'}</span>,
    },
    { key: 'ip', header: 'IP address', hideBelow: 'xl', cell: (a) => <span className="tabular text-ink-500">{a.ip}</span> },
  ]

  return (
    <>
      <PageHeader
        title="Audit logs"
        description="Every sensitive admin action, with the actor, the record, the change and the reason given."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Audit Logs', to: '/admin/audit-logs' }]}
      />

      <DataTable
        rows={AUDIT_LOG}
        columns={columns}
        searchKeys={(a) => `${a.id} ${a.admin} ${a.action} ${a.module} ${a.target} ${a.reason ?? ''} ${a.ip}`}
        searchPlaceholder="Search admin, action, record or reason"
        filters={[
          { key: 'module', label: 'Module', options: MODULES },
          { key: 'action', label: 'Action', options: ACTIONS },
          { key: 'role', label: 'Role', options: ['Super Admin', 'Operations Admin'] },
        ]}
        initialPageSize={25}
        exportName="Audit log"
        empty={{ title: 'No audit entries', body: 'No action matches the current filters.' }}
      />

      <p className="mt-4 flex items-start gap-2 text-[12px] text-ink-500">
        <Lock className="mt-0.5 size-4 shrink-0" />
        Audit entries are append-only. No admin role — including Super Admin — can edit or delete them from the application.
      </p>
    </>
  )
}

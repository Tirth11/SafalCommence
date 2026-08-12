import { Ban, Check, Minus, RotateCcw, Send, UserPlus } from 'lucide-react'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { DataTable, type Column } from '@/components/admin/data-table'
import { PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ADMIN_USERS, type AdminUser } from '@/data/admin'

/** Phase 1 permission matrix (spec §91). */
const MATRIX: { fn: string; superAdmin: 'yes'; ops: 'yes' | 'no' | 'limited' | 'read' | 'permission' }[] = [
  { fn: 'Dashboard', superAdmin: 'yes', ops: 'yes' },
  { fn: 'View sellers', superAdmin: 'yes', ops: 'yes' },
  { fn: 'Approve seller', superAdmin: 'yes', ops: 'yes' },
  { fn: 'Suspend seller', superAdmin: 'yes', ops: 'limited' },
  { fn: 'KYC review', superAdmin: 'yes', ops: 'yes' },
  { fn: 'View buyers', superAdmin: 'yes', ops: 'yes' },
  { fn: 'Suspend buyer', superAdmin: 'yes', ops: 'limited' },
  { fn: 'View products', superAdmin: 'yes', ops: 'yes' },
  { fn: 'Approve products', superAdmin: 'yes', ops: 'yes' },
  { fn: 'Manage categories', superAdmin: 'yes', ops: 'limited' },
  { fn: 'Manage brands', superAdmin: 'yes', ops: 'yes' },
  { fn: 'View orders', superAdmin: 'yes', ops: 'yes' },
  { fn: 'Cancel order', superAdmin: 'yes', ops: 'yes' },
  { fn: 'View payments', superAdmin: 'yes', ops: 'yes' },
  { fn: 'Process refund', superAdmin: 'yes', ops: 'permission' },
  { fn: 'Configure commission', superAdmin: 'yes', ops: 'no' },
  { fn: 'View settlements', superAdmin: 'yes', ops: 'yes' },
  { fn: 'Mark settlement paid', superAdmin: 'yes', ops: 'permission' },
  { fn: 'Reports', superAdmin: 'yes', ops: 'yes' },
  { fn: 'Support', superAdmin: 'yes', ops: 'yes' },
  { fn: 'Audit logs', superAdmin: 'yes', ops: 'read' },
  { fn: 'Manage admin users', superAdmin: 'yes', ops: 'no' },
  { fn: 'Platform settings', superAdmin: 'yes', ops: 'no' },
]

const OPS_LABEL = {
  yes: 'Full',
  no: '—',
  limited: 'Limited',
  read: 'Read only',
  permission: 'By permission',
} as const

export function AdminUsersPage() {
  const { config, open, setOpen, ask } = useActionDialog()

  const columns: Column<AdminUser>[] = [
    {
      key: 'user',
      header: 'Admin user',
      sortBy: (u) => u.name,
      cell: (u) => (
        <span className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
            {u.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </span>
          <span className="block">
            <span className="block font-semibold text-ink-900 dark:text-white">{u.name}</span>
            <span className="block text-[11px] text-ink-500">{u.email}</span>
          </span>
        </span>
      ),
    },
    { key: 'role', header: 'Role', sortBy: (u) => u.role, cell: (u) => u.role },
    { key: 'status', header: 'Status', sortBy: (u) => u.status, cell: (u) => <StatusBadge status={u.status} /> },
    { key: 'lastActive', header: 'Last active', hideBelow: 'md', cell: (u) => <span className="whitespace-nowrap text-ink-500">{u.lastActive}</span> },
    { key: 'created', header: 'Added', hideBelow: 'lg', cell: (u) => <span className="whitespace-nowrap text-ink-500">{u.created}</span> },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: (u) => (
        <div className="inline-flex gap-1.5">
          {u.status === 'Invited' && (
            <Button variant="ghost" size="sm" className="h-8">
              <Send className="size-4" />
              Resend
            </Button>
          )}
          {u.status === 'Suspended' ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() =>
                ask({
                  title: `Reactivate ${u.name}?`,
                  description: 'The admin regains access with their existing role.',
                  confirmLabel: 'Reactivate',
                  noteOnly: true,
                  requireNote: true,
                  successMessage: 'Admin reactivated',
                })
              }
            >
              <RotateCcw className="size-4" />
              Reactivate
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-destructive/30 text-destructive hover:bg-destructive/8"
              disabled={u.role === 'Super Admin' && u.id === 'ADM-001'}
              onClick={() =>
                ask({
                  title: `Suspend ${u.name}?`,
                  description: 'All active sessions end immediately and the account cannot sign in.',
                  confirmLabel: 'Suspend Admin',
                  destructive: true,
                  reasons: ['Left the organisation', 'Role change pending', 'Security concern', 'Policy violation'],
                  requireNote: true,
                  successMessage: 'Admin suspended',
                })
              }
            >
              <Ban className="size-4" />
              Suspend
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Admin users"
        description="Internal SafalMarketHub staff accounts and what each role is allowed to do."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Admin Users', to: '/admin/admin-users' }]}
        actions={
          <Button
            size="sm"
            onClick={() =>
              ask({
                title: 'Invite admin user',
                description: 'The invitee receives an account setup link. They choose their own password.',
                confirmLabel: 'Send Invitation',
                reasons: ['Super Admin', 'Operations Admin'],
                reasonLabel: 'Role',
                extraFields: [
                  { key: 'firstName', label: 'First name', placeholder: 'Enter first name', required: true },
                  { key: 'lastName', label: 'Last name', placeholder: 'Enter last name', required: true },
                  { key: 'email', label: 'Work email', placeholder: 'name@safalmarkethub.com', required: true },
                ],
                successMessage: 'Invitation sent',
              })
            }
          >
            <UserPlus className="size-4" />
            Invite Admin
          </Button>
        }
      />

      <DataTable
        rows={ADMIN_USERS}
        columns={columns}
        searchKeys={(u) => `${u.name} ${u.email} ${u.role} ${u.id}`}
        searchPlaceholder="Search name, email or role"
        filters={[
          { key: 'role', label: 'Role', options: ['Super Admin', 'Operations Admin'] },
          { key: 'status', label: 'Status', options: ['Invited', 'Active', 'Suspended', 'Deactivated'] },
        ]}
        exportName="Admin users"
        empty={{ title: 'No admin users', body: 'Invite a colleague to give them portal access.' }}
      />

      <Panel className="mt-5" title="Phase 1 permission matrix" description="Operations Admin is intentionally narrower than Super Admin." padded={false}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Function</TableHead>
              <TableHead className="text-center">Super Admin</TableHead>
              <TableHead className="text-center">Operations Admin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MATRIX.map((row) => (
              <TableRow key={row.fn}>
                <TableCell className="font-medium text-ink-800 dark:text-ink-100">{row.fn}</TableCell>
                <TableCell className="text-center">
                  <Check className="mx-auto size-4 text-teal-600 dark:text-teal-100" strokeWidth={3} />
                </TableCell>
                <TableCell className="text-center">
                  {row.ops === 'yes' ? (
                    <Check className="mx-auto size-4 text-teal-600 dark:text-teal-100" strokeWidth={3} />
                  ) : row.ops === 'no' ? (
                    <Minus className="mx-auto size-4 text-ink-300" />
                  ) : (
                    <span className="text-[11px] font-semibold text-gold-600 dark:text-gold-400">{OPS_LABEL[row.ops]}</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Ban,
  Download,
  FileText,
  Plus,
  RotateCcw,
  ScrollText,
  ShieldCheck,
  Tag,
} from 'lucide-react'
import { toast } from 'sonner'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { DataTable, type Column } from '@/components/admin/data-table'
import { DefinitionList, PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  ADMIN_USERS,
  AUDIT_LOG,
  BRANDS,
  BUYERS,
  CATEGORY_TREE,
  TICKETS,
  type AdminUser,
  type AuditEntry,
  type Brand,
  type Buyer,
  type Ticket,
} from '@/data/admin'
import { inr } from '@/lib/utils'

/* --------------------------------------------------------------- buyers --- */
export function AdminBuyersPage() {
  const { config, open, setOpen, ask } = useActionDialog()

  const columns: Column<Buyer>[] = [
    {
      key: 'buyer',
      header: 'Buyer',
      sortBy: (b) => b.name,
      cell: (b) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold text-ink-600 dark:text-ink-300">
            {b.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-ink-900 dark:text-white">{b.name}</span>
            <span className="block truncate text-[11px] text-ink-500 tabular">{b.id}</span>
          </span>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      hideBelow: 'md',
      cell: (b) => (
        <span className="block">
          <span className="block text-ink-700 dark:text-ink-200">{b.email}</span>
          <span className="block text-[11px] text-ink-500 tabular">{b.phone}</span>
        </span>
      ),
    },
    { key: 'city', header: 'City', hideBelow: 'lg', cell: (b) => b.city },
    { key: 'orders', header: 'Orders', align: 'right', sortBy: (b) => b.orders, cell: (b) => <span className="tabular">{b.orders}</span> },
    {
      key: 'spend',
      header: 'Total spend',
      align: 'right',
      sortBy: (b) => b.spend,
      cell: (b) => <span className="font-semibold tabular text-ink-900 dark:text-white">{inr(b.spend)}</span>,
    },
    { key: 'registered', header: 'Registered', hideBelow: 'xl', sortBy: (b) => b.registered, cell: (b) => <span className="whitespace-nowrap text-ink-500">{b.registered}</span> },
    { key: 'status', header: 'Account', sortBy: (b) => b.status, cell: (b) => <StatusBadge status={b.status} /> },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: (b) =>
        b.status === 'Active' ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-destructive/30 text-destructive hover:bg-destructive/8"
            onClick={() =>
              ask({
                title: `Suspend ${b.name}?`,
                description: 'The buyer cannot place new orders. Existing orders and refunds continue as normal.',
                confirmLabel: 'Suspend Account',
                destructive: true,
                reasons: ['Fraudulent activity', 'Payment abuse', 'Repeated fake returns', 'Policy violation', 'Security investigation'],
                requireNote: true,
                successMessage: `${b.name} suspended`,
              })
            }
          >
            <Ban className="size-4" />
            Suspend
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() =>
              ask({
                title: `Reactivate ${b.name}?`,
                description: 'The buyer regains full access to the marketplace.',
                confirmLabel: 'Reactivate Account',
                noteOnly: true,
                requireNote: true,
                successMessage: `${b.name} reactivated`,
              })
            }
          >
            <RotateCcw className="size-4" />
            Reactivate
          </Button>
        ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Buyers"
        description="Registered customers, order history and account state. Payment instruments are never exposed here."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Buyers', to: '/admin/buyers' }]}
      />

      <DataTable
        rows={BUYERS}
        columns={columns}
        searchKeys={(b) => `${b.name} ${b.email} ${b.phone} ${b.id} ${b.city}`}
        searchPlaceholder="Search name, email, phone or buyer ID"
        filters={[{ key: 'status', label: 'Status', options: ['Active', 'Suspended'] }]}
        exportName="Buyers"
        empty={{ title: 'No buyers found', body: 'No customer matches the current filters.' }}
      />

      <Alert variant="default" className="mt-4">
        <ShieldCheck />
        <AlertDescription>
          Saved cards and gateway tokens are not readable from the admin portal. Addresses and order history are visible
          for support purposes and access is audited.
        </AlertDescription>
      </Alert>

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}

/* ------------------------------------------------------------ catalogue --- */
export function AdminCataloguePage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const { config, open, setOpen, ask } = useActionDialog()
  const tab = search.tab ?? 'categories'

  const brandColumns: Column<Brand>[] = [
    { key: 'name', header: 'Brand', sortBy: (b) => b.name, cell: (b) => <span className="font-semibold text-ink-900 dark:text-white">{b.name}</span> },
    { key: 'id', header: 'Brand ID', hideBelow: 'md', cell: (b) => <span className="tabular text-ink-500">{b.id}</span> },
    { key: 'products', header: 'Products', align: 'right', sortBy: (b) => b.products, cell: (b) => <span className="tabular">{b.products}</span> },
    { key: 'requested', header: 'Requested by', hideBelow: 'lg', cell: (b) => b.requestedBy ?? '—' },
    { key: 'status', header: 'Status', sortBy: (b) => b.status, cell: (b) => <StatusBadge status={b.status === 'Pending Approval' ? 'Pending Review' : b.status} /> },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: (b) =>
        b.status === 'Pending Approval' ? (
          <Button
            size="sm"
            className="h-8"
            onClick={() =>
              ask({
                title: `Approve brand "${b.name}"?`,
                description: `${b.requestedBy} requested this brand. Approving lets any seller list products under it.`,
                confirmLabel: 'Approve Brand',
                successMessage: 'Brand approved',
              })
            }
          >
            Approve
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="h-8">
            Edit
          </Button>
        ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Catalogue"
        description="Categories and brands that structure the marketplace."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Catalogue', to: '/admin/catalogue' }]}
        actions={
          <Button
            size="sm"
            onClick={() =>
              ask({
                title: tab === 'categories' ? 'Add category' : 'Add brand',
                description:
                  tab === 'categories'
                    ? 'Categories can nest up to three levels: category → subcategory → leaf.'
                    : 'Brands are shared across sellers once approved.',
                confirmLabel: tab === 'categories' ? 'Create Category' : 'Create Brand',
                extraFields:
                  tab === 'categories'
                    ? [
                        { key: 'name', label: 'Category name', placeholder: 'Action Cameras', required: true },
                        { key: 'parent', label: 'Parent category', placeholder: 'Cameras' },
                        { key: 'order', label: 'Display order', placeholder: '1' },
                      ]
                    : [{ key: 'name', label: 'Brand name', placeholder: 'SoundPro', required: true }],
                successMessage: tab === 'categories' ? 'Category created' : 'Brand created',
              })
            }
          >
            <Plus className="size-4" />
            {tab === 'categories' ? 'Add Category' : 'Add Brand'}
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => navigate(adminLinkProps({ to: '/admin/catalogue', search: { tab: v } }))}>
        <TabsList className="mb-5">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Panel title="Category tree" description="Deactivate instead of deleting — categories with order history are never removed." padded={false}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">Category ID</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead className="hidden lg:table-cell text-right">Display order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CATEGORY_TREE.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <span
                        className="flex items-center gap-2"
                        style={{ paddingLeft: `${c.level * 20}px` }}
                      >
                        {c.level > 0 && <span aria-hidden className="text-ink-300">└</span>}
                        <Tag className={'size-3.5 shrink-0 ' + (c.level === 0 ? 'text-brand-600 dark:text-brand-300' : 'text-ink-400')} />
                        <span className={c.level === 0 ? 'font-semibold text-ink-900 dark:text-white' : 'text-ink-700 dark:text-ink-200'}>
                          {c.name}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell tabular text-ink-500">{c.id}</TableCell>
                    <TableCell className="text-right tabular">{c.products.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="hidden lg:table-cell text-right tabular text-ink-500">{c.order}</TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1.5">
                        <Button variant="ghost" size="sm" className="h-8">
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() =>
                            ask({
                              title: c.status === 'Active' ? `Deactivate "${c.name}"?` : `Activate "${c.name}"?`,
                              description:
                                c.status === 'Active'
                                  ? `${c.products} products sit in this category. Deactivating hides it from buyers; products may need reassignment.`
                                  : 'The category becomes visible to buyers and available to sellers again.',
                              confirmLabel: c.status === 'Active' ? 'Deactivate' : 'Activate',
                              destructive: c.status === 'Active',
                              requireNote: c.status === 'Active',
                              successMessage: 'Category updated',
                            })
                          }
                        >
                          {c.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="brands">
          <DataTable
            rows={BRANDS}
            columns={brandColumns}
            searchKeys={(b) => `${b.name} ${b.id} ${b.requestedBy ?? ''}`}
            searchPlaceholder="Search brand name or ID"
            filters={[{ key: 'status', label: 'Status', options: ['Active', 'Inactive', 'Pending Approval'] }]}
            exportName="Brands"
            empty={{ title: 'No brands found', body: 'No brand matches the current filters.' }}
          />
        </TabsContent>
      </Tabs>

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}

/* -------------------------------------------------------------- support --- */
export function AdminSupportPage() {
  const { config, open, setOpen, ask } = useActionDialog()
  const [note, setNote] = useState('')

  const columns: Column<Ticket>[] = [
    { key: 'id', header: 'Ticket', sortBy: (t) => t.id, cell: (t) => <span className="font-semibold tabular text-ink-900 dark:text-white">{t.id}</span> },
    {
      key: 'user',
      header: 'User',
      sortBy: (t) => t.user,
      cell: (t) => (
        <span className="block">
          <span className="block text-ink-800 dark:text-ink-100">{t.user}</span>
          <span className="block text-[11px] text-ink-500">{t.userType}</span>
        </span>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      cell: (t) => (
        <span className="block max-w-[300px]">
          <span className="block truncate font-medium text-ink-800 dark:text-ink-100">{t.subject}</span>
          <span className="block truncate text-[11px] text-ink-500">{t.description}</span>
        </span>
      ),
    },
    {
      key: 'order',
      header: 'Order',
      hideBelow: 'lg',
      cell: (t) =>
        t.order ? (
          <AdminLink to={`/admin/orders/${t.order}`} className="tabular text-brand-600 hover:underline dark:text-brand-300">
            {t.order}
          </AdminLink>
        ) : (
          <span className="text-ink-400">—</span>
        ),
    },
    { key: 'priority', header: 'Priority', sortBy: (t) => t.priority, cell: (t) => <StatusBadge status={t.priority} /> },
    { key: 'status', header: 'Status', sortBy: (t) => t.status, cell: (t) => <StatusBadge status={t.status} /> },
    { key: 'created', header: 'Created', hideBelow: 'xl', cell: (t) => <span className="whitespace-nowrap text-ink-500">{t.created}</span> },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: (t) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() =>
            ask({
              title: `Update ${t.id}`,
              description: `${t.subject} — change the status, respond to the user, or escalate.`,
              confirmLabel: 'Update Ticket',
              reasons: ['Responded to user', 'Waiting for customer', 'Waiting for seller', 'Escalated', 'Resolved', 'Closed'],
              reasonLabel: 'Action',
              requireNote: true,
              successMessage: 'Ticket updated',
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
        title="Support"
        description="Buyer and seller cases. Internal notes are never visible to the user."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Support', to: '/admin/support' }]}
      />

      <DataTable
        rows={TICKETS}
        columns={columns}
        searchKeys={(t) => `${t.id} ${t.user} ${t.subject} ${t.order ?? ''}`}
        searchPlaceholder="Search ticket, user, subject or order"
        filters={[
          { key: 'status', label: 'Status', options: ['Open', 'In Progress', 'Waiting for Customer', 'Waiting for Seller', 'Resolved', 'Closed'] },
          { key: 'priority', label: 'Priority', options: ['Low', 'Medium', 'High', 'Urgent'] },
        ]}
        exportName="Support tickets"
        empty={{ title: 'No tickets', body: 'There are no support cases matching these filters.' }}
      />

      <Panel className="mt-4" title="Internal note" description="Visible to SafalMarketHub staff only — never shown to buyers or sellers.">
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add context for the next agent picking this up." />
        <div className="mt-3">
          <Button
            size="sm"
            disabled={!note.trim()}
            onClick={() => {
              setNote('')
              toast.success('Internal note added')
            }}
          >
            Add internal note
          </Button>
        </div>
      </Panel>

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}

/* -------------------------------------------------------------- reports --- */
const REPORTS = [
  { title: 'Sales Report', body: 'Orders, GMV and net sales by period.', metrics: ['4,286 orders', '₹24.5L GMV', '₹22.9L net'] },
  { title: 'Seller Report', body: 'Registered, active sellers and seller-wise sales.', metrics: ['524 registered', '485 active', '₹24.5L sales'] },
  { title: 'Product Report', body: 'Total, active and out-of-stock products.', metrics: ['12,450 active', '312 out of stock', '52 in review'] },
  { title: 'Commission Report', body: 'Commission by seller and total platform commission.', metrics: ['₹2.14L total', '9.2% effective rate'] },
  { title: 'Settlement Report', body: 'Eligible, paid and on-hold settlements.', metrics: ['₹1.24L eligible', '₹61k on hold', '₹6.45L paid'] },
  { title: 'Refund Report', body: 'Refund count and refund value by period.', metrics: ['18 open', '₹42,180 exposure'] },
]

export function AdminReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Phase 1 operational reports. Every report exports to CSV or Excel, scoped to your permissions."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Reports', to: '/admin/reports' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {REPORTS.map((r) => (
          <Panel key={r.title} title={r.title} description={r.body}>
            <ul className="grid gap-1.5">
              {r.metrics.map((m) => (
                <li key={m} className="text-[13px] font-semibold tabular text-ink-800 dark:text-ink-100">
                  {m}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success('Export queued', { description: `${r.title} · CSV` })}
              >
                <Download className="size-4" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success('Export queued', { description: `${r.title} · Excel` })}
              >
                <FileText className="size-4" />
                Excel
              </Button>
            </div>
          </Panel>
        ))}
      </div>
    </>
  )
}

/* ----------------------------------------------------------- audit logs --- */
export function AdminAuditLogsPage() {
  const columns: Column<AuditEntry>[] = [
    { key: 'at', header: 'Timestamp', sortBy: (a) => a.at, cell: (a) => <span className="whitespace-nowrap text-ink-600 dark:text-ink-300">{a.at}</span> },
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
    { key: 'action', header: 'Action', sortBy: (a) => a.action, cell: (a) => <span className="font-medium text-ink-800 dark:text-ink-100">{a.action}</span> },
    { key: 'module', header: 'Module', hideBelow: 'lg', cell: (a) => a.module },
    { key: 'target', header: 'Target record', hideBelow: 'md', cell: (a) => <span className="block max-w-[220px] truncate text-ink-600 dark:text-ink-300">{a.target}</span> },
    {
      key: 'change',
      header: 'Change',
      cell: (a) => (
        <span className="flex flex-wrap items-center gap-1.5 text-[12px]">
          <span className="rounded border bg-muted px-1.5 py-0.5 text-ink-500">{a.oldValue}</span>
          <span aria-hidden className="text-ink-300">→</span>
          <span className="rounded border border-brand-200 bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200">
            {a.newValue}
          </span>
        </span>
      ),
    },
    { key: 'reason', header: 'Reason', hideBelow: 'xl', cell: (a) => <span className="block max-w-[220px] truncate text-[12px] text-ink-500">{a.reason ?? '—'}</span> },
    { key: 'ip', header: 'IP address', hideBelow: 'xl', cell: (a) => <span className="tabular text-ink-500">{a.ip}</span> },
  ]

  return (
    <>
      <PageHeader
        title="Audit logs"
        description="Every sensitive action, who performed it, what changed and why."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Audit Logs', to: '/admin/audit-logs' }]}
      />

      <Alert variant="default" className="mb-4">
        <ScrollText />
        <AlertTitle>Logs are immutable</AlertTitle>
        <AlertDescription>
          Audit entries cannot be edited or deleted from the application — including by Super Admin. Operations Admin has
          read-only access.
        </AlertDescription>
      </Alert>

      <DataTable
        rows={AUDIT_LOG}
        columns={columns}
        searchKeys={(a) => `${a.admin} ${a.action} ${a.module} ${a.target} ${a.reason ?? ''} ${a.ip}`}
        searchPlaceholder="Search admin, action, module or record"
        filters={[
          { key: 'module', label: 'Module', options: ['Sellers', 'Products', 'Orders', 'Payments', 'Settlements', 'Commission', 'Admin Users'] },
          { key: 'role', label: 'Role', options: ['Super Admin', 'Operations Admin'] },
        ]}
        exportName="Audit log"
        initialPageSize={25}
        empty={{ title: 'No audit entries', body: 'No action matches the current filters.' }}
      />
    </>
  )
}

/* ---------------------------------------------------------- admin users --- */
export function AdminUsersPage() {
  const { config, open, setOpen, ask } = useActionDialog()

  const columns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: 'Admin user',
      sortBy: (u) => u.name,
      cell: (u) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
            {u.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-ink-900 dark:text-white">{u.name}</span>
            <span className="block truncate text-[11px] text-ink-500">{u.email}</span>
          </span>
        </div>
      ),
    },
    { key: 'role', header: 'Role', sortBy: (u) => u.role, cell: (u) => <StatusBadge status={u.role === 'Super Admin' ? 'Verified' : 'Submitted'} className="capitalize" /> },
    { key: 'status', header: 'Status', sortBy: (u) => u.status, cell: (u) => <StatusBadge status={u.status} /> },
    { key: 'lastActive', header: 'Last active', hideBelow: 'md', cell: (u) => <span className="whitespace-nowrap text-ink-500">{u.lastActive}</span> },
    { key: 'created', header: 'Added', hideBelow: 'lg', cell: (u) => <span className="whitespace-nowrap text-ink-500">{u.created}</span> },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: (u) => (
        <div className="inline-flex gap-1.5">
          <Button variant="ghost" size="sm" className="h-8">
            Edit
          </Button>
          {u.status === 'Active' && u.role !== 'Super Admin' && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-destructive/30 text-destructive hover:bg-destructive/8"
              onClick={() =>
                ask({
                  title: `Suspend ${u.name}?`,
                  description: 'The user is signed out of all sessions immediately and cannot sign back in.',
                  confirmLabel: 'Suspend User',
                  destructive: true,
                  reasons: ['Left the organisation', 'Role change pending', 'Security investigation', 'Policy violation'],
                  requireNote: true,
                  successMessage: `${u.name} suspended`,
                })
              }
            >
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
        description="Internal SafalMarketHub staff accounts and their platform permissions."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Admin Users', to: '/admin/admin-users' }]}
        actions={
          <Button
            size="sm"
            onClick={() =>
              ask({
                title: 'Invite admin user',
                description: 'The user receives an account setup link. They stay in Invited status until they complete setup.',
                confirmLabel: 'Send Invitation',
                extraFields: [
                  { key: 'first', label: 'First name', placeholder: 'Priyanka', required: true },
                  { key: 'last', label: 'Last name', placeholder: 'Joshi', required: true },
                  { key: 'email', label: 'Work email', placeholder: 'name@safalmarkethub.com', required: true },
                ],
                reasons: ['Super Admin', 'Operations Admin'],
                reasonLabel: 'Role',
                successMessage: 'Invitation sent',
              })
            }
          >
            <Plus className="size-4" />
            Invite user
          </Button>
        }
      />

      <DataTable
        rows={ADMIN_USERS}
        columns={columns}
        searchKeys={(u) => `${u.name} ${u.email} ${u.role}`}
        searchPlaceholder="Search name, email or role"
        filters={[
          { key: 'role', label: 'Role', options: ['Super Admin', 'Operations Admin'] },
          { key: 'status', label: 'Status', options: ['Invited', 'Active', 'Suspended', 'Deactivated'] },
        ]}
        exportName="Admin users"
        empty={{ title: 'No admin users', body: 'Invite a colleague to get started.' }}
      />

      <Panel className="mt-4" title="Phase 1 permission matrix" padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-muted/60">
              <tr className="text-[11px] uppercase tracking-[0.06em] text-ink-500">
                <th className="px-5 py-2.5 font-bold">Function</th>
                <th className="px-4 py-2.5 text-center font-bold">Super Admin</th>
                <th className="px-4 py-2.5 text-center font-bold">Operations Admin</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.fn} className="border-t">
                  <td className="px-5 py-2.5 text-ink-700 dark:text-ink-200">{p.fn}</td>
                  <td className="px-4 py-2.5 text-center font-semibold text-teal-600 dark:text-teal-100">✓</td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={
                        p.ops === '✓'
                          ? 'font-semibold text-teal-600 dark:text-teal-100'
                          : p.ops === '—'
                            ? 'text-ink-400'
                            : 'text-[12px] font-medium text-gold-600 dark:text-gold-400'
                      }
                    >
                      {p.ops}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}

const PERMISSIONS = [
  { fn: 'Dashboard', ops: '✓' },
  { fn: 'View sellers', ops: '✓' },
  { fn: 'Approve seller', ops: '✓' },
  { fn: 'Suspend seller', ops: 'Limited' },
  { fn: 'KYC review', ops: '✓' },
  { fn: 'View buyers', ops: '✓' },
  { fn: 'Suspend buyer', ops: 'Limited' },
  { fn: 'Approve products', ops: '✓' },
  { fn: 'Manage categories', ops: 'Limited' },
  { fn: 'Cancel order', ops: '✓' },
  { fn: 'Process refund', ops: 'By permission' },
  { fn: 'Configure commission', ops: '—' },
  { fn: 'Mark settlement paid', ops: 'By permission' },
  { fn: 'Audit logs', ops: 'Read' },
  { fn: 'Manage admin users', ops: '—' },
  { fn: 'Platform settings', ops: '—' },
]

/* ------------------------------------------------------------- settings --- */
const SETTINGS_TABS = [
  { value: 'general', label: 'General' },
  { value: 'seller', label: 'Seller' },
  { value: 'orders', label: 'Orders' },
  { value: 'payments', label: 'Payments' },
  { value: 'settlement', label: 'Settlement' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'homepage', label: 'Homepage' },
]

export function AdminSettingsPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const tab = search.tab ?? 'general'

  return (
    <>
      <PageHeader
        title="Platform settings"
        description="Marketplace-wide configuration. Super Admin only — changes are audited."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Settings', to: '/admin/settings' }]}
        actions={<Button size="sm" onClick={() => toast.success('Settings saved')}>Save changes</Button>}
      />

      <Tabs value={tab} onValueChange={(v) => navigate(adminLinkProps({ to: '/admin/settings', search: { tab: v } }))}>
        <TabsList className="mb-5">
          {SETTINGS_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general">
          <Panel title="General">
            <div className="grid gap-5 sm:grid-cols-2">
              <SettingInput label="Platform Name" value="SafalMarketHub" />
              <SettingInput label="Support Email" value="support@safalmarkethub.com" />
              <SettingInput label="Support Phone" value="+91 22 4000 1200" />
              <SettingInput label="Currency" value="INR (₹)" />
              <SettingInput label="Time Zone" value="Asia/Kolkata (IST)" />
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="seller">
          <Panel title="Seller onboarding">
            <SettingToggles
              items={[
                { label: 'KYC required before activation', body: 'Sellers must submit documents before approval.', on: true },
                { label: 'Manual seller approval required', body: 'A Super Admin or Operations Admin must approve each seller.', on: true },
                { label: 'Product approval required', body: 'Every new listing is moderated before going live.', on: true },
                { label: 'Allow selling before first product approval', body: 'Sellers can be activated with zero live products.', on: false },
              ]}
            />
          </Panel>
        </TabsContent>

        <TabsContent value="orders">
          <Panel title="Orders and returns">
            <div className="grid gap-5 sm:grid-cols-2">
              <SettingInput label="Return Window (days)" value="7" hint="Global default. Category-specific policies come later." />
              <SettingInput label="Buyer cancellation window (hours)" value="24" hint="Before the order is packed." />
            </div>
            <div className="mt-6 border-t pt-6">
              <SettingToggles
                items={[
                  { label: 'Allow buyer cancellation after packing', body: 'Requires seller confirmation.', on: false },
                  { label: 'Auto-cancel unaccepted orders', body: 'Cancel if a seller does not accept within 24 hours.', on: true },
                ]}
              />
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="payments">
          <Panel title="Payment gateway">
            <DefinitionList
              items={[
                { label: 'Active gateway', value: 'Razorpay' },
                { label: 'Mode', value: 'Live' },
                { label: 'Webhook status', value: <StatusBadge status="Verified" />, hint: 'Signature verification enabled' },
                { label: 'API keys', value: 'Stored in the secrets vault', hint: 'Never rendered in the portal' },
              ]}
            />
            <Alert variant="default" className="mt-5">
              <ShieldCheck />
              <AlertDescription>
                Gateway credentials are managed outside the application. The portal only shows connection health.
              </AlertDescription>
            </Alert>
          </Panel>
        </TabsContent>

        <TabsContent value="settlement">
          <Panel title="Settlement">
            <div className="grid gap-5 sm:grid-cols-2">
              <SettingInput label="Settlement waiting period" value="Delivery + 7 days" hint="When a delivered order becomes eligible." />
              <SettingInput label="Settlement cycle" value="Weekly (Monday)" />
              <SettingInput label="Minimum settlement amount (₹)" value="500" />
            </div>
            <p className="mt-5 text-[12px] text-ink-500">Seller-specific overrides can be introduced after Phase 1.</p>
          </Panel>
        </TabsContent>

        <TabsContent value="marketplace">
          <Panel title="Marketplace controls">
            <SettingToggles
              items={[
                { label: 'Marketplace enabled', body: 'Turning this off takes the storefront offline.', on: true },
                { label: 'Seller registration enabled', body: 'New businesses can apply to sell.', on: true },
                { label: 'Guest checkout enabled', body: 'Buyers can order without an account.', on: false },
              ]}
            />
            <div className="mt-6 grid gap-5 border-t pt-6 sm:grid-cols-2">
              <SettingInput label="Minimum order value (₹)" value="0" hint="0 disables the minimum." />
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="homepage">
          <Panel title="Homepage" description="Lightweight merchandising only — no full CMS in Phase 1.">
            <div className="grid gap-5 sm:grid-cols-2">
              <SettingInput label="Hero headline" value="Buy what you love. Sell what you create." />
              <SettingInput label="Hero CTA" value="Start Selling" />
              <SettingInput label="Featured categories" value="Electronics, Fashion, Home & Living" hint="Comma separated, max 6." />
              <SettingInput label="Featured products" value="SH-P-1042, SH-P-1044" hint="Product IDs, max 8." />
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </>
  )
}

function SettingInput({ label, value, hint }: { label: string; value: string; hint?: string }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return (
    <div>
      <Label htmlFor={id} className="mb-[7px]">
        {label}
      </Label>
      <Input id={id} defaultValue={value} />
      {hint && <p className="mt-[7px] text-[12px] text-ink-500">{hint}</p>}
    </div>
  )
}

function SettingToggles({ items }: { items: { label: string; body: string; on: boolean }[] }) {
  return (
    <ul className="divide-y">
      {items.map((item) => (
        <li key={item.label} className="flex items-start justify-between gap-4 py-3.5 first:pt-0">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-ink-900 dark:text-white">{item.label}</p>
            <p className="mt-0.5 text-[12px] text-ink-500">{item.body}</p>
          </div>
          <Switch defaultChecked={item.on} aria-label={item.label} />
        </li>
      ))}
    </ul>
  )
}

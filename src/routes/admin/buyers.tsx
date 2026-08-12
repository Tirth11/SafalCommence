import { useState } from 'react'
import { Ban, RotateCcw, ShieldAlert } from 'lucide-react'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { DataTable, type Column } from '@/components/admin/data-table'
import { DefinitionList, PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BUYERS, type Buyer } from '@/data/admin'
import { money } from '@/lib/utils'

const SUSPEND_REASONS = [
  'Fraudulent order activity',
  'Payment abuse or chargeback pattern',
  'Abusive behaviour towards sellers',
  'Multiple false claims',
  'Account security concern',
]

export function BuyersPage() {
  const [selected, setSelected] = useState<Buyer | null>(null)
  const { config, open, setOpen, ask } = useActionDialog()

  const columns: Column<Buyer>[] = [
    {
      key: 'buyer',
      header: 'Buyer',
      sortBy: (b) => b.name,
      cell: (b) => (
        <button type="button" onClick={() => setSelected(b)} className="block text-left">
          <span className="block font-semibold text-ink-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-300">
            {b.name}
          </span>
          <span className="block text-[11px] text-ink-500 tabular">{b.id}</span>
        </button>
      ),
    },
    { key: 'email', header: 'Email', hideBelow: 'md', cell: (b) => <span className="text-ink-600 dark:text-ink-300">{b.email}</span> },
    { key: 'phone', header: 'Phone', hideBelow: 'lg', cell: (b) => <span className="tabular text-ink-600 dark:text-ink-300">{b.phone}</span> },
    { key: 'city', header: 'City', hideBelow: 'xl', cell: (b) => b.city },
    { key: 'orders', header: 'Orders', align: 'right', sortBy: (b) => b.orders, cell: (b) => <span className="tabular">{b.orders}</span> },
    {
      key: 'spend',
      header: 'Total spend',
      align: 'right',
      sortBy: (b) => b.spend,
      cell: (b) => <span className="font-semibold tabular text-ink-900 dark:text-white">{money(b.spend)}</span>,
    },
    { key: 'registered', header: 'Registered', hideBelow: 'lg', sortBy: (b) => b.registered, cell: (b) => <span className="whitespace-nowrap text-ink-500">{b.registered}</span> },
    { key: 'status', header: 'Account', sortBy: (b) => b.status, cell: (b) => <StatusBadge status={b.status} /> },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: (b) => (
        <Button variant="outline" size="sm" className="h-8" onClick={() => setSelected(b)}>
          View
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Buyers"
        description="Registered customers, their order history and account state."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Buyers', to: '/admin/buyers' }]}
      />

      <DataTable
        rows={BUYERS}
        columns={columns}
        searchKeys={(b) => `${b.name} ${b.email} ${b.phone} ${b.id} ${b.city}`}
        searchPlaceholder="Search name, email, phone or buyer ID"
        filters={[{ key: 'status', label: 'Account', options: ['Active', 'Suspended'] }]}
        exportName="Buyers"
        empty={{ title: 'No buyers found', body: 'No customer matches the current filters.' }}
      />

      {selected && (
        <Panel
          className="mt-5"
          title={`${selected.name} · ${selected.id}`}
          description="Sensitive payment information is never exposed in the admin portal."
          actions={
            selected.status === 'Active' ? (
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/8"
                onClick={() =>
                  ask({
                    title: `Suspend ${selected.name}?`,
                    description: 'The buyer cannot place new orders. Existing orders and refunds continue as normal.',
                    confirmLabel: 'Suspend Account',
                    destructive: true,
                    reasons: SUSPEND_REASONS,
                    requireNote: true,
                    successMessage: 'Buyer account suspended',
                  })
                }
              >
                <Ban className="size-4" />
                Suspend Account
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() =>
                  ask({
                    title: `Reactivate ${selected.name}?`,
                    description: 'The buyer can place orders again immediately.',
                    confirmLabel: 'Reactivate Account',
                    noteOnly: true,
                    requireNote: true,
                    successMessage: 'Buyer account reactivated',
                  })
                }
              >
                <RotateCcw className="size-4" />
                Reactivate
              </Button>
            )
          }
        >
          <Tabs defaultValue="profile">
            <TabsList className="mb-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="refunds">Refunds</TabsTrigger>
              <TabsTrigger value="returns">Returns</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <DefinitionList
                columns={3}
                items={[
                  { label: 'Name', value: selected.name },
                  { label: 'Email', value: selected.email },
                  { label: 'Phone', value: <span className="tabular">{selected.phone}</span> },
                  { label: 'Registered', value: selected.registered },
                  { label: 'Total orders', value: <span className="tabular">{selected.orders}</span> },
                  { label: 'Total spend', value: <span className="tabular">{money(selected.spend)}</span> },
                ]}
              />
            </TabsContent>

            <TabsContent value="addresses">
              <div className="grid gap-3 sm:grid-cols-2">
                {['Home', 'Work'].map((label) => (
                  <div key={label} className="rounded-sm border p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">{label}</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink-700 dark:text-ink-200">
                      {label === 'Home' ? '1204, Oberoi Springs, Andheri West' : 'Level 8, Tech Park, BKC'}, {selected.city}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="orders">
              <p className="text-[13px] text-ink-500">
                {selected.orders} orders totalling {money(selected.spend)}. Open the Orders module filtered by this buyer for
                the full history.
              </p>
            </TabsContent>

            <TabsContent value="refunds">
              <p className="text-[13px] text-ink-500">No open refund requests for this buyer.</p>
            </TabsContent>

            <TabsContent value="returns">
              <p className="text-[13px] text-ink-500">No open return requests for this buyer.</p>
            </TabsContent>

            <TabsContent value="activity">
              <Alert variant="default">
                <ShieldAlert />
                <AlertDescription>
                  Account access resets are triggered as an email flow — admins cannot view or set customer passwords.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </Panel>
      )}

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}

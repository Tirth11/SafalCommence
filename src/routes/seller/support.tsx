import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Bell, CheckCheck, LifeBuoy, Paperclip, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { EmptyState, PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { SELLER_NOTIFICATIONS, SELLER_TICKETS } from '@/data/seller'
import { useAccountStore } from '@/store/account-store'
import { Field, SelectField } from '@/routes/seller/setup'
import { cn } from '@/lib/utils'

const CATEGORIES = ['Account/KYC', 'Product', 'Order', 'Payment', 'Settlement', 'Shipping', 'Other']

/* -------------------------------------------------------------- support --- */
export function SellerSupportPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const creating = search.view === 'new'

  return (
    <>
      <PageHeader
        title={creating ? 'Create support ticket' : 'Support'}
        description={creating ? 'Tell us what happened and we will get back to you.' : 'How can we help?'}
        breadcrumb={[{ label: 'Dashboard', to: '/seller' }, { label: 'Support', to: '/seller/support' }]}
        actions={
          !creating && (
            <Button size="sm" asChild>
              <AdminLink to="/seller/support" search={{ view: 'new' }}>
                <Plus className="size-4" />
                Create Support Ticket
              </AdminLink>
            </Button>
          )
        }
      />

      {creating ? (
        <CreateTicketForm onDone={() => navigate(adminLinkProps({ to: '/seller/support' }))} />
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {[
              { title: 'Account & KYC', body: 'Verification, business details, bank account.', category: 'Account/KYC' },
              { title: 'Orders & shipping', body: 'Pickups, tracking, cancellations, returns.', category: 'Order' },
              { title: 'Payments & settlements', body: 'Commission, deductions, payout timing.', category: 'Settlement' },
            ].map((card) => (
              <AdminLink
                key={card.title}
                to="/seller/support"
                search={{ view: 'new', category: card.category }}
                className="rounded-lg border bg-card p-4 shadow-xs transition-[box-shadow,border-color] hover:border-brand-200 hover:shadow-md"
              >
                <LifeBuoy className="size-5 text-brand-600 dark:text-brand-300" />
                <p className="mt-3 text-[14px] font-semibold text-ink-900 dark:text-white">{card.title}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-500">{card.body}</p>
              </AdminLink>
            ))}
          </div>

          <Panel title="My tickets" padded={false}>
            {SELLER_TICKETS.length === 0 ? (
              <EmptyState title="No tickets yet" body="Raise a ticket and our team will respond within one working day." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SELLER_TICKETS.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-semibold tabular text-ink-900 dark:text-white">{t.id}</TableCell>
                      <TableCell>
                        <span className="block max-w-[320px]">
                          <span className="block truncate font-medium text-ink-800 dark:text-ink-100">{t.subject}</span>
                          <span className="block truncate text-[11px] text-ink-500">{t.lastMessage}</span>
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-ink-600 dark:text-ink-300">{t.category}</TableCell>
                      <TableCell className="hidden lg:table-cell whitespace-nowrap text-ink-500">{t.created}</TableCell>
                      <TableCell>
                        <StatusBadge status={t.status === 'Waiting for You' ? 'Waiting for Customer' : t.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Panel>
        </>
      )}
    </>
  )
}

function CreateTicketForm({ onDone }: { onDone: () => void }) {
  const search = useAdminSearch()
  const [submitting, setSubmitting] = useState(false)
  const [description, setDescription] = useState('')

  async function submit() {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    setSubmitting(false)
    toast.success('Ticket submitted', { description: 'Our team will respond within one working day.' })
    onDone()
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Panel title="Ticket details">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category" required>
            <SelectField options={CATEGORIES} value={search.category ?? 'Order'} />
          </Field>
          <Field label="Order ID" hint="Optional — helps us investigate faster.">
            <Input placeholder="SH-100145-01" />
          </Field>
          <Field label="Subject" required className="sm:col-span-2">
            <Input placeholder="Short summary of the issue" />
          </Field>
          <Field label="Description" required className="sm:col-span-2">
            <Textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened, when it happened, and what you have already tried."
            />
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t pt-5">
          <Button variant="outline" size="sm">
            <Paperclip className="size-4" />
            Add attachment
          </Button>
          <span className="text-[12px] text-ink-500">PDF, JPG or PNG · up to 5 MB</span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={submit} disabled={!description.trim()} loading={submitting} loadingLabel="Submitting...">
            Submit Ticket
          </Button>
          <Button variant="outline" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </Panel>

      <Panel title="Before you raise a ticket">
        <ul className="grid gap-3 text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">
          {[
            'Settlement timing: earnings settle after delivery plus the return window.',
            'Product rejected or changes required? The reason appears on the product edit screen.',
            'Missed pickup? Check the courier and AWB on the order detail page first.',
            'KYC in review usually clears within 1–2 working days.',
          ].map((tip) => (
            <li key={tip} className="flex gap-2">
              <span aria-hidden className="text-ink-300">
                •
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

/* -------------------------------------------------------- notifications --- */
const FILTERS = ['All', 'Orders', 'Products', 'Payments', 'Account'] as const

export function SellerNotificationsPage() {
  const [items, setItems] = useState(SELLER_NOTIFICATIONS)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')

  const rows = items.filter((n) => {
    if (filter === 'All') return true
    if (filter === 'Orders') return n.kind === 'order'
    if (filter === 'Products') return n.kind === 'product'
    if (filter === 'Payments') return n.kind === 'payment'
    return n.kind === 'account'
  })

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Order, product, payment and account updates for your store."
        breadcrumb={[{ label: 'Dashboard', to: '/seller' }, { label: 'Notifications', to: '/seller/notifications' }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setItems((prev) => prev.map((n) => ({ ...n, unread: false })))
              toast.success('All notifications marked as read')
            }}
          >
            <CheckCheck className="size-4" />
            Mark All as Read
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1 rounded-lg border bg-card p-1 shadow-xs">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-sm px-3.5 py-2 text-[13px] font-semibold transition-colors',
              filter === f
                ? 'bg-brand-600 text-white'
                : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-secondary'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <Panel padded={false}>
        {rows.length === 0 ? (
          <EmptyState icon={Bell} title="Nothing here" body="You have no notifications in this category." />
        ) : (
          <ul className="divide-y">
            {rows.map((n) => (
              <li key={n.id} className={cn(n.unread && 'bg-brand-50/40 dark:bg-brand-950/40')}>
                <div className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <span
                    className={cn(
                      'mt-0.5 size-2 shrink-0 rounded-full',
                      n.unread ? 'bg-brand-600' : 'bg-transparent'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-ink-900 dark:text-white">{n.title}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-ink-500">{n.detail}</p>
                  </div>
                  <span className="text-[11px] text-ink-400">{n.at}</span>
                  <div className="flex gap-1.5">
                    {n.to && (
                      <Button variant="outline" size="sm" className="h-8" asChild>
                        <AdminLink to={n.to}>View Details</AdminLink>
                      </Button>
                    )}
                    {n.unread && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  )
}

/* ----------------------------------------------------- account settings --- */
export function SellerSettingsPage() {
  const [prefs, setPrefs] = useState({ orders: true, products: true, payments: true, marketing: false })
  const user = useAccountStore((s) => s.user)
  const memberships = useAccountStore((s) => s.memberships)

  return (
    <>
      <PageHeader
        title="Account settings"
        description="Your login profile, security and notification preferences."
        breadcrumb={[{ label: 'Dashboard', to: '/seller' }, { label: 'Settings', to: '/seller/settings' }]}
      />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="grid gap-4">
          <Panel title="Profile">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full Name" required>
                <Input key={user?.id} defaultValue={user ? `${user.firstName} ${user.lastName}` : ''} />
              </Field>
              <Field
                label="Email Address"
                required
                hint={
                  memberships.length > 0
                    ? `Signs you in to shopping and ${memberships.map((m) => m.name).join(', ')}.`
                    : 'Used for sign-in and account notices.'
                }
              >
                <Input key={user?.id} type="email" defaultValue={user?.email ?? ''} />
              </Field>
              <Field label="Phone Number" required>
                <Input defaultValue="+91 98200 41122" />
              </Field>
            </div>
            <div className="mt-5 border-t pt-5">
              <Button onClick={() => toast.success('Profile updated')}>Save changes</Button>
            </div>
          </Panel>

          <Panel title="Security">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Current Password" required>
                <Input type="password" placeholder="Enter current password" />
              </Field>
              <Field label="New Password" required>
                <Input type="password" placeholder="Create a new password" />
              </Field>
              <Field label="Confirm New Password" required>
                <Input type="password" placeholder="Re-enter new password" />
              </Field>
            </div>
            <div className="mt-5 flex flex-wrap gap-3 border-t pt-5">
              <Button onClick={() => toast.success('Password updated')}>Change Password</Button>
              <Button variant="outline" onClick={() => toast.success('Signed out of all other sessions')}>
                Log out of all devices
              </Button>
            </div>
            <p className="mt-4 text-[12px] text-ink-500">
              Two-factor authentication is planned for a later phase.
            </p>
          </Panel>
        </div>

        <Panel title="Notification preferences" description="Operational notifications cannot be switched off.">
          <ul className="divide-y">
            {[
              { key: 'orders' as const, label: 'New orders and cancellations', locked: true },
              { key: 'products' as const, label: 'Product approval decisions', locked: true },
              { key: 'payments' as const, label: 'Settlements and payouts', locked: true },
              { key: 'marketing' as const, label: 'SafalMarketHub tips and product updates', locked: false },
            ].map((pref) => (
              <li key={pref.key} className="flex items-center justify-between gap-4 py-3.5 first:pt-0">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-ink-800 dark:text-ink-100">{pref.label}</p>
                  {pref.locked && <p className="mt-0.5 text-[11px] text-ink-500">Required — always on</p>}
                </div>
                <input
                  type="checkbox"
                  checked={prefs[pref.key]}
                  disabled={pref.locked}
                  onChange={(e) => setPrefs((prev) => ({ ...prev, [pref.key]: e.target.checked }))}
                  className="size-[19px] shrink-0 accent-[var(--brand-600)] disabled:opacity-50"
                  aria-label={pref.label}
                />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  )
}

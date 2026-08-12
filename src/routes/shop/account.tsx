import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Bell,
  Building2,
  CheckCheck,
  Heart,
  House,
  LifeBuoy,
  LogOut,
  MapPin,
  Package,
  Paperclip,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Store,
  Trash2,
  Truck,
  Undo2,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { EmptyState, PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { ProductThumb } from '@/components/commerce/product-thumb'
import { ShopProductCard } from '@/components/shop/shop-bits'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  CUSTOMER_ADDRESSES,
  CUSTOMER_NOTIFICATIONS,
  CUSTOMER_ORDERS,
  CUSTOMER_PROFILE,
  CUSTOMER_RETURNS,
  CUSTOMER_TICKETS,
  SHOP_PRODUCTS,
  SUPPORT_TOPICS,
} from '@/data/shop'
import { useAccountStore } from '@/store/account-store'
import { useCartStore } from '@/store/cart-store'
import { cn, money } from '@/lib/utils'

const ACCOUNT_NAV = [
  { label: 'Overview', to: '/account', icon: User },
  { label: 'My Orders', to: '/account/orders', icon: Package },
  { label: 'Returns & Refunds', to: '/account/returns', icon: Undo2 },
  { label: 'My Addresses', to: '/account/addresses', icon: MapPin },
  { label: 'Wishlist', to: '/account/wishlist', icon: Heart },
  { label: 'Profile & Security', to: '/account/profile', icon: ShieldCheck },
  { label: 'Notifications', to: '/account/notifications', icon: Bell },
  { label: 'Help & Support', to: '/account/support', icon: LifeBuoy },
]

/** Shared two-column account layout. Signed-out visitors are asked to sign in. */
export function AccountLayout({ children }: { children: React.ReactNode }) {
  const signOut = useAccountStore((s) => s.signOut)
  const user = useAccountStore((s) => s.user)
  const navigate = useNavigate()
  const location = typeof window !== 'undefined' ? window.location.pathname : '/account'

  if (!user) {
    return (
      <Panel padded={false}>
        <EmptyState
          icon={User}
          title="Sign in to see your account"
          body="Your orders, addresses, returns and wishlist live here once you're signed in."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <AdminLink to="/login">Sign In</AdminLink>
              </Button>
              <Button variant="outline" asChild>
                <AdminLink to="/register">Create Account</AdminLink>
              </Button>
            </div>
          }
        />
      </Panel>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[236px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <nav aria-label="My account" className="overflow-hidden rounded-lg border bg-card shadow-xs">
          <ul>
            {ACCOUNT_NAV.map((item) => {
              const active = location === item.to
              return (
                <li key={item.label} className="border-b last:border-0">
                  <AdminLink
                    to={item.to}
                    className={cn(
                      'flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium transition-colors',
                      active
                        ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                        : 'text-ink-700 hover:bg-muted/60 dark:text-ink-300'
                    )}
                  >
                    <item.icon className="size-[17px] shrink-0" />
                    {item.label}
                  </AdminLink>
                </li>
              )
            })}
            <li className="border-t">
              <button
                type="button"
                onClick={() => {
                  signOut()
                  toast.success('Signed out')
                  navigate(adminLinkProps({ to: '/shop' }))
                }}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/8"
              >
                <LogOut className="size-[17px] shrink-0" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

/* ------------------------------------------------------------- dashboard --- */
export function AccountDashboardPage() {
  const user = useAccountStore((s) => s.user)
  const memberships = useAccountStore((s) => s.memberships)
  const inTransit = CUSTOMER_ORDERS.filter((o) => ['Shipped', 'Out for Delivery', 'Packed'].includes(o.status)).length
  const delivered = CUSTOMER_ORDERS.filter((o) => o.status === 'Delivered').length
  const openReturns = CUSTOMER_RETURNS.filter((r) => !['Refunded', 'Rejected'].includes(r.status)).length

  const cards = [
    { label: 'Orders', value: String(CUSTOMER_ORDERS.length), to: '/account/orders' },
    { label: 'In Transit', value: String(inTransit), to: '/account/orders', search: { tab: 'Shipped' } },
    { label: 'Delivered', value: String(delivered), to: '/account/orders', search: { tab: 'Delivered' } },
    { label: 'Returns', value: String(openReturns), to: '/account/returns' },
  ]

  return (
    <AccountLayout>
      <PageHeader
        title={`Hi ${user?.firstName ?? CUSTOMER_PROFILE.firstName}`}
        description="Welcome back to SafalMarketHub."
      />

      {/* One account: shopping here, selling in the seller portal */}
      {memberships.length > 0 ? (
        <Alert variant="info" className="mb-5">
          <Store />
          <AlertTitle>You also sell on SafalMarketHub</AlertTitle>
          <AlertDescription>
            {memberships.map((m) => m.name).join(', ')} — seller orders and payouts live in the seller portal.{' '}
            <AdminLink to="/seller" className="font-semibold underline">
              Open seller dashboard
            </AdminLink>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="default" className="mb-5">
          <Store />
          <AlertDescription>
            Want to sell too? You can start a business with this same account — no second sign-up.{' '}
            <AdminLink to="/seller/setup" className="font-semibold underline">
              Start selling
            </AdminLink>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <AdminLink
            key={card.label}
            to={card.to}
            search={card.search}
            className="rounded-lg border bg-card p-4 shadow-xs transition-[box-shadow,border-color,transform] hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">{card.label}</p>
            <p className="mt-2 text-[26px] font-bold leading-none tabular text-ink-950 dark:text-white">{card.value}</p>
          </AdminLink>
        ))}
      </div>

      <Panel
        className="mt-6"
        title="Recent orders"
        padded={false}
        actions={
          <Button variant="ghost" size="sm" asChild>
            <AdminLink to="/account/orders">View all</AdminLink>
          </Button>
        }
      >
        <ul className="divide-y">
          {CUSTOMER_ORDERS.slice(0, 3).map((order) => (
            <li key={order.id}>
              <AdminLink to={`/account/orders/${order.id}`} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-muted/50">
                <div className="flex gap-2">
                  {order.shipments.flatMap((s) => s.items).slice(0, 2).map((item) => (
                    <ProductThumb key={item.productId} glyph={item.glyph} tone={item.tone} className="aspect-square size-12 rounded-sm" />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold tabular text-ink-900 dark:text-white">{order.id}</p>
                  <p className="text-[12px] text-ink-500">
                    {order.placedOn} · {order.shipments.length} {order.shipments.length === 1 ? 'delivery' : 'deliveries'}
                  </p>
                </div>
                <p className="text-[13px] font-semibold tabular">{money(order.total)}</p>
                <StatusBadge status={order.status} />
              </AdminLink>
            </li>
          ))}
        </ul>
      </Panel>

      <section className="mt-8">
        <h2 className="text-xl">Recommended for you</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {SHOP_PRODUCTS.slice(2, 6).map((p) => (
            <ShopProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </AccountLayout>
  )
}

/* --------------------------------------------------------------- wishlist -- */
export function WishlistPage() {
  const wishlist = useCartStore((s) => s.wishlist)
  const products = SHOP_PRODUCTS.filter((p) => wishlist.includes(p.id))

  return (
    <AccountLayout>
      <PageHeader title="My Wishlist" description="Products you saved for later." />
      {products.length === 0 ? (
        <Panel padded={false}>
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            body="Tap the heart on any product to save it here."
            action={
              <Button asChild>
                <AdminLink to="/shop/all">Explore products</AdminLink>
              </Button>
            }
          />
        </Panel>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {products.map((p) => (
            <ShopProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </AccountLayout>
  )
}

/* -------------------------------------------------------------- addresses -- */
export function AddressesPage() {
  const newAddress = useCartStore((s) => s.newAddress)
  const { config, open, setOpen, ask } = useActionDialog()
  const addresses = newAddress ? [...CUSTOMER_ADDRESSES, newAddress] : CUSTOMER_ADDRESSES

  return (
    <AccountLayout>
      <PageHeader
        title="My Addresses"
        description="Saved addresses make checkout faster."
        actions={
          <Button size="sm" asChild>
            <AdminLink to="/checkout" search={{ step: 'address' }}>
              <Plus className="size-4" />
              Add Address
            </AdminLink>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <div key={address.id} className="rounded-lg border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600 dark:text-ink-300">
                {address.label === 'Home' ? <House className="size-3" /> : <Building2 className="size-3" />}
                {address.label}
              </span>
              {address.isDefault && <StatusBadge status="Verified" className="!text-[10px]" />}
            </div>
            <p className="mt-3 text-[14px] font-semibold text-ink-900 dark:text-white">{address.name}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ''}
              {address.landmark ? `, ${address.landmark}` : ''}
              <br />
              {address.city}, {address.state} {address.pin}
            </p>
            <p className="mt-1.5 text-[12px] text-ink-500 tabular">{address.phone}</p>

            <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              {!address.isDefault && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => toast.success('Default address updated')}>
                    Set as default
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/8 hover:text-destructive"
                    onClick={() =>
                      ask({
                        title: 'Delete this address?',
                        description: `${address.label} · ${address.line1}, ${address.city}. This cannot be undone.`,
                        confirmLabel: 'Delete Address',
                        destructive: true,
                        successMessage: 'Address deleted',
                      })
                    }
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </AccountLayout>
  )
}

/* ---------------------------------------------------------------- profile -- */
export function ProfilePage() {
  const { config, open, setOpen, ask } = useActionDialog()
  const user = useAccountStore((s) => s.user)
  const memberships = useAccountStore((s) => s.memberships)

  return (
    <AccountLayout>
      <PageHeader title="Profile & Security" description="Your details and how you sign in." />

      <div className="grid gap-4">
        <Panel title="Profile">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First Name" required>
              <Input key={user?.id} defaultValue={user?.firstName ?? CUSTOMER_PROFILE.firstName} />
            </Field>
            <Field label="Last Name" required>
              <Input key={user?.id} defaultValue={user?.lastName ?? CUSTOMER_PROFILE.lastName} />
            </Field>
            <Field label="Email Address" required hint="Used for sign-in across shopping and selling.">
              <Input key={user?.id} type="email" defaultValue={user?.email ?? CUSTOMER_PROFILE.email} />
            </Field>
            <Field label="Phone Number" required>
              <Input defaultValue={CUSTOMER_PROFILE.phone} />
            </Field>
          </div>
          <div className="mt-5 border-t pt-5">
            <Button onClick={() => toast.success('Profile updated successfully.')}>Save Changes</Button>
          </div>
        </Panel>

        <Panel title="Login & Security">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Current Password" required>
              <Input type="password" placeholder="Enter current password" />
            </Field>
            <Field label="New Password" required>
              <Input type="password" placeholder="Create a new password" />
            </Field>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 border-t pt-5">
            <Button onClick={() => toast.success('Password changed')}>Change Password</Button>
            <Button
              variant="outline"
              onClick={() =>
                ask({
                  title: 'Log out of all devices?',
                  description: 'You will need to sign in again everywhere, including this browser.',
                  confirmLabel: 'Log Out Everywhere',
                  destructive: true,
                  successMessage: 'Signed out of all devices',
                })
              }
            >
              Logout From All Devices
            </Button>
          </div>
          <p className="mt-4 text-[12px] text-ink-500">
            Member since {CUSTOMER_PROFILE.memberSince}. Two-factor authentication is coming in a later phase.
          </p>
          {memberships.length > 0 && (
            <p className="mt-2 text-[12px] text-ink-500">
              These credentials also sign you in to {memberships.map((m) => m.name).join(', ')}.
            </p>
          )}
        </Panel>
      </div>

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </AccountLayout>
  )
}

/* ---------------------------------------------------------- notifications -- */
const NOTIFICATION_FILTERS = ['All', 'Orders', 'Payments', 'Returns', 'Account'] as const

export function NotificationsPage() {
  const [items, setItems] = useState(CUSTOMER_NOTIFICATIONS)
  const [filter, setFilter] = useState<(typeof NOTIFICATION_FILTERS)[number]>('All')

  const rows = items.filter((n) => {
    if (filter === 'All') return true
    if (filter === 'Orders') return n.kind === 'order'
    if (filter === 'Payments') return n.kind === 'payment'
    if (filter === 'Returns') return n.kind === 'return'
    return n.kind === 'account'
  })

  return (
    <AccountLayout>
      <PageHeader
        title="Notifications"
        description="Order, payment and return updates."
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
        {NOTIFICATION_FILTERS.map((f) => (
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
          <EmptyState icon={Bell} title="You're all caught up" body="You don't have any new notifications." />
        ) : (
          <ul className="divide-y">
            {rows.map((n) => (
              <li key={n.id} className={cn(n.unread && 'bg-brand-50/40 dark:bg-brand-950/40')}>
                <div className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <span className={cn('size-2 shrink-0 rounded-full', n.unread ? 'bg-brand-600' : 'bg-transparent')} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-ink-900 dark:text-white">{n.title}</p>
                    <p className="mt-0.5 text-[12px] text-ink-500">{n.detail}</p>
                  </div>
                  <span className="text-[11px] text-ink-400">{n.at}</span>
                  <div className="flex gap-1.5">
                    {n.to && (
                      <Button variant="outline" size="sm" className="h-8" asChild>
                        <AdminLink to={n.to}>{n.kind === 'order' ? 'Track Order' : 'View Details'}</AdminLink>
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
    </AccountLayout>
  )
}

/* ---------------------------------------------------------------- support -- */
export function SupportPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const creating = search.view === 'new'
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [ticketId, setTicketId] = useState<string | null>(null)

  async function submit() {
    setBusy(true)
    await new Promise((r) => setTimeout(r, 800))
    setBusy(false)
    setTicketId('TKT-4478')
    toast.success('Your support request has been created.')
  }

  if (creating && ticketId) {
    return (
      <AccountLayout>
        <Panel padded={false}>
          <EmptyState
            icon={LifeBuoy}
            title="Your support request has been created"
            body={`Ticket ${ticketId} — we usually reply within one working day. You'll get an email and a notification when we respond.`}
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild>
                  <AdminLink to="/account/support">View My Tickets</AdminLink>
                </Button>
                <Button variant="outline" asChild>
                  <AdminLink to="/shop/all">Continue Shopping</AdminLink>
                </Button>
              </div>
            }
          />
        </Panel>
      </AccountLayout>
    )
  }

  return (
    <AccountLayout>
      <PageHeader
        title={creating ? 'Contact Support' : 'How can we help?'}
        description={creating ? 'Tell us what happened and we will look into it.' : 'Pick a topic or raise a request.'}
        actions={
          !creating && (
            <Button size="sm" asChild>
              <AdminLink to="/account/support" search={{ view: 'new' }}>
                Contact Support
              </AdminLink>
            </Button>
          )
        }
      />

      {creating ? (
        <Panel title="New request">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Issue Category" required>
              <Select defaultValue={search.topic ?? 'My Order'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORT_TOPICS.map((t) => (
                    <SelectItem key={t.label} value={t.label}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Order Number" hint="Optional — helps us investigate faster.">
              <Select defaultValue={search.order ?? undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an order" />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_ORDERS.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.id} · {o.placedOn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Subject" required className="sm:col-span-2">
              <Input placeholder="Short summary of the issue" />
            </Field>
            <Field label="Description" required className="sm:col-span-2">
              <Textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What happened, when it happened, and what you'd like us to do."
              />
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t pt-5">
            <Button variant="outline" size="sm">
              <Paperclip className="size-4" />
              Add attachment
            </Button>
            <span className="text-[12px] text-ink-500">JPG, PNG or PDF · up to 5 MB</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={submit} disabled={!description.trim()} loading={busy} loadingLabel="Submitting...">
              Submit Request
            </Button>
            <Button variant="outline" onClick={() => navigate(adminLinkProps({ to: '/account/support' }))}>
              Cancel
            </Button>
          </div>
        </Panel>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SUPPORT_TOPICS.map((topic) => (
              <AdminLink
                key={topic.label}
                to="/account/support"
                search={{ view: 'new', topic: topic.label }}
                className="rounded-lg border bg-card p-4 shadow-xs transition-[box-shadow,border-color] hover:border-brand-200 hover:shadow-md"
              >
                <LifeBuoy className="size-5 text-brand-600 dark:text-brand-300" />
                <p className="mt-3 text-[14px] font-semibold text-ink-900 dark:text-white">{topic.label}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-500">{topic.body}</p>
              </AdminLink>
            ))}
          </div>

          <Panel className="mt-6" title="My requests" padded={false}>
            {CUSTOMER_TICKETS.length === 0 ? (
              <EmptyState title="No requests yet" body="When you contact support, your requests appear here." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="hidden md:table-cell">Order</TableHead>
                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CUSTOMER_TICKETS.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-semibold tabular text-ink-900 dark:text-white">{t.id}</TableCell>
                      <TableCell>
                        <span className="block max-w-[280px]">
                          <span className="block truncate font-medium text-ink-800 dark:text-ink-100">{t.subject}</span>
                          <span className="block truncate text-[11px] text-ink-500">{t.lastMessage}</span>
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell tabular">
                        {t.order ? (
                          <AdminLink to={`/account/orders/${t.order}`} className="text-brand-600 hover:underline dark:text-brand-300">
                            {t.order}
                          </AdminLink>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell whitespace-nowrap text-ink-500">{t.created}</TableCell>
                      <TableCell>
                        <StatusBadge status={t.status === 'Waiting for You' ? 'Waiting for Customer' : t.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8" onClick={() => toast.success('Reply sent')}>
                          Reply
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Panel>
        </>
      )}
    </AccountLayout>
  )
}

/* --------------------------------------------------------- suspended state -- */
export function SuspendedAccountNotice() {
  return (
    <Alert variant="destructive" className="mb-5">
      <ShieldCheck />
      <AlertTitle>Your account is currently unavailable</AlertTitle>
      <AlertDescription>
        You can't place new orders right now. Please contact SafalMarketHub Support and we'll help sort it out.
      </AlertDescription>
    </Alert>
  )
}

/* -------------------------------------------------------------- helpers ---- */
export function Field({
  label,
  hint,
  required,
  className,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-[7px]">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {hint && <p className="mt-[7px] text-[12px] text-ink-500">{hint}</p>}
    </div>
  )
}

export { ACCOUNT_NAV, Checkbox, ShoppingCart, Truck }

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Lock, Mail, Megaphone, Percent, Plus, ShoppingCart, Ticket, Truck } from 'lucide-react'
import { toast } from 'sonner'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { EmptyState, PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ABANDONED_CARTS, type Coupon, type CouponType } from '@/data/marketing'
import { usePlan, useStorefrontStore, useTrial } from '@/store/storefront-store'
import { cn, money } from '@/lib/utils'

/* ==========================================================================
   Marketing — four levers, not a marketing suite.

   Coupons, a free-shipping threshold, an announcement bar, and a view of the
   carts that never made it to checkout.
   ========================================================================== */

const TABS = [
  { value: 'coupons', label: 'Coupons' },
  { value: 'shipping', label: 'Free Shipping' },
  { value: 'announcement', label: 'Announcement Bar' },
  { value: 'carts', label: 'Abandoned Carts' },
]

export function SellerMarketingPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const plan = usePlan()
  const trial = useTrial()

  const tab = search.tab ?? 'coupons'
  const setTab = (value: string) => navigate(adminLinkProps({ to: '/seller/marketing', search: { tab: value } }))

  /* --------------------------------------------- locked on the free plan --
     A trial seller can set coupons up alongside the rest of their store; the
     paywall is publishing, not building. */
  if (!plan.coupons && !trial.canBuild) {
    return (
      <>
        <PageHeader
          title="Marketing"
          description="Discount codes, free-shipping rules and an announcement bar for your own store."
          breadcrumb={[{ label: 'Dashboard', to: '/seller' }, { label: 'Marketing', to: '/seller/marketing' }]}
        />
        <Panel padded={false}>
          <EmptyState
            icon={Lock}
            title="Marketing tools come with Growth"
            body="Coupons, free-shipping rules and the announcement bar work on your own storefront — the channel where you bring the customer and keep more of the sale."
            action={
              <Button asChild>
                <AdminLink to="/seller/plan">See plans from $12/mo</AdminLink>
              </Button>
            }
          />
        </Panel>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Marketing"
        description="A few levers that move sales. Everything here applies to your own storefront."
        breadcrumb={[{ label: 'Dashboard', to: '/seller' }, { label: 'Marketing', to: '/seller/marketing' }]}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-5">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="coupons">
          <CouponsTab />
        </TabsContent>
        <TabsContent value="shipping">
          <FreeShippingTab />
        </TabsContent>
        <TabsContent value="announcement">
          <AnnouncementTab />
        </TabsContent>
        <TabsContent value="carts">
          <AbandonedCartsTab />
        </TabsContent>
      </Tabs>
    </>
  )
}

/* ------------------------------------------------------------- coupons ---- */
function CouponsTab() {
  const { coupons, addCoupon, updateCoupon, removeCoupon } = useStorefrontStore()
  const { config: dialog, open, setOpen, ask } = useActionDialog()
  const [pending, setPending] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  return (
    <div className="grid gap-4">
      {creating ? (
        <CouponForm
          onCancel={() => setCreating(false)}
          onCreate={(coupon) => {
            addCoupon(coupon)
            setCreating(false)
            toast.success(`Discount ${coupon.code} created`)
          }}
        />
      ) : (
        <Panel
          title="Discount codes"
          description="Customers type these at checkout on your own store."
          actions={
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              Create discount
            </Button>
          }
          padded={false}
        >
          {coupons.length === 0 ? (
            <EmptyState
              icon={Ticket}
              title="No discount codes yet"
              body="A first-order code is the usual place to start — 10% off, capped, valid for a month."
              action={<Button onClick={() => setCreating(true)}>Create discount</Button>}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead className="hidden sm:table-cell">Minimum order</TableHead>
                  <TableHead className="hidden lg:table-cell">Valid until</TableHead>
                  <TableHead className="hidden md:table-cell">Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <span className="rounded-sm border border-dashed bg-muted/60 px-2 py-0.5 text-[12px] font-bold tabular text-ink-900 dark:text-white">
                        {c.code}
                      </span>
                    </TableCell>
                    <TableCell className="tabular">
                      {c.type === 'percent' ? `${c.value}%` : money(c.value)}
                      {c.type === 'percent' && c.maxDiscount ? (
                        <span className="block text-[11px] text-ink-500">up to {money(c.maxDiscount)}</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="hidden tabular sm:table-cell">{money(c.minOrder)}</TableCell>
                    <TableCell className="hidden text-[12px] lg:table-cell">{c.validUntil}</TableCell>
                    <TableCell className="hidden tabular md:table-cell">
                      {c.used}
                      {c.usageLimit ? <span className="text-ink-400"> / {c.usageLimit}</span> : null}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {c.status !== 'Expired' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => {
                              updateCoupon(c.id, { status: c.status === 'Paused' ? 'Active' : 'Paused' })
                              toast.success(c.status === 'Paused' ? `${c.code} resumed` : `${c.code} paused`)
                            }}
                          >
                            {c.status === 'Paused' ? 'Resume' : 'Pause'}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-red-600 hover:text-red-700 dark:text-red-300"
                          onClick={() => {
                            setPending(c.id)
                            ask({
                              title: `Delete ${c.code}?`,
                              description: 'Customers who already have this code will no longer be able to use it.',
                              confirmLabel: 'Delete discount',
                              destructive: true,
                              successMessage: `${c.code} deleted`,
                            })
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>
      )}

      <ActionDialog
        config={dialog}
        open={open}
        onOpenChange={setOpen}
        onConfirm={() => pending && removeCoupon(pending)}
      />
    </div>
  )
}

function CouponForm({
  onCreate,
  onCancel,
}: {
  onCreate: (coupon: Omit<Coupon, 'id' | 'used'>) => void
  onCancel: () => void
}) {
  const [code, setCode] = useState('')
  const [type, setType] = useState<CouponType>('percent')
  const [value, setValue] = useState('10')
  const [minOrder, setMinOrder] = useState('25')
  const [maxDiscount, setMaxDiscount] = useState('15')
  const [validUntil, setValidUntil] = useState('31 Aug 2026')
  const [usageLimit, setUsageLimit] = useState('')

  const codeError = code.trim().length > 0 && !/^[A-Z0-9]{4,16}$/.test(code.trim().toUpperCase())

  return (
    <Panel title="Create discount" description="Capped percentage codes are the safest way to discount.">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="code" className="text-[13px]">
            Discount code
          </Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="WELCOME10"
            className="tabular uppercase"
            aria-invalid={codeError}
          />
          <p className={cn('text-[11px]', codeError ? 'text-red-600 dark:text-red-300' : 'text-ink-500')}>
            {codeError ? '4–16 letters and numbers, no spaces.' : 'Customers type this at checkout.'}
          </p>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-[13px]">Discount type</Label>
          <div className="flex gap-2">
            {(['percent', 'flat'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  'flex-1 rounded-sm border px-3 py-2 text-[13px] font-semibold transition-colors',
                  type === t
                    ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                    : 'border-input text-ink-700 hover:border-ink-400 dark:text-ink-200'
                )}
              >
                {t === 'percent' ? 'Percentage' : 'Flat amount'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="value" className="text-[13px]">
            {type === 'percent' ? 'Discount (%)' : 'Discount amount ($)'}
          </Label>
          <Input id="value" type="number" value={value} onChange={(e) => setValue(e.target.value)} className="tabular" />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="min" className="text-[13px]">
            Minimum order ($)
          </Label>
          <Input id="min" type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} className="tabular" />
        </div>

        {type === 'percent' && (
          <div className="grid gap-1.5">
            <Label htmlFor="max" className="text-[13px]">
              Maximum discount ($)
            </Label>
            <Input id="max" type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} className="tabular" />
            <p className="text-[11px] text-ink-500">Caps what a large order can take off.</p>
          </div>
        )}

        <div className="grid gap-1.5">
          <Label htmlFor="until" className="text-[13px]">
            Valid until
          </Label>
          <Input id="until" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="tabular" />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="limit" className="text-[13px]">
            Usage limit
          </Label>
          <Input
            id="limit"
            type="number"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            placeholder="Unlimited"
            className="tabular"
          />
        </div>
      </div>

      {/* What the customer actually gets — stated in one line, before they save. */}
      <p className="mt-5 rounded-lg border bg-muted/50 px-4 py-3 text-[12px] leading-relaxed text-ink-600 dark:text-ink-300">
        <strong className="text-ink-900 dark:text-white">{code || 'YOURCODE'}</strong> takes{' '}
        {type === 'percent' ? `${value || 0}% off` : `${money(Number(value) || 0)} off`} orders above{' '}
        {money(Number(minOrder) || 0)}
        {type === 'percent' && maxDiscount ? `, up to ${money(Number(maxDiscount))}` : ''}, until {validUntil}.
      </p>

      <div className="mt-5 flex flex-wrap gap-3 border-t pt-5">
        <Button
          disabled={!code.trim() || codeError}
          onClick={() =>
            onCreate({
              code: code.trim().toUpperCase(),
              type,
              value: Number(value) || 0,
              minOrder: Number(minOrder) || 0,
              maxDiscount: type === 'percent' && maxDiscount ? Number(maxDiscount) : null,
              validUntil,
              usageLimit: usageLimit ? Number(usageLimit) : null,
              channel: 'store',
              status: 'Active',
            })
          }
        >
          Create discount
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Panel>
  )
}

/* ------------------------------------------------------- free shipping ---- */
function FreeShippingTab() {
  const { config, updateConfig } = useStorefrontStore()

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <Panel title="Free shipping rule" description="The simplest way to lift average order value.">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="fs" className="text-[13px]">
            Offer free shipping above a threshold
          </Label>
          <Switch
            id="fs"
            checked={config.freeShipping.on}
            onCheckedChange={(on) => {
              updateConfig({ freeShipping: { ...config.freeShipping, on } })
              toast.success(on ? 'Free shipping rule enabled' : 'Free shipping rule disabled')
            }}
          />
        </div>

        {config.freeShipping.on && (
          <div className="mt-5 max-w-[260px]">
            <Label htmlFor="threshold" className="text-[13px]">
              Free shipping above
            </Label>
            <Input
              id="threshold"
              type="number"
              className="mt-1.5 tabular"
              value={config.freeShipping.threshold}
              onChange={(e) => updateConfig({ freeShipping: { ...config.freeShipping, threshold: Number(e.target.value) || 0 } })}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {[49, 99, 149].map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => updateConfig({ freeShipping: { ...config.freeShipping, threshold: preset } })}
                >
                  {money(preset)}
                </Button>
              ))}
            </div>
          </div>
        )}

        <Button className="mt-6" onClick={() => toast.success('Shipping rule saved')}>
          Save rule
        </Button>
      </Panel>

      <Panel title="What the customer sees">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: config.accentColor }}>
            <Truck className="size-4" />
            {config.freeShipping.on
              ? `Free shipping on orders above ${money(config.freeShipping.threshold)}`
              : 'Shipping calculated at checkout'}
          </div>
          {config.freeShipping.on && (
            <p className="mt-3 border-t pt-3 text-[12px] text-ink-500">
              A cart at {money(Math.max(0, config.freeShipping.threshold - 12))} shows{' '}
              <strong className="text-ink-900 dark:text-white">“Add {money(12)} more for free shipping”</strong> — the
              nudge that lifts the order.
            </p>
          )}
        </div>
      </Panel>
    </div>
  )
}

/* --------------------------------------------------- announcement bar ----- */
function AnnouncementTab() {
  const { config, updateConfig } = useStorefrontStore()
  const presets = [
    'Free shipping above $99',
    '10% off today with WELCOME10',
    'New arrivals just landed',
    'Dispatching within 24 hours',
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <Panel title="Announcement bar" description="A thin strip above your header. One message at a time.">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="ann" className="text-[13px]">
            Show the announcement bar
          </Label>
          <Switch
            id="ann"
            checked={config.announcement.on}
            onCheckedChange={(on) => updateConfig({ announcement: { ...config.announcement, on } })}
          />
        </div>

        <div className="mt-5 grid gap-1.5">
          <Label htmlFor="ann-text" className="text-[13px]">
            Message
          </Label>
          <Input
            id="ann-text"
            value={config.announcement.text}
            maxLength={80}
            onChange={(e) => updateConfig({ announcement: { ...config.announcement, text: e.target.value } })}
          />
          <p className="text-[11px] text-ink-500 tabular">{config.announcement.text.length}/80 characters</p>
        </div>

        <div className="mt-5">
          <p className="text-[12px] font-semibold text-ink-700 dark:text-ink-200">Or start from one of these</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                onClick={() => updateConfig({ announcement: { on: true, text: preset } })}
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>

        <Button className="mt-6" onClick={() => toast.success('Announcement bar saved')}>
          Save
        </Button>
      </Panel>

      <Panel title="Preview">
        <div className="overflow-hidden rounded-lg border">
          {config.announcement.on && config.announcement.text ? (
            <div className="px-3 py-1.5 text-center text-[11px] font-semibold text-white" style={{ background: config.brandColor }}>
              {config.announcement.text}
            </div>
          ) : (
            <div className="bg-muted/60 px-3 py-1.5 text-center text-[11px] text-ink-400">No announcement bar</div>
          )}
          <div className="flex items-center gap-2 border-t px-3 py-2.5">
            <span
              className="grid size-6 place-items-center rounded-sm text-[9px] font-bold text-white"
              style={{ background: config.brandColor }}
            >
              {config.logoText.slice(0, 3).toUpperCase()}
            </span>
            <span className="text-[11px] font-bold">{config.name}</span>
            <Megaphone className="ml-auto size-3.5 text-ink-300" />
          </div>
        </div>
      </Panel>
    </div>
  )
}

/* -------------------------------------------------------- abandoned cart -- */
function AbandonedCartsTab() {
  const plan = usePlan()
  const recovered = ABANDONED_CARTS.filter((c) => c.recovered)
  const recoverableValue = ABANDONED_CARTS.filter((c) => !c.recovered).reduce((sum, c) => sum + c.value, 0)

  return (
    <div className="grid gap-4">
      {!plan.abandonedCart && (
        <Alert variant="info">
          <Mail />
          <AlertTitle>Automatic reminders come with Pro</AlertTitle>
          <AlertDescription>
            You can see abandoned carts on Growth. Pro emails the customer a reminder automatically a few hours later.
            <span className="mt-3 flex">
              <Button size="sm" asChild>
                <AdminLink to="/seller/plan">Upgrade to Pro</AdminLink>
              </Button>
            </span>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Carts abandoned" value={String(ABANDONED_CARTS.length)} hint="Last 7 days" icon={ShoppingCart} />
        <Stat label="Value at risk" value={money(recoverableValue)} hint="Not yet recovered" icon={Percent} />
        <Stat label="Recovered" value={String(recovered.length)} hint="After a reminder" icon={Mail} />
      </div>

      <Panel title="Abandoned carts" description="Customers who added to cart but didn't finish checkout." padded={false}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden sm:table-cell">Items</TableHead>
              <TableHead>Cart value</TableHead>
              <TableHead className="hidden md:table-cell">Abandoned</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ABANDONED_CARTS.map((cart) => (
              <TableRow key={cart.id}>
                <TableCell>
                  <span className="block text-[13px] font-semibold text-ink-900 dark:text-white">{cart.customer}</span>
                  <span className="block text-[11px] text-ink-500 tabular">{cart.email}</span>
                </TableCell>
                <TableCell className="hidden tabular sm:table-cell">{cart.items}</TableCell>
                <TableCell className="tabular font-semibold">{money(cart.value)}</TableCell>
                <TableCell className="hidden text-[12px] text-ink-500 md:table-cell">{cart.abandonedAt}</TableCell>
                <TableCell>
                  <StatusBadge status={cart.recovered ? 'Recovered' : cart.reminderSent ? 'Reminder Sent' : 'Pending'} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    disabled={cart.recovered || !plan.abandonedCart}
                    onClick={() => toast.success('Reminder sent', { description: cart.email })}
                  >
                    Send reminder
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  )
}

function Stat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint: string
  icon: typeof ShoppingCart
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">{label}</p>
        <Icon className="size-4 text-ink-300" />
      </div>
      <p className="mt-2 text-[22px] font-bold leading-none tabular text-ink-950 dark:text-white">{value}</p>
      <p className="mt-1.5 text-[11px] text-ink-500">{hint}</p>
    </div>
  )
}

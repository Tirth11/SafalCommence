import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Check,
  CircleAlert,
  CreditCard,
  House,
  Landmark,
  Lock,
  MapPin,
  Package,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Truck,
  TriangleAlert,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { EmptyState } from '@/components/admin/primitives'
import { ProductThumb } from '@/components/commerce/product-thumb'
import { Breadcrumbs, PriceDetails, SellerLine } from '@/components/shop/shop-bits'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CUSTOMER_ADDRESSES, isDeliverable, SHIPPING_OPTIONS, type Address } from '@/data/shop'
import { useAccountStore } from '@/store/account-store'
import { groupBySeller, totals, useCartStore, useCheckoutLines, type CartItem } from '@/store/cart-store'
import { cn, inr } from '@/lib/utils'

type Step = 'account' | 'address' | 'shipping' | 'review' | 'payment' | 'processing' | 'success' | 'failed' | 'pending'

const STEPS: { key: Step; label: string }[] = [
  { key: 'address', label: 'Address' },
  { key: 'shipping', label: 'Delivery' },
  { key: 'review', label: 'Review' },
  { key: 'payment', label: 'Payment' },
]

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', hint: 'Google Pay, PhonePe, Paytm or any UPI ID', icon: Smartphone },
  { id: 'card', label: 'Credit / Debit Card', hint: 'Visa, Mastercard, RuPay, Amex', icon: CreditCard },
  { id: 'netbanking', label: 'Net Banking', hint: 'All major Indian banks', icon: Landmark },
  { id: 'wallet', label: 'Wallet', hint: 'Paytm, Amazon Pay, Mobikwik', icon: Wallet },
  { id: 'cod', label: 'Cash on Delivery', hint: 'Pay the courier when your order arrives', icon: Package },
]

export function CheckoutPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()

  const lines = useCheckoutLines()
  const user = useAccountStore((s) => s.user)
  const guest = useAccountStore((s) => s.guest)
  const addressId = useCartStore((s) => s.addressId)
  const newAddress = useCartStore((s) => s.newAddress)
  const shippingId = useCartStore((s) => s.shippingId)
  const setAddressId = useCartStore((s) => s.setAddressId)
  const saveNewAddress = useCartStore((s) => s.saveNewAddress)
  const setShippingId = useCartStore((s) => s.setShippingId)
  const clear = useCartStore((s) => s.clear)

  const addresses = useMemo(() => (newAddress ? [...CUSTOMER_ADDRESSES, newAddress] : CUSTOMER_ADDRESSES), [newAddress])
  // Already signed in, or a guest who has given us an email — either way we can
  // go straight to the delivery address.
  const known = user !== null || guest !== null
  const step = (search.step as Step) ?? (known ? 'address' : 'account')

  const selectedAddress = addresses.find((a) => a.id === addressId) ?? addresses.find((a) => a.isDefault) ?? addresses[0]
  const sums = totals(lines, shippingId)
  const groups = groupBySeller(lines)
  const shipping = SHIPPING_OPTIONS.find((o) => o.id === shippingId) ?? SHIPPING_OPTIONS[0]

  /** Serviceability: one heavy item can't reach every PIN. Named explicitly, never a blanket failure. */
  const unserviceable = useMemo(() => {
    if (!selectedAddress) return []
    return lines.filter((line) => !isDeliverable(line.productId, selectedAddress.pin))
  }, [lines, selectedAddress])

  function go(next: Step) {
    navigate(adminLinkProps({ to: '/checkout', search: next === 'account' ? {} : { step: next } }))
  }

  if (lines.length === 0 && !['success', 'processing'].includes(step)) {
    return (
      <div className="rounded-lg border bg-card shadow-xs">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          body="Add something to your cart before checking out."
          action={
            <Button asChild>
              <AdminLink to="/shop/all">Start Shopping</AdminLink>
            </Button>
          }
        />
      </div>
    )
  }

  /* --------------------------------------------------------- terminal states */
  if (step === 'processing') return <ProcessingState amount={sums.total} />
  if (step === 'success')
    return <SuccessState amount={sums.total} address={selectedAddress} shippingEstimate={shipping.estimate} signedIn={user !== null} />
  if (step === 'failed') return <FailureState amount={sums.total} onRetry={() => go('payment')} />
  if (step === 'pending') return <PendingState amount={sums.total} />

  return (
    <>
      <Breadcrumbs trail={[{ label: 'Home', to: '/shop' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />

      <h1 className="text-xl sm:text-[28px]">Checkout</h1>

      {/* Step rail */}
      {step !== 'account' && (
        <ol className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2">
          {STEPS.map((s, i) => {
            const currentIndex = STEPS.findIndex((x) => x.key === step)
            const done = i < currentIndex
            const active = s.key === step
            return (
              <li key={s.key} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden className="text-ink-300">›</span>}
                <button
                  type="button"
                  disabled={i > currentIndex}
                  onClick={() => go(s.key)}
                  className={cn(
                    'flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-[13px] transition-colors',
                    active && 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-200',
                    done && 'font-medium text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-secondary',
                    !active && !done && 'text-ink-400'
                  )}
                >
                  <span
                    className={cn(
                      'grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold',
                      done && 'bg-teal-500 text-white',
                      active && 'bg-brand-600 text-white',
                      !done && !active && 'border border-ink-300'
                    )}
                  >
                    {done ? <Check className="size-3" strokeWidth={3.5} /> : i + 1}
                  </span>
                  {s.label}
                </button>
              </li>
            )
          })}
        </ol>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          {step === 'account' && <AccountStep onContinue={() => go('address')} />}

          {step === 'address' && (
            <AddressStep
              addresses={addresses}
              selectedId={selectedAddress?.id}
              unserviceable={unserviceable}
              onSelect={setAddressId}
              onSave={saveNewAddress}
              onContinue={() => go('shipping')}
            />
          )}

          {step === 'shipping' && (
            <ShippingStep
              shippingId={shippingId}
              onSelect={setShippingId}
              onBack={() => go('address')}
              onContinue={() => go('review')}
            />
          )}

          {step === 'review' && selectedAddress && (
            <ReviewStep
              address={selectedAddress}
              groups={groups}
              shipping={shipping}
              onEditAddress={() => go('address')}
              onEditShipping={() => go('shipping')}
              onContinue={() => go('payment')}
            />
          )}

          {step === 'payment' && (
            <PaymentStep
              amount={sums.total}
              onResult={(result) => {
                if (result === 'success') {
                  go('processing')
                  setTimeout(() => {
                    clear()
                    go('success')
                  }, 1800)
                } else {
                  go(result)
                }
              }}
              onBack={() => go('review')}
            />
          )}
        </div>

        {/* Order summary rail */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border bg-card p-5 shadow-xs">
            <h2 className="text-[15px] font-semibold">Order summary</h2>
            <ul className="mt-4 divide-y">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-3 py-3 first:pt-0">
                  <ProductThumb glyph={line.glyph} tone={line.tone} className="aspect-square size-12 shrink-0 rounded-sm" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[12px] font-semibold leading-snug text-ink-900 dark:text-white">{line.name}</p>
                    <p className="text-[11px] text-ink-500">
                      {line.variant} · Qty {line.qty}
                    </p>
                  </div>
                  <p className="shrink-0 text-[13px] font-semibold tabular">{inr(line.price * line.qty)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-2 border-t pt-3">
              <PriceDetails {...sums} />
            </div>
            <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-ink-500">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
              Payments are processed by our secure gateway. Card details never reach SafalMarketHub servers.
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}

/* ------------------------------------------------------- 1. account entry -- */
function AccountStep({ onContinue }: { onContinue: () => void }) {
  const continueAsGuest = useAccountStore((s) => s.continueAsGuest)
  const signIn = useAccountStore((s) => s.signIn)
  const [mode, setMode] = useState<'choose' | 'guest' | 'signin' | 'register'>('choose')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' })
  const [busy, setBusy] = useState(false)

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  async function submit(kind: 'guest' | 'signin' | 'register') {
    setBusy(true)
    await new Promise((r) => setTimeout(r, 700))
    setBusy(false)
    if (kind === 'guest') {
      continueAsGuest(form.firstName || 'Guest', form.email)
    } else {
      // One account: signing in keeps any seller access this user already has.
      signIn({
        id: 'USR-1',
        firstName: form.firstName || 'Rohit',
        lastName: form.lastName || 'Sharma',
        email: form.email || 'rohit.sharma@example.com',
      })
    }
    toast.success(kind === 'register' ? 'Account created' : 'Continuing to delivery address')
    onContinue()
  }

  return (
    <section className="rounded-lg border bg-card p-5 shadow-xs sm:p-6">
      <h2 className="text-[17px] font-semibold">How would you like to continue?</h2>
      <p className="mt-1.5 text-[13px] text-ink-600 dark:text-ink-300">
        You don't need an account to place this order — signing in just saves your addresses and order history.
      </p>

      {mode === 'choose' && (
        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={() => setMode('guest')}
            className="flex items-center gap-3.5 rounded-lg border p-4 text-left transition-colors hover:border-brand-300"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-200">
              <Truck className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold text-ink-900 dark:text-white">Continue as Guest</span>
              <span className="block text-[12px] text-ink-500">Fastest — we'll email your confirmation and tracking.</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode('signin')}
            className="flex items-center gap-3.5 rounded-lg border p-4 text-left transition-colors hover:border-brand-300"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-muted text-ink-600 dark:text-ink-300">
              <Lock className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold text-ink-900 dark:text-white">Sign In</span>
              <span className="block text-[12px] text-ink-500">Use your saved addresses and see all your orders.</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className="flex items-center gap-3.5 rounded-lg border p-4 text-left transition-colors hover:border-brand-300"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-muted text-ink-600 dark:text-ink-300">
              <Plus className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold text-ink-900 dark:text-white">Create Account</span>
              <span className="block text-[12px] text-ink-500">Takes about 30 seconds. Your cart is kept.</span>
            </span>
          </button>
        </div>
      )}

      {mode === 'guest' && (
        <div className="mt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="First Name" required>
              <Input value={form.firstName} onChange={update('firstName')} placeholder="Enter first name" />
            </Labeled>
            <Labeled label="Last Name" required>
              <Input value={form.lastName} onChange={update('lastName')} placeholder="Enter last name" />
            </Labeled>
            <Labeled label="Email Address" required hint="Order confirmation and tracking go here.">
              <Input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" />
            </Labeled>
            <Labeled label="Phone Number" required hint="For delivery updates from the courier.">
              <Input value={form.phone} onChange={update('phone')} placeholder="+91 98765 43210" />
            </Labeled>
          </div>
          <StepActions
            onBack={() => setMode('choose')}
            primary={
              <Button onClick={() => submit('guest')} loading={busy} disabled={!form.firstName || !form.email}>
                Continue to Address
              </Button>
            }
          />
        </div>
      )}

      {(mode === 'signin' || mode === 'register') && (
        <div className="mt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {mode === 'register' && (
              <>
                <Labeled label="First Name" required>
                  <Input value={form.firstName} onChange={update('firstName')} placeholder="Enter first name" />
                </Labeled>
                <Labeled label="Last Name" required>
                  <Input value={form.lastName} onChange={update('lastName')} placeholder="Enter last name" />
                </Labeled>
              </>
            )}
            <Labeled label="Email Address" required className={mode === 'signin' ? 'sm:col-span-2' : undefined}>
              <Input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" />
            </Labeled>
            <Labeled label="Password" required className={mode === 'signin' ? 'sm:col-span-2' : undefined}>
              <Input type="password" value={form.password} onChange={update('password')} placeholder="Enter your password" />
            </Labeled>
            {mode === 'register' && (
              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-start gap-2.5 text-[13px] text-ink-700 dark:text-ink-300">
                  <Checkbox className="mt-0.5" />
                  <span>
                    I agree to the{' '}
                    <a href="/#" className="font-semibold text-brand-600 dark:text-brand-300">
                      Terms &amp; Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/#" className="font-semibold text-brand-600 dark:text-brand-300">
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
              </div>
            )}
          </div>

          <p className="mt-4 rounded-sm border bg-muted/50 px-3.5 py-2.5 text-[12px] text-ink-500">
            Your cart is saved — you'll come straight back to checkout after signing in.
          </p>

          <StepActions
            onBack={() => setMode('choose')}
            primary={
              <Button onClick={() => submit(mode)} loading={busy} disabled={!form.email}>
                {mode === 'signin' ? 'Sign In & Continue' : 'Create Account & Continue'}
              </Button>
            }
          />
        </div>
      )}
    </section>
  )
}

/* ------------------------------------------------------------- 2. address -- */
function AddressStep({
  addresses,
  selectedId,
  unserviceable,
  onSelect,
  onSave,
  onContinue,
}: {
  addresses: Address[]
  selectedId?: string
  unserviceable: { key: string; name: string; productId: string }[]
  onSelect: (id: string) => void
  onSave: (address: Address) => void
  onContinue: () => void
}) {
  const remove = useCartStore((s) => s.remove)
  const [adding, setAdding] = useState(addresses.length === 0)
  const [draft, setDraft] = useState<Omit<Address, 'id' | 'isDefault'> & { isDefault: boolean }>({
    label: 'Home',
    name: '',
    phone: '',
    line1: '',
    line2: '',
    landmark: '',
    city: '',
    state: 'Maharashtra',
    pin: '',
    isDefault: false,
  })

  const blocked = unserviceable.length > 0

  return (
    <section className="rounded-lg border bg-card p-5 shadow-xs sm:p-6">
      <h2 className="text-[17px] font-semibold">Where should we deliver your order?</h2>

      {!adding && (
        <>
          <ul className="mt-5 grid gap-3">
            {addresses.map((address) => {
              const selected = address.id === selectedId
              return (
                <li key={address.id}>
                  <div
                    className={cn(
                      'rounded-lg border p-4 transition-colors',
                      selected ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/40' : 'hover:border-ink-300'
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-600 dark:text-ink-300">
                            {address.label === 'Home' ? <House className="size-3" /> : <Building2 className="size-3" />}
                            {address.label}
                          </span>
                          {address.isDefault && (
                            <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-300">Default</span>
                          )}
                        </p>
                        <p className="mt-2 text-[14px] font-semibold text-ink-900 dark:text-white">{address.name}</p>
                        <p className="mt-0.5 text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">
                          {address.line1}
                          {address.line2 ? `, ${address.line2}` : ''}
                          {address.landmark ? `, ${address.landmark}` : ''}
                          <br />
                          {address.city}, {address.state} {address.pin}
                        </p>
                        <p className="mt-1 text-[12px] text-ink-500 tabular">{address.phone}</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button variant={selected ? 'default' : 'outline'} size="sm" onClick={() => onSelect(address.id)}>
                          {selected ? 'Selected' : 'Deliver Here'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <Button variant="outline" size="sm" className="mt-4" onClick={() => setAdding(true)}>
            <Plus className="size-4" />
            Add a new address
          </Button>
        </>
      )}

      {adding && (
        <div className="mt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Full Name" required>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Enter full name" />
            </Labeled>
            <Labeled label="Phone Number" required>
              <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="+91 98765 43210" />
            </Labeled>
            <Labeled label="Address Line 1" required className="sm:col-span-2">
              <Input value={draft.line1} onChange={(e) => setDraft({ ...draft, line1: e.target.value })} placeholder="Flat, house no., building" />
            </Labeled>
            <Labeled label="Address Line 2">
              <Input value={draft.line2} onChange={(e) => setDraft({ ...draft, line2: e.target.value })} placeholder="Area, street, sector" />
            </Labeled>
            <Labeled label="Landmark">
              <Input value={draft.landmark} onChange={(e) => setDraft({ ...draft, landmark: e.target.value })} placeholder="Nearby landmark" />
            </Labeled>
            <Labeled label="City" required>
              <Input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} placeholder="Mumbai" />
            </Labeled>
            <Labeled label="State" required>
              <Select value={draft.state} onValueChange={(v) => setDraft({ ...draft, state: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Gujarat', 'West Bengal', 'Kerala'].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Labeled>
            <Labeled label="PIN Code" required hint="Serviceable in this demo: 400001, 400053, 110024, 560038.">
              <Input
                value={draft.pin}
                onChange={(e) => setDraft({ ...draft, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                inputMode="numeric"
                placeholder="400053"
              />
            </Labeled>
            <Labeled label="Address Type" className="sm:col-span-2">
              <div className="flex gap-2">
                {(['Home', 'Work', 'Other'] as const).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setDraft({ ...draft, label })}
                    className={cn(
                      'rounded-sm border px-4 py-2 text-[13px] font-semibold transition-colors',
                      draft.label === label
                        ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                        : 'border-input text-ink-700 hover:border-ink-400 dark:text-ink-200'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Labeled>
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-700 dark:text-ink-300">
                <Checkbox checked={draft.isDefault} onCheckedChange={(c) => setDraft({ ...draft, isDefault: Boolean(c) })} />
                Make this my default address
              </label>
            </div>
          </div>

          <StepActions
            onBack={addresses.length > 0 ? () => setAdding(false) : undefined}
            primary={
              <Button
                disabled={!draft.name || !draft.line1 || !draft.city || draft.pin.length !== 6}
                onClick={() => {
                  const address: Address = { ...draft, id: `ADDR-${Date.now()}`, isDefault: draft.isDefault }
                  onSave(address)
                  setAdding(false)
                  toast.success('Address saved successfully.')
                }}
              >
                Save &amp; Use This Address
              </Button>
            }
          />
        </div>
      )}

      {/* Serviceability outcome */}
      {!adding && selectedId && (
        <div className="mt-5">
          {blocked ? (
            <Alert variant="warning">
              <TriangleAlert />
              <AlertTitle>Some items can't be delivered to this address</AlertTitle>
              <AlertDescription>
                <ul className="mt-1.5 grid gap-2">
                  {unserviceable.map((line) => (
                    <li key={line.key} className="flex flex-wrap items-center gap-3">
                      <span className="text-[13px] font-semibold">{line.name}</span>
                      <Button variant="outline" size="sm" className="h-7 bg-background" onClick={() => remove(line.key)}>
                        Remove Item
                      </Button>
                      <span className="text-[12px]">or choose a different address above</span>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="success">
              <BadgeCheck />
              <AlertDescription>Great! All items can be delivered to this address.</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {!adding && (
        <StepActions
          primary={
            <Button disabled={!selectedId || blocked} onClick={onContinue}>
              Continue to Delivery
            </Button>
          }
        />
      )}
    </section>
  )
}

/* ------------------------------------------------------------ 3. shipping -- */
function ShippingStep({
  shippingId,
  onSelect,
  onBack,
  onContinue,
}: {
  shippingId: string
  onSelect: (id: string) => void
  onBack: () => void
  onContinue: () => void
}) {
  return (
    <section className="rounded-lg border bg-card p-5 shadow-xs sm:p-6">
      <h2 className="text-[17px] font-semibold">Choose a delivery speed</h2>
      <p className="mt-1.5 text-[13px] text-ink-600 dark:text-ink-300">
        Items from different sellers may arrive separately, at no extra charge.
      </p>

      <ul className="mt-5 grid gap-3">
        {SHIPPING_OPTIONS.map((option) => {
          const selected = option.id === shippingId
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => onSelect(option.id)}
                aria-pressed={selected}
                className={cn(
                  'flex w-full items-center gap-3.5 rounded-lg border p-4 text-left transition-colors',
                  selected ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/40' : 'hover:border-ink-300'
                )}
              >
                <span
                  className={cn(
                    'grid size-5 shrink-0 place-items-center rounded-full border-2',
                    selected ? 'border-brand-600 bg-brand-600' : 'border-ink-300'
                  )}
                >
                  {selected && <span className="size-1.5 rounded-full bg-white" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-ink-900 dark:text-white">{option.label}</span>
                  <span className="block text-[12px] text-ink-500">Estimated {option.estimate}</span>
                </span>
                <span className="shrink-0 text-[14px] font-bold tabular text-ink-950 dark:text-white">{inr(option.price)}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <StepActions onBack={onBack} primary={<Button onClick={onContinue}>Continue to Review</Button>} />
    </section>
  )
}

/* -------------------------------------------------------------- 4. review -- */
function ReviewStep({
  address,
  groups,
  shipping,
  onEditAddress,
  onEditShipping,
  onContinue,
}: {
  address: Address
  groups: { seller: string; lines: CartItem[] }[]
  shipping: { label: string; price: number; estimate: string }
  onEditAddress: () => void
  onEditShipping: () => void
  onContinue: () => void
}) {
  return (
    <div className="grid gap-4">
      <section className="rounded-lg border bg-card p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold">
            <MapPin className="size-4 text-ink-400" />
            Delivery address
          </h2>
          <Button variant="ghost" size="sm" onClick={onEditAddress}>
            Edit
          </Button>
        </div>
        <p className="mt-3 text-[14px] font-semibold text-ink-900 dark:text-white">{address.name}</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} {address.pin}
        </p>
        <p className="mt-1 text-[12px] text-ink-500 tabular">{address.phone}</p>
      </section>

      <section className="overflow-hidden rounded-lg border bg-card shadow-xs">
        <header className="border-b px-5 py-3.5">
          <h2 className="text-[15px] font-semibold">
            Your items {groups.length > 1 && <span className="font-normal text-ink-500">· {groups.length} deliveries</span>}
          </h2>
        </header>
        {groups.map((group) => (
          <div key={group.seller} className="border-b last:border-0">
            <div className="bg-muted/40 px-5 py-2.5">
              <SellerLine seller={group.seller} />
            </div>
            <ul className="divide-y">
              {group.lines.map((line) => (
                <li key={line.key} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-ink-900 dark:text-white">{line.name}</p>
                    <p className="text-[12px] text-ink-500">
                      {line.variant} · Qty {line.qty}
                    </p>
                  </div>
                  <p className="text-[13px] font-semibold tabular">{inr(line.price * line.qty)}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold">
            <Truck className="size-4 text-ink-400" />
            Delivery
          </h2>
          <Button variant="ghost" size="sm" onClick={onEditShipping}>
            Edit
          </Button>
        </div>
        <p className="mt-3 text-[13px] text-ink-700 dark:text-ink-200">
          <span className="font-semibold">{shipping.label}</span> · {shipping.estimate} · {inr(shipping.price)}
        </p>
      </section>

      <StepActions primary={<Button size="lg" onClick={onContinue}>Continue to Payment</Button>} />
    </div>
  )
}

/* ------------------------------------------------------------- 5. payment -- */
function PaymentStep({
  amount,
  onResult,
  onBack,
}: {
  amount: number
  onResult: (result: 'success' | 'failed' | 'pending') => void
  onBack: () => void
}) {
  const [method, setMethod] = useState('upi')
  const [upiId, setUpiId] = useState('')
  const [outcome, setOutcome] = useState<'success' | 'failed' | 'pending'>('success')

  return (
    <section className="rounded-lg border bg-card p-5 shadow-xs sm:p-6">
      <h2 className="text-[17px] font-semibold">Payment</h2>
      <p className="mt-1.5 text-[13px] text-ink-600 dark:text-ink-300">Choose your preferred payment method.</p>

      <ul className="mt-5 grid gap-2.5">
        {PAYMENT_METHODS.map((option) => {
          const selected = option.id === method
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => setMethod(option.id)}
                aria-pressed={selected}
                className={cn(
                  'flex w-full items-center gap-3.5 rounded-lg border p-4 text-left transition-colors',
                  selected ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/40' : 'hover:border-ink-300'
                )}
              >
                <span
                  className={cn(
                    'grid size-5 shrink-0 place-items-center rounded-full border-2',
                    selected ? 'border-brand-600 bg-brand-600' : 'border-ink-300'
                  )}
                >
                  {selected && <span className="size-1.5 rounded-full bg-white" />}
                </span>
                <option.icon className="size-[18px] shrink-0 text-ink-500" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-ink-900 dark:text-white">{option.label}</span>
                  <span className="block text-[12px] text-ink-500">{option.hint}</span>
                </span>
              </button>

              {selected && option.id === 'upi' && (
                <div className="mt-2.5 rounded-sm border bg-muted/40 p-4">
                  <Labeled label="UPI ID">
                    <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@bank" className="max-w-[280px]" />
                  </Labeled>
                  <p className="mt-2.5 text-[12px] text-ink-500">
                    You'll approve the request in your UPI app. Keep this page open while we confirm.
                  </p>
                </div>
              )}

              {selected && option.id === 'card' && (
                <div className="mt-2.5 rounded-sm border bg-muted/40 p-4">
                  <p className="flex items-center gap-2 text-[12px] font-semibold text-ink-700 dark:text-ink-200">
                    <Lock className="size-3.5" />
                    Card details are collected by our payment gateway
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="h-11 rounded-sm border border-dashed bg-background/60" aria-hidden />
                    <div className="h-11 rounded-sm border border-dashed bg-background/60" aria-hidden />
                  </div>
                  <p className="mt-2.5 text-[11px] text-ink-500">
                    SafalMarketHub never sees or stores your card number, expiry or CVV.
                  </p>
                </div>
              )}

              {selected && option.id === 'cod' && (
                <p className="mt-2.5 rounded-sm border border-gold-100 bg-gold-50 px-3.5 py-2.5 text-[12px] font-medium text-gold-600 dark:border-gold-600/40 dark:bg-gold-600/10 dark:text-gold-400">
                  Cash on delivery is available for this order. Please keep the exact amount ready.
                </p>
              )}
            </li>
          )
        })}
      </ul>

      {/* Mockup control: choose the gateway response to review each state */}
      <div className="mt-6 rounded-sm border border-dashed bg-muted/40 p-3.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Mockup — gateway response</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(['success', 'failed', 'pending'] as const).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOutcome(o)}
              className={cn(
                'rounded-sm border px-3 py-1.5 text-[12px] font-semibold capitalize transition-colors',
                outcome === o ? 'border-brand-600 bg-brand-600 text-white' : 'border-input text-ink-600 hover:border-ink-400'
              )}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <StepActions
        onBack={onBack}
        primary={
          <Button size="lg" onClick={() => onResult(outcome)}>
            <Lock className="size-4" />
            {method === 'cod' ? 'Place Order' : `Pay ${inr(amount)}`}
          </Button>
        }
      />

      <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-ink-500">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
        Please don't refresh or close this page while your payment is being processed.
      </p>
    </section>
  )
}

/* ------------------------------------------------------- terminal states --- */
function ProcessingState({ amount }: { amount: number }) {
  return (
    <div className="mx-auto max-w-[520px] py-16 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-50 dark:bg-brand-950">
        <span className="size-7 animate-spin rounded-full border-[3px] border-brand-600 border-r-transparent" />
      </span>
      <h1 className="mt-6 text-2xl">Processing payment…</h1>
      <p className="mx-auto mt-3 max-w-[380px] text-[15px] text-ink-600 dark:text-ink-300">
        We're confirming {inr(amount)} with your bank. Please don't refresh or close this page.
      </p>
    </div>
  )
}

function SuccessState({
  amount,
  address,
  shippingEstimate,
  signedIn,
}: {
  amount: number
  address?: Address
  shippingEstimate: string
  signedIn: boolean
}) {
  return (
    <div className="mx-auto max-w-[600px] py-8 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-teal-500 text-white">
        <Check className="size-9" strokeWidth={3} />
      </span>
      <h1 className="mt-6 text-2xl sm:text-[30px]">Order placed successfully!</h1>
      <p className="mx-auto mt-3 max-w-[420px] text-[15px] text-ink-600 dark:text-ink-300">
        Thank you for shopping with SafalMarketHub. A confirmation has been sent to your email.
      </p>

      <dl className="mt-8 grid gap-4 rounded-lg border bg-card p-5 text-left sm:grid-cols-2">
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Order number</dt>
          <dd className="mt-1 text-[15px] font-bold tabular text-ink-950 dark:text-white">SH-100145</dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Amount paid</dt>
          <dd className="mt-1 text-[15px] font-bold tabular text-ink-950 dark:text-white">{inr(amount)}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Delivery address</dt>
          <dd className="mt-1 text-[13px] text-ink-700 dark:text-ink-200">
            {address ? `${address.name}, ${address.line1}, ${address.city} ${address.pin}` : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Estimated delivery</dt>
          <dd className="mt-1 text-[13px] text-ink-700 dark:text-ink-200">{shippingEstimate}</dd>
        </div>
      </dl>

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Button size="lg" asChild>
          <AdminLink to="/account/orders/SH-100145">Track Order</AdminLink>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <AdminLink to="/shop/all">Continue Shopping</AdminLink>
        </Button>
      </div>

      {signedIn ? (
        <Button variant="ghost" size="sm" className="mt-4" asChild>
          <AdminLink to="/account/orders">View My Orders</AdminLink>
        </Button>
      ) : (
        <div className="mt-8 rounded-lg border border-brand-100 bg-brand-50 p-5 text-left dark:border-brand-800 dark:bg-brand-950/60">
          <p className="text-[14px] font-semibold text-brand-800 dark:text-brand-200">
            Want easier order tracking next time?
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-brand-800/80 dark:text-brand-200/80">
            Create a SafalMarketHub account using the same email address to manage your orders and addresses in one place.
          </p>
          <Button size="sm" className="mt-4" asChild>
            <AdminLink to="/register">Create My Account</AdminLink>
          </Button>
        </div>
      )}
    </div>
  )
}

function FailureState({ amount, onRetry }: { amount: number; onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-[520px] py-10 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-destructive/10 text-destructive">
        <CircleAlert className="size-8" />
      </span>
      <h1 className="mt-6 text-2xl">Payment unsuccessful</h1>
      <p className="mx-auto mt-3 max-w-[400px] text-[15px] text-ink-600 dark:text-ink-300">
        We couldn't complete your payment of {inr(amount)}. No order has been confirmed and you have not been charged.
      </p>
      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <Button onClick={onRetry}>Try Again</Button>
        <Button variant="outline" onClick={onRetry}>
          Another Method
        </Button>
        <Button variant="outline" asChild>
          <AdminLink to="/cart">Return to Cart</AdminLink>
        </Button>
      </div>
      <p className="mt-5 text-[12px] text-ink-500">
        If money has left your account it will be returned automatically within 5–7 working days.
      </p>
    </div>
  )
}

function PendingState({ amount }: { amount: number }) {
  return (
    <div className="mx-auto max-w-[520px] py-10 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-gold-50 text-gold-600 dark:bg-gold-600/15 dark:text-gold-400">
        <TriangleAlert className="size-8" />
      </span>
      <h1 className="mt-6 text-2xl">We're confirming your payment</h1>
      <p className="mx-auto mt-3 max-w-[400px] text-[15px] text-ink-600 dark:text-ink-300">
        Your bank hasn't confirmed {inr(amount)} yet. Please do not make another payment while we confirm the transaction.
      </p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Button onClick={() => toast.success('Still confirming', { description: 'We will email you as soon as the bank responds.' })}>
          Check Payment Status
        </Button>
        <Button variant="outline" asChild>
          <AdminLink to="/account/orders">View My Orders</AdminLink>
        </Button>
      </div>
      <p className="mt-5 text-[12px] text-ink-500">You'll get an email and a notification once the payment is settled.</p>
    </div>
  )
}

/* -------------------------------------------------------------- helpers ---- */
function Labeled({
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

function StepActions({ onBack, primary }: { onBack?: () => void; primary: React.ReactNode }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-5">
      {primary}
      {onBack && (
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
      )}
    </div>
  )
}

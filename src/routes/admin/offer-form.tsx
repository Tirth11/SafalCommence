import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Check, Info, Monitor, Smartphone, Sparkles, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink, adminLinkProps } from '@/components/admin/admin-link'
import { PageHeader, Panel } from '@/components/admin/primitives'
import { Stepper } from '@/components/seller/seller-bits'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SHOP_CATEGORIES, SHOP_PRODUCTS } from '@/data/shop'
import {
  CUSTOMER_SCOPE_LABELS,
  FUNDED_BY_LABELS,
  OFFER_KIND_LABELS,
  PLACEMENT_LABELS,
  type ApplicabilityScope,
  type CustomerScope,
  type FundedBy,
  type OfferKind,
  type Placement,
} from '@/data/offer-engine'
import { cn, money } from '@/lib/utils'

/* ==========================================================================
   Create a platform offer.

   Ten steps, in the order the decisions actually depend on each other: what
   kind, what it says, who pays, what it covers, who gets it, when, where it
   shows, what it stacks with, then a preview of every surface before it goes
   live. The preview matters — an offer configured once appears in eight
   places, and this is the only chance to see all of them together.
   ========================================================================== */

const STEPS = [
  { key: 'type', label: 'Type' },
  { key: 'details', label: 'Details' },
  { key: 'funding', label: 'Funding' },
  { key: 'products', label: 'Applies to' },
  { key: 'customers', label: 'Customers' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'placement', label: 'Placement' },
  { key: 'rules', label: 'Rules' },
  { key: 'preview', label: 'Preview' },
]

const KINDS: OfferKind[] = [
  'percent',
  'flat',
  'coupon',
  'free-delivery',
  'category',
  'brand',
  'product',
  'new-customer',
  'customer-specific',
  'payment',
  'flash-sale',
]

const ALL_PLACEMENTS = Object.keys(PLACEMENT_LABELS) as Placement[]

export function AdminOfferFormPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [published, setPublished] = useState(false)

  const [kind, setKind] = useState<OfferKind>('flat')
  const [name, setName] = useState('Weekend Electronics Campaign')
  const [displayName, setDisplayName] = useState('$50 OFF Electronics')
  const [description, setDescription] = useState('Save $50 when you spend $250 or more.')
  const [code, setCode] = useState('SAVE50')
  const [value, setValue] = useState('50')
  const [minOrder, setMinOrder] = useState('250')
  const [maxDiscount, setMaxDiscount] = useState('50')
  const [fundedBy, setFundedBy] = useState<FundedBy>('platform')
  const [scope, setScope] = useState<ApplicabilityScope>('categories')
  const [scopeValues, setScopeValues] = useState<string[]>(['Electronics'])
  const [customerScope, setCustomerScope] = useState<CustomerScope>('all')
  const [startsAt, setStartsAt] = useState('2026-08-15T00:00')
  const [endsAt, setEndsAt] = useState('2026-08-17T23:59')
  const [placements, setPlacements] = useState<Placement[]>(ALL_PLACEMENTS)
  const [withSeller, setWithSeller] = useState(true)
  const [withPayment, setWithPayment] = useState(true)
  const [withCoupon, setWithCoupon] = useState(false)

  const isPercent = ['percent', 'category', 'brand', 'product', 'flash-sale', 'payment'].includes(kind)
  const numericValue = Number(value) || 0

  if (published) return <Published name={displayName} onDone={() => navigate(adminLinkProps({ to: '/admin/offers' }))} />

  const toggle = <T,>(list: T[], item: T, set: (next: T[]) => void) =>
    set(list.includes(item) ? list.filter((v) => v !== item) : [...list, item])

  return (
    <>
      <PageHeader
        title="Create offer"
        description="Configure once — SafalMarketHub applies the same rules on every surface."
        breadcrumb={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'Offers & Promotions', to: '/admin/offers' },
          { label: 'Create offer', to: '/admin/offers/new' },
        ]}
      />

      <div className="mb-5 rounded-lg border bg-card px-4 py-3 shadow-xs">
        <Stepper steps={STEPS} current={STEPS[step].key} onSelect={(key) => setStep(STEPS.findIndex((s) => s.key === key))} />
      </div>

      {/* 1 — type */}
      {step === 0 && (
        <Panel title="What kind of offer is this?" description="This decides which fields matter later.">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {KINDS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setKind(option)}
                className={cn(
                  'rounded-lg border px-4 py-3 text-left text-[14px] font-medium transition-[border-color,background-color]',
                  kind === option
                    ? 'border-brand-600 bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-100'
                    : 'hover:border-ink-400'
                )}
              >
                {OFFER_KIND_LABELS[option]}
              </button>
            ))}
          </div>
        </Panel>
      )}

      {/* 2 — details */}
      {step === 1 && (
        <Panel title="Offer details" description="The internal name is for staff; the display name is what customers read.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Internal offer name" hint="Only visible to SafalMarketHub staff.">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Customer display name" hint="Shown on the homepage, product page and cart.">
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </Field>
            <Field label="Short description" className="sm:col-span-2">
              <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <Field label={isPercent ? 'Discount percentage' : 'Discount amount'} required>
              <Input value={value} onChange={(e) => setValue(e.target.value)} type="number" />
            </Field>
            <Field label="Coupon code" hint="Leave empty for an automatic offer.">
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="SAVE50" />
            </Field>
            <Field label="Minimum order">
              <Input value={minOrder} onChange={(e) => setMinOrder(e.target.value)} type="number" />
            </Field>
            <Field label="Maximum discount" hint="Caps the saving on a percentage offer.">
              <Input value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} type="number" />
            </Field>
          </div>
        </Panel>
      )}

      {/* 3 — funding */}
      {step === 2 && (
        <Panel
          title="Who funds this offer?"
          description="This drives settlement and what the campaign actually costs SafalMarketHub."
        >
          <div className="grid gap-2.5 sm:grid-cols-2">
            {(Object.keys(FUNDED_BY_LABELS) as FundedBy[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFundedBy(option)}
                className={cn(
                  'rounded-lg border p-4 text-left transition-[border-color,background-color]',
                  fundedBy === option ? 'border-brand-600 bg-brand-50 dark:bg-brand-950' : 'hover:border-ink-400'
                )}
              >
                <p className="text-[14px] font-semibold">{FUNDED_BY_LABELS[option]}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
                  {
                    {
                      platform: 'We absorb the full discount.',
                      seller: 'Deducted from the seller settlement.',
                      joint: 'Split between us and the seller.',
                      bank: 'Funded by the payment partner.',
                    }[option]
                  }
                </p>
              </button>
            ))}
          </div>
        </Panel>
      )}

      {/* 4 — applicability */}
      {step === 3 && (
        <Panel title="What does it apply to?">
          <div className="flex flex-wrap gap-2">
            {(['marketplace', 'categories', 'brands', 'products', 'sellers'] as ApplicabilityScope[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setScope(option)
                  setScopeValues([])
                }}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-[13px] font-medium capitalize transition-colors',
                  scope === option ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950' : 'hover:border-ink-400'
                )}
              >
                {option === 'marketplace' ? 'Entire marketplace' : option}
              </button>
            ))}
          </div>

          {scope !== 'marketplace' && (
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {optionsFor(scope).map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[13px] hover:border-ink-400"
                >
                  <Checkbox
                    checked={scopeValues.includes(option)}
                    onCheckedChange={() => toggle(scopeValues, option, setScopeValues)}
                  />
                  <span className="truncate">{option}</span>
                </label>
              ))}
            </div>
          )}

          {scope !== 'marketplace' && scopeValues.length === 0 && (
            <Alert variant="warning" className="mt-4">
              <TriangleAlert />
              <AlertTitle>Nothing selected</AlertTitle>
              <AlertDescription>
                Pick at least one, or the offer will never match a product and no customer will ever see it.
              </AlertDescription>
            </Alert>
          )}
        </Panel>
      )}

      {/* 5 — customers */}
      {step === 4 && (
        <Panel title="Who is eligible?">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {(Object.keys(CUSTOMER_SCOPE_LABELS) as CustomerScope[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCustomerScope(option)}
                className={cn(
                  'rounded-lg border px-4 py-3 text-left text-[14px] font-medium transition-[border-color,background-color]',
                  customerScope === option
                    ? 'border-brand-600 bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-100'
                    : 'hover:border-ink-400'
                )}
              >
                {CUSTOMER_SCOPE_LABELS[option]}
              </button>
            ))}
          </div>
        </Panel>
      )}

      {/* 6 — schedule */}
      {step === 5 && (
        <Panel title="When does it run?" description="Status follows the dates — scheduled, then live, then expired.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starts" required>
              <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </Field>
            <Field label="Ends" required>
              <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </Field>
          </div>

          {new Date(endsAt) <= new Date(startsAt) && (
            <Alert variant="destructive" className="mt-4">
              <TriangleAlert />
              <AlertTitle>The end is before the start</AlertTitle>
              <AlertDescription>This offer would expire the moment it was created.</AlertDescription>
            </Alert>
          )}
        </Panel>
      )}

      {/* 7 — placement */}
      {step === 6 && (
        <Panel
          title="Where should it appear?"
          description="Configure once. Every surface you tick reads the same offer rules."
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {ALL_PLACEMENTS.map((placement) => (
              <label
                key={placement}
                className="flex items-center gap-2.5 rounded-lg border px-3.5 py-3 text-[14px] hover:border-ink-400"
              >
                <Checkbox
                  checked={placements.includes(placement)}
                  onCheckedChange={() => toggle(placements, placement, setPlacements)}
                />
                {PLACEMENT_LABELS[placement]}
              </label>
            ))}
          </div>

          <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-ink-500">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            The shopping assistant will only mention this offer if you tick it here — it can never invent one.
          </p>
        </Panel>
      )}

      {/* 8 — combination rules */}
      {step === 7 && (
        <Panel title="What can it be combined with?" description="Stacking rules are checked by the offer engine at every step.">
          <div className="grid gap-3">
            <RuleToggle
              label="Combine with seller offers"
              body="A seller's own discount applies first, then this one to what remains."
              checked={withSeller}
              onChange={setWithSeller}
            />
            <RuleToggle
              label="Combine with payment offers"
              body="Bank or partner-card offers apply after this one."
              checked={withPayment}
              onChange={setWithPayment}
            />
            <RuleToggle
              label="Combine with another SafalMarketHub coupon"
              body="Usually off — two of our own coupons on one order is rarely intended."
              checked={withCoupon}
              onChange={setWithCoupon}
            />
          </div>
        </Panel>
      )}

      {/* 9 — preview */}
      {step === 8 && (
        <div className="grid gap-4">
          <Panel title="Preview" description="The same offer, as each surface will render it.">
            <div className="grid gap-4 lg:grid-cols-2">
              <PreviewCard title="Homepage" icon={Monitor}>
                <div className="rounded-lg border bg-brand-50 p-4 dark:bg-brand-950/50">
                  <p className="text-[20px] font-bold leading-none tracking-[-0.02em]">{displayName}</p>
                  <p className="mt-2 text-[13px] text-ink-700 dark:text-ink-200">{description}</p>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-500">Shop now →</p>
                </div>
              </PreviewCard>

              <PreviewCard title="Mobile" icon={Smartphone}>
                <div className="mx-auto w-[220px] rounded-xl border bg-card p-3 shadow-sm">
                  <p className="text-[16px] font-bold">{displayName}</p>
                  <p className="mt-1 text-[11px] text-ink-500">{description}</p>
                  {code && (
                    <p className="mt-2 inline-block rounded border border-dashed px-2 py-0.5 text-[11px] font-bold tabular">
                      {code}
                    </p>
                  )}
                </div>
              </PreviewCard>

              <PreviewCard title="Product page">
                <div className="rounded-lg border p-3">
                  <p className="text-[13px] font-semibold text-teal-700 dark:text-teal-100">
                    🏷 Extra {isPercent ? `${numericValue}%` : money(numericValue)} SafalMarketHub offer available
                  </p>
                  <p className="mt-1 text-[12px] text-ink-500">{description}</p>
                </div>
              </PreviewCard>

              <PreviewCard title="Cart">
                <div className="rounded-lg border bg-teal-50 p-3 dark:bg-teal-950/40">
                  <p className="text-[13px] font-semibold text-teal-800 dark:text-teal-100">
                    🎉 You qualify for {isPercent ? `${numericValue}% off` : `${money(numericValue)} off`}
                  </p>
                  <p className="mt-1 text-[12px] text-ink-600 dark:text-ink-300">
                    Or, with automatic best-offer on: ✓ Best offer applied.
                  </p>
                </div>
              </PreviewCard>

              <PreviewCard title="Shopping assistant" icon={Sparkles} className="lg:col-span-2">
                <div className="rounded-lg bg-muted p-3.5">
                  <p className="text-[13px] text-ink-600 dark:text-ink-300">
                    <strong className="text-ink-900 dark:text-white">Customer:</strong> “Do I have any offer on these
                    headphones?”
                  </p>
                  <p className="mt-2 text-[13px] text-ink-800 dark:text-ink-100">
                    <strong>Assistant:</strong> Yes — {displayName}.{' '}
                    {minOrder ? `On orders above ${money(Number(minOrder))}, ` : ''}that saves you{' '}
                    {isPercent ? `${numericValue}%` : money(numericValue)}.
                  </p>
                </div>
              </PreviewCard>
            </div>
          </Panel>

          <Panel title="Summary">
            <dl className="grid gap-2 text-[13px] sm:grid-cols-2">
              <Row label="Type" value={OFFER_KIND_LABELS[kind]} />
              <Row label="Funded by" value={FUNDED_BY_LABELS[fundedBy]} />
              <Row label="Applies to" value={scope === 'marketplace' ? 'Entire marketplace' : scopeValues.join(', ') || '—'} />
              <Row label="Customers" value={CUSTOMER_SCOPE_LABELS[customerScope]} />
              <Row label="Runs" value={`${startsAt.replace('T', ' ')} → ${endsAt.replace('T', ' ')}`} />
              <Row label="Appears on" value={`${placements.length} surfaces`} />
              <Row
                label="Stacks with"
                value={
                  [withSeller && 'seller offers', withPayment && 'payment offers', withCoupon && 'our coupons']
                    .filter(Boolean)
                    .join(', ') || 'nothing'
                }
              />
            </dl>
          </Panel>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
        ) : (
          <Button
            onClick={() => {
              setPublished(true)
              toast.success('Offer published', { description: displayName })
            }}
          >
            Publish offer
          </Button>
        )}
        <Button variant="ghost" asChild>
          <AdminLink to="/admin/offers">Cancel</AdminLink>
        </Button>
      </div>
    </>
  )
}

/* ---------------------------------------------------------------- pieces */

function optionsFor(scope: ApplicabilityScope): string[] {
  switch (scope) {
    case 'categories':
      return SHOP_CATEGORIES.map((c) => c.label)
    case 'brands':
      return [...new Set(SHOP_PRODUCTS.map((p) => p.brand))]
    case 'products':
      return SHOP_PRODUCTS.map((p) => p.name)
    case 'sellers':
      return [...new Set(SHOP_PRODUCTS.map((p) => p.seller))]
    default:
      return []
  }
}

function Field({
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
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-[13px]">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </Label>
      {children}
      {hint && <p className="mt-1 text-[12px] text-ink-500">{hint}</p>}
    </div>
  )
}

function RuleToggle({
  label,
  body,
  checked,
  onChange,
}: {
  label: string
  body: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border p-4 hover:border-ink-400">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(v === true)} className="mt-0.5" />
      <span>
        <span className="block text-[14px] font-medium text-ink-900 dark:text-white">{label}</span>
        <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-500">{body}</span>
      </span>
    </label>
  )
}

function PreviewCard({
  title,
  icon: Icon,
  className,
  children,
}: {
  title: string
  icon?: typeof Monitor
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('rounded-lg border bg-muted/30 p-4', className)}>
      <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">
        {Icon && <Icon className="size-3.5" />}
        {title}
      </p>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b py-1.5 last:border-0">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  )
}

function Published({ name, onDone }: { name: string; onDone: () => void }) {
  return (
    <Panel className="mx-auto max-w-[560px] text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-600/15 dark:text-teal-100">
        <Check className="size-6" strokeWidth={2.6} />
      </span>
      <h2 className="mt-4 text-[20px]">Offer published</h2>
      <p className="mx-auto mt-2 max-w-[400px] text-[14px] leading-relaxed text-ink-600 dark:text-ink-300">
        {name} is now part of the offer engine. Every surface you selected will apply the same rules.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={onDone}>Back to offers</Button>
      </div>
    </Panel>
  )
}

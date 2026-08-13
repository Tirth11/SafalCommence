import { useState } from 'react'
import { CreditCard, Lock, Plus, ShieldCheck, Sparkles, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink } from '@/components/admin/admin-link'
import { AccountLayout } from '@/routes/shop/account'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useShopperStore, type AssistantPermissions } from '@/store/shopper-store'
import { cn, money } from '@/lib/utils'

/* ==========================================================================
   Shopping & payment settings.

   What the assistant may do without being asked each time — and the one
   thing it may never do. "Purchase confirmation: always required" is shown
   as a fixed rule, not a switch, because a shopper who could turn it off
   would be one tap away from a purchase they never saw.
   ========================================================================== */

const PERMISSIONS: { key: keyof AssistantPermissions; label: string; body: string }[] = [
  {
    key: 'allowShoppingHelp',
    label: 'Allow help with shopping',
    body: 'Lets the assistant search, compare and prepare a cart for you.',
  },
  {
    key: 'useSavedAddresses',
    label: 'Use my saved addresses',
    body: 'It may suggest Home or Office. You can still change it before paying.',
  },
  {
    key: 'useSavedPayments',
    label: 'Use my saved payment methods',
    body: 'It may select a saved card. It never sees the full card number.',
  },
  {
    key: 'applyBestOffer',
    label: 'Apply the best available offer',
    body: 'Checks eligible offers before checkout and applies the one that saves you most.',
  },
]

export function ShoppingSettingsPage() {
  const { permissions, preferences, cards, setPermission, setPreference, addCard, removeCard, setDefaultCard } =
    useShopperStore()
  const [budgetDraft, setBudgetDraft] = useState(preferences.preferredBudget?.toString() ?? '')

  const master = permissions.allowShoppingHelp

  return (
    <AccountLayout>
      <header className="mb-6">
        <h1 className="text-2xl sm:text-[28px]">Shopping &amp; payments</h1>
        <p className="mt-1.5 text-[14px] text-ink-600 dark:text-ink-300">
          What the shopping assistant may do for you, and the details it may use.
        </p>
      </header>

      {/* ------------------------------------------------------ assistant -- */}
      <section className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
        <h2 className="flex items-center gap-2 text-[17px]">
          <Sparkles className="size-4.5 text-brand-600 dark:text-brand-300" />
          Shopping assistant
        </h2>

        <ul className="mt-4 divide-y">
          {PERMISSIONS.map((permission) => {
            const dependent = permission.key !== 'allowShoppingHelp'
            const disabled = dependent && !master
            return (
              <li key={permission.key} className={cn('flex items-start justify-between gap-5 py-4', disabled && 'opacity-55')}>
                <div className="min-w-0">
                  <Label htmlFor={permission.key} className="text-[14px]">
                    {permission.label}
                  </Label>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-500">{permission.body}</p>
                </div>
                <Switch
                  id={permission.key}
                  checked={permissions[permission.key]}
                  disabled={disabled}
                  onCheckedChange={(value) => setPermission(permission.key, value)}
                />
              </li>
            )
          })}
        </ul>

        {/* The rule that is not a setting. */}
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-600/40 dark:bg-teal-600/10">
          <Lock className="mt-0.5 size-4 shrink-0 text-teal-700 dark:text-teal-100" />
          <div>
            <p className="text-[13px] font-semibold text-teal-900 dark:text-teal-100">
              Purchase confirmation: always required
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-teal-800/90 dark:text-teal-100/80">
              The assistant can prepare everything, but you approve the product, address, price and payment method
              before anything is charged. This cannot be switched off.
            </p>
          </div>
        </div>

        {!master && (
          <Alert variant="warning" className="mt-4">
            <ShieldCheck />
            <AlertTitle>Assistant help is off</AlertTitle>
            <AlertDescription>
              It will still answer questions and show products, but won't prepare carts, choose addresses or apply
              offers for you.
            </AlertDescription>
          </Alert>
        )}
      </section>

      {/* ------------------------------------------------------- payments -- */}
      <section className="mt-6 rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-[17px]">
            <CreditCard className="size-4.5 text-ink-400" />
            Payment methods
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // A real build hands off to the payment provider's card form;
              // raw card details never reach SafalMarketHub.
              addCard({ brand: 'Mastercard', last4: '8891', expires: '04/30' })
              toast.success('Card added', { description: 'Mastercard •••• 8891' })
            }}
          >
            <Plus className="size-4" />
            Add payment method
          </Button>
        </div>

        <ul className="mt-4 grid gap-3">
          {cards.map((card) => (
            <li key={card.id} className="flex flex-wrap items-center gap-4 rounded-xl border p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-muted">
                <CreditCard className="size-4 text-ink-500" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-ink-900 dark:text-white">
                  {card.brand} •••• {card.last4}
                </span>
                <span className="block text-[12px] text-ink-500 tabular">Expires {card.expires}</span>
              </span>
              {card.isDefault ? (
                <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[11px] font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-200">
                  Default
                </span>
              ) : (
                <Button variant="ghost" size="sm" className="h-8" onClick={() => setDefaultCard(card.id)}>
                  Set as default
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-red-600 hover:text-red-700 dark:text-red-300"
                onClick={() => {
                  removeCard(card.id)
                  toast.success('Card removed')
                }}
              >
                <Trash2 className="size-3.5" />
                Remove
              </Button>
            </li>
          ))}
        </ul>

        <p className="mt-4 flex items-start gap-2 border-t pt-4 text-[12px] leading-relaxed text-ink-500">
          <Lock className="mt-0.5 size-3.5 shrink-0" />
          Cards are stored as tokens by our payment provider. SafalMarketHub never holds your card number, and card
          details are never kept in your conversation history.
        </p>
      </section>

      {/* ---------------------------------------------------- preferences -- */}
      <section className="mt-6 rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
        <h2 className="text-[17px]">Shopping preferences</h2>

        <dl className="mt-4 divide-y">
          <Preference label="Default delivery address" value={preferences.defaultAddressLabel}>
            <Button variant="ghost" size="sm" className="h-8" asChild>
              <AdminLink to="/account/addresses">Change</AdminLink>
            </Button>
          </Preference>

          <Preference
            label="Preferred payment method"
            value={
              cards.find((c) => c.id === preferences.preferredCardId)
                ? `${cards.find((c) => c.id === preferences.preferredCardId)!.brand} •••• ${
                    cards.find((c) => c.id === preferences.preferredCardId)!.last4
                  }`
                : 'Not set'
            }
          />

          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <Label htmlFor="budget" className="text-[14px]">
                Preferred budget
              </Label>
              <p className="mt-1 text-[12px] text-ink-500">
                {preferences.preferredBudget
                  ? `We'll keep suggestions under ${money(preferences.preferredBudget)}.`
                  : 'Not set — we show everything.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="budget"
                type="number"
                value={budgetDraft}
                placeholder="No limit"
                onChange={(e) => setBudgetDraft(e.target.value)}
                className="h-9 w-[120px] tabular"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const value = budgetDraft.trim() ? Number(budgetDraft) : null
                  setPreference('preferredBudget', value)
                  toast.success(value ? `Budget set to ${money(value)}` : 'Budget cleared')
                }}
              >
                Save
              </Button>
            </div>
          </div>

          <ToggleRow
            id="offers-first"
            label="Show offers first"
            body="Puts discounted products at the top of listings."
            checked={preferences.showOffersFirst}
            onChange={(v) => setPreference('showOffersFirst', v)}
          />
          <ToggleRow
            id="price-drops"
            label="Notify me about price drops"
            body="Only for products you saved or viewed."
            checked={preferences.notifyPriceDrops}
            onChange={(v) => setPreference('notifyPriceDrops', v)}
          />
          <ToggleRow
            id="upcoming-sales"
            label="Notify me about upcoming sales"
            body="A reminder the day a sale you asked about begins."
            checked={preferences.notifyUpcomingSales}
            onChange={(v) => setPreference('notifyUpcomingSales', v)}
          />
        </dl>
      </section>
    </AccountLayout>
  )
}

function Preference({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <dt className="text-[14px] font-medium text-ink-900 dark:text-white">{label}</dt>
        <dd className="mt-1 text-[12px] text-ink-500">{value}</dd>
      </div>
      {children}
    </div>
  )
}

function ToggleRow({
  id,
  label,
  body,
  checked,
  onChange,
}: {
  id: string
  label: string
  body: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-5 py-4">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-[14px]">
          {label}
        </Label>
        <p className="mt-1 text-[12px] text-ink-500">{body}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

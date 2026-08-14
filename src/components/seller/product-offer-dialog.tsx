import { useState } from 'react'
import { Check, Tag, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SELLER_OFFER_POLICY } from '@/data/offer-engine'
import { marginAt, priceInsightFor } from '@/data/seller-assistant'
import type { SellerProduct } from '@/data/seller'
import { usePlan } from '@/store/storefront-store'
import { cn, money } from '@/lib/utils'

/* ==========================================================================
   A discount on one product, added from the product row.

   Deliberately not the campaign form. A seller marking down one slow item
   should not have to name a campaign, pick an audience or write a customer
   label — but they should still see the margin before they commit, and the
   same platform limits still apply.
   ========================================================================== */

export function ProductOfferDialog({
  product,
  open,
  onOpenChange,
}: {
  product: SellerProduct
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const plan = usePlan()
  const [discount, setDiscount] = useState('10')
  const [days, setDays] = useState('7')
  const [done, setDone] = useState(false)

  const percent = Number(discount) || 0
  const duration = Number(days) || 0
  const offerPrice = Math.round(product.price * (1 - percent / 100))

  const overMax = percent > SELLER_OFFER_POLICY.maxDiscountPercent
  const overDuration = duration > SELLER_OFFER_POLICY.maxDurationDays
  const needsApproval = percent > SELLER_OFFER_POLICY.approvalAbovePercent && !overMax
  const blocked = overMax || overDuration || percent <= 0

  const insight = priceInsightFor(product)
  const margin = marginAt(product, offerPrice, plan.commission)

  const close = (next: boolean) => {
    if (!next) {
      setDone(false)
      setDiscount('10')
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-[460px]">
        {done ? (
          <div className="text-center">
            <span className="mx-auto grid size-11 place-items-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-600/15 dark:text-teal-100">
              <Check className="size-5" strokeWidth={2.6} />
            </span>
            <DialogTitle className="mt-3 text-[18px]">
              {needsApproval ? 'Sent for approval' : 'Offer is live'}
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-[13px]">
              {needsApproval
                ? 'Nothing has changed on your listing yet — we review deeper discounts first.'
                : `${product.name} now shows ${money(offerPrice)} to customers.`}
            </DialogDescription>
            <Button className="mt-5 w-full" onClick={() => close(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogTitle className="flex items-center gap-2 text-[18px]">
              <Tag className="size-4 text-brand-600 dark:text-brand-300" />
              Add an offer
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              {product.name} · currently {money(product.price)}
            </DialogDescription>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-[12px]">Discount %</Label>
                <Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5 block text-[12px]">Runs for (days)</Label>
                <Input type="number" value={days} onChange={(e) => setDays(e.target.value)} />
              </div>
            </div>

            {/* The number that actually matters, before they commit. */}
            <dl className="mt-4 grid gap-1.5 rounded-lg border p-3.5 text-[12.5px]">
              <Row label="New price" value={money(offerPrice)} strong />
              {insight && <Row label="Marketplace average" value={money(insight.average)} />}
              <Row label={`SafalMarketHub fee (${plan.commission}%)`} value={`− ${money(margin.fee)}`} />
              <Row label="You keep per sale" value={money(margin.earnings)} strong />
              <Row label="Stock" value={`${product.available} available`} />
            </dl>

            {margin.thin && !blocked && (
              <Alert variant="warning" className="mt-3">
                <TriangleAlert />
                <AlertTitle>Thin margin</AlertTitle>
                <AlertDescription>You keep about {money(margin.earnings)} per sale after fees.</AlertDescription>
              </Alert>
            )}
            {overMax && (
              <Alert variant="destructive" className="mt-3">
                <TriangleAlert />
                <AlertTitle>Above the {SELLER_OFFER_POLICY.maxDiscountPercent}% platform maximum</AlertTitle>
                <AlertDescription>Lower the discount to publish.</AlertDescription>
              </Alert>
            )}
            {overDuration && (
              <Alert variant="destructive" className="mt-3">
                <TriangleAlert />
                <AlertTitle>Longer than {SELLER_OFFER_POLICY.maxDurationDays} days</AlertTitle>
                <AlertDescription>Shorten the run to publish.</AlertDescription>
              </Alert>
            )}
            {needsApproval && (
              <Alert variant="warning" className="mt-3">
                <TriangleAlert />
                <AlertTitle>Needs approval</AlertTitle>
                <AlertDescription>
                  Above {SELLER_OFFER_POLICY.approvalAbovePercent}% we review before it reaches customers.
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-5 flex gap-2">
              <Button
                className="flex-1"
                disabled={blocked}
                onClick={() => {
                  setDone(true)
                  toast.success(needsApproval ? 'Sent for approval' : 'Offer published', { description: product.name })
                }}
              >
                {needsApproval ? 'Submit for approval' : `Publish ${percent}% off`}
              </Button>
              <Button variant="ghost" onClick={() => close(false)}>
                Cancel
              </Button>
            </div>

            <p className="mt-2 text-[11px] leading-relaxed text-ink-500">
              This changes what customers pay. You can end it early at any time.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className={cn('tabular', strong ? 'font-bold text-ink-950 dark:text-white' : 'font-semibold')}>{value}</dd>
    </div>
  )
}

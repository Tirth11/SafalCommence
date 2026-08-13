import { useState } from 'react'
import { Check, PackageCheck, Star, ThumbsDown, ThumbsUp, Undo2 } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink } from '@/components/admin/admin-link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useShopperStore } from '@/store/shopper-store'
import { cn } from '@/lib/utils'

/* ==========================================================================
   After delivery: three separate questions.

   Product, seller and courier are different parties, and merging them into
   one star rating tells you nothing useful — a great product delivered late
   should not cost the seller a star, and vice versa.

   A low rating routes to help rather than a thank-you: if the item arrived
   damaged, the useful next screen is Request a return, not a confirmation.
   ========================================================================== */

const PRODUCT_ISSUES = ['Quality', 'Damaged', 'Not as described', 'Wrong item', 'Performance', 'Other']
const SELLER_GOOD = ['Fast shipping', 'Good packaging', 'As described']
const SELLER_BAD = ['Late shipping', 'Poor packaging', 'Wrong item']
const DELIVERY_ISSUES = ['Late', 'Damaged package', 'Tracking problem', 'Delivery experience']

export function DeliveryFeedback({
  orderId,
  productName,
  sellerName,
}: {
  orderId: string
  productName: string
  sellerName: string
}) {
  const feedback = useShopperStore((s) => s.feedback[orderId])

  const complete = feedback?.productRating && feedback?.sellerRating && feedback?.deliveryRating

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
      <h2 className="flex items-center gap-2 text-[17px]">
        <PackageCheck className="size-4.5 text-teal-600 dark:text-teal-100" />
        How did it go?
      </h2>
      <p className="mt-1 text-[13px] text-ink-500">
        Three quick questions. They go to different places, so each one counts.
      </p>

      <div className="mt-5 grid gap-4">
        <ProductFeedback orderId={orderId} productName={productName} />
        <SellerFeedback orderId={orderId} sellerName={sellerName} />
        <CourierFeedback orderId={orderId} />
      </div>

      {complete && (
        <p className="mt-4 flex items-center gap-2 border-t pt-4 text-[13px] font-medium text-teal-700 dark:text-teal-100">
          <Check className="size-4" />
          Thanks — that's all of it.
        </p>
      )}
    </section>
  )
}

/* ------------------------------------------------------------- product --- */
function ProductFeedback({ orderId, productName }: { orderId: string; productName: string }) {
  const feedback = useShopperStore((s) => s.feedback[orderId])
  const saveFeedback = useShopperStore((s) => s.saveFeedback)
  const [review, setReview] = useState('')
  const rating = feedback?.productRating

  return (
    <Block title="How was your product?" sub={productName}>
      <Stars value={rating ?? 0} onChange={(value) => saveFeedback(orderId, { productRating: value })} label="Product rating" />

      {rating !== undefined && rating >= 4 && (
        <div className="mt-4">
          <p className="text-[13px] font-medium text-teal-700 dark:text-teal-100">Glad you liked it.</p>
          <Textarea
            rows={2}
            className="mt-2"
            placeholder="Write a review (optional)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
          <Button
            size="sm"
            className="mt-2"
            disabled={!review.trim()}
            onClick={() => {
              saveFeedback(orderId, { review })
              toast.success('Review posted', { description: 'Thanks — it will show on the product page.' })
            }}
          >
            Post review
          </Button>
        </div>
      )}

      {rating !== undefined && rating <= 3 && (
        <div className="mt-4">
          <p className="text-[13px] font-medium text-ink-800 dark:text-ink-100">What wasn't right?</p>
          <Chips
            options={PRODUCT_ISSUES}
            selected={feedback?.productIssue ? [feedback.productIssue] : []}
            onSelect={(issue) => saveFeedback(orderId, { productIssue: issue })}
          />
          {feedback?.productIssue && (
            <div className="mt-3 rounded-xl border bg-muted/50 p-3.5">
              <p className="text-[13px] text-ink-700 dark:text-ink-200">
                Sorry about that. Would you like help with this order?
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <AdminLink to="/account/returns">
                    <Undo2 className="size-3.5" />
                    Request a return
                  </AdminLink>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <AdminLink to="/account/support">Contact support</AdminLink>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Block>
  )
}

/* -------------------------------------------------------------- seller --- */
function SellerFeedback({ orderId, sellerName }: { orderId: string; sellerName: string }) {
  const feedback = useShopperStore((s) => s.feedback[orderId])
  const saveFeedback = useShopperStore((s) => s.saveFeedback)
  const rating = feedback?.sellerRating
  const tags = feedback?.sellerTags ?? []

  return (
    <Block title={`How was ${sellerName}?`} sub="Kept separate from the product rating.">
      <Stars value={rating ?? 0} onChange={(value) => saveFeedback(orderId, { sellerRating: value })} label="Seller rating" />

      {rating !== undefined && (
        <Chips
          className="mt-3"
          options={rating >= 4 ? SELLER_GOOD : SELLER_BAD}
          selected={tags}
          multi
          onSelect={(tag) =>
            saveFeedback(orderId, {
              sellerTags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag],
            })
          }
        />
      )}
    </Block>
  )
}

/* ------------------------------------------------------------ delivery --- */
function CourierFeedback({ orderId }: { orderId: string }) {
  const feedback = useShopperStore((s) => s.feedback[orderId])
  const saveFeedback = useShopperStore((s) => s.saveFeedback)

  return (
    <Block title="How was your delivery?" sub="The courier, not the seller.">
      <div className="flex gap-2">
        {(
          [
            { value: 'good', label: 'Good', Icon: ThumbsUp },
            { value: 'poor', label: 'Poor', Icon: ThumbsDown },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={feedback?.deliveryRating === option.value}
            onClick={() => saveFeedback(orderId, { deliveryRating: option.value })}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors',
              feedback?.deliveryRating === option.value
                ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                : 'text-ink-600 hover:border-ink-400 dark:text-ink-300'
            )}
          >
            <option.Icon className="size-4" />
            {option.label}
          </button>
        ))}
      </div>

      {feedback?.deliveryRating === 'poor' && (
        <Chips
          className="mt-3"
          options={DELIVERY_ISSUES}
          selected={feedback.deliveryIssue ? [feedback.deliveryIssue] : []}
          onSelect={(issue) => saveFeedback(orderId, { deliveryIssue: issue })}
        />
      )}
    </Block>
  )
}

/* ---------------------------------------------------------------- bits --- */
function Block({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-[14px] font-semibold text-ink-900 dark:text-white">{title}</p>
      {sub && <p className="mt-0.5 line-clamp-1 text-[12px] text-ink-500">{sub}</p>}
      <div className="mt-3">{children}</div>
    </div>
  )
}

function Stars({ value, onChange, label }: { value: number; onChange: (value: number) => void; label: string }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="rounded-sm p-0.5"
        >
          <Star className={cn('size-6 transition-colors', star <= shown ? 'fill-gold-400 text-gold-400' : 'text-ink-300')} />
        </button>
      ))}
      {value > 0 && <span className="ml-2 text-[12px] font-semibold tabular text-ink-500">{value}/5</span>}
    </div>
  )
}

function Chips({
  options,
  selected,
  onSelect,
  multi = false,
  className,
}: {
  options: string[]
  selected: string[]
  onSelect: (value: string) => void
  multi?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={selected.includes(option)}
          onClick={() => onSelect(option)}
          className={cn(
            'rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors',
            selected.includes(option)
              ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
              : 'text-ink-600 hover:border-ink-400 dark:text-ink-300'
          )}
        >
          {option}
        </button>
      ))}
      {multi && selected.length > 0 && (
        <span className="self-center text-[11px] text-ink-500">{selected.length} selected</span>
      )}
    </div>
  )
}

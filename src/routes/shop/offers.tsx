import { useNavigate } from '@tanstack/react-router'
import { Bell, BookmarkCheck, Check, Clock, Copy, Tag } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { EmptyState } from '@/components/admin/primitives'
import { AccountLayout } from '@/routes/shop/account'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TODAY_OFFERS, UPCOMING_OFFERS, type Offer } from '@/data/offers'
import { useShopperStore } from '@/store/shopper-store'
import { cn, money } from '@/lib/utils'

/* ==========================================================================
   My Offers — the offer wallet.

   Four tabs, and the distinction is what the shopper can do right now:
   available (use it), saved (kept for later), upcoming (only remind me),
   used (already spent).
   ========================================================================== */

const TABS = [
  { value: 'available', label: 'Available' },
  { value: 'saved', label: 'Saved' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'used', label: 'Used' },
]

export function MyOffersPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const { savedOfferIds, usedOfferIds } = useShopperStore()

  const tab = search.tab ?? 'available'
  const setTab = (value: string) => navigate(adminLinkProps({ to: '/account/offers', search: { tab: value } }))

  const available = TODAY_OFFERS.filter((o) => !usedOfferIds.includes(o.id))
  const saved = TODAY_OFFERS.filter((o) => savedOfferIds.includes(o.id) && !usedOfferIds.includes(o.id))
  const used = TODAY_OFFERS.filter((o) => usedOfferIds.includes(o.id))

  return (
    <AccountLayout>
      <header className="mb-6">
        <h1 className="text-2xl sm:text-[28px]">My offers</h1>
        <p className="mt-1.5 text-[14px] text-ink-600 dark:text-ink-300">
          Everything you can use, keep for later, or wait for.
        </p>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-5">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="available">
          <OfferGrid offers={available} empty="No offers are running for your account right now." />
        </TabsContent>
        <TabsContent value="saved">
          <OfferGrid offers={saved} empty="Nothing saved yet. Tap the bookmark on an offer to keep it here." />
        </TabsContent>
        <TabsContent value="upcoming">
          <UpcomingGrid />
        </TabsContent>
        <TabsContent value="used">
          <OfferGrid offers={used} spent empty="You haven't used an offer yet." />
        </TabsContent>
      </Tabs>
    </AccountLayout>
  )
}

function OfferGrid({ offers, empty, spent = false }: { offers: Offer[]; empty: string; spent?: boolean }) {
  const { savedOfferIds, toggleSavedOffer } = useShopperStore()

  if (!offers.length) {
    return (
      <div className="rounded-lg border bg-card">
        <EmptyState
          icon={Tag}
          title="Nothing here"
          body={empty}
          action={
            <Button asChild>
              <AdminLink to="/shop/all">Browse products</AdminLink>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {offers.map((offer) => {
        const isSaved = savedOfferIds.includes(offer.id)
        return (
          <li key={offer.id}>
            <div className={cn('flex h-full flex-col rounded-2xl border p-5', spent && 'opacity-60')}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[22px] font-bold leading-none tracking-[-0.02em] tabular text-ink-950 dark:text-white">
                    {offer.headline}
                  </p>
                  <p className="mt-2 text-[14px] text-ink-700 dark:text-ink-200">{offer.detail}</p>
                </div>
                {!spent && (
                  <button
                    type="button"
                    aria-label={isSaved ? `Remove ${offer.headline} from saved` : `Save ${offer.headline}`}
                    aria-pressed={isSaved}
                    onClick={() => {
                      toggleSavedOffer(offer.id)
                      toast.success(isSaved ? 'Removed from saved' : 'Saved for later')
                    }}
                    className="grid size-8 shrink-0 place-items-center rounded-full border transition-colors hover:border-brand-400"
                  >
                    <BookmarkCheck className={cn('size-4', isSaved ? 'text-brand-600 dark:text-brand-300' : 'text-ink-400')} />
                  </button>
                )}
              </div>

              <dl className="mt-4 grid gap-1 border-t pt-3 text-[12px]">
                {offer.minOrder > 0 && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-500">Minimum order</dt>
                    <dd className="font-semibold tabular">{money(offer.minOrder)}</dd>
                  </div>
                )}
                {offer.maxDiscount !== null && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-500">Maximum discount</dt>
                    <dd className="font-semibold tabular">{money(offer.maxDiscount)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-500">Valid</dt>
                  <dd className="font-semibold">{spent ? 'Used' : offer.endsLabel}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
                {offer.code && (
                  <button
                    type="button"
                    onClick={() => toast.success('Code copied', { description: offer.code })}
                    className="inline-flex items-center gap-1.5 rounded-md border border-dashed bg-muted/60 px-2.5 py-1 text-[12px] font-bold tabular"
                  >
                    {offer.code}
                    <Copy className="size-3 text-ink-400" />
                  </button>
                )}
                {!spent && (
                  <Button size="sm" className="ml-auto" asChild>
                    <AdminLink to="/shop/all" search={offer.category ? { category: offer.category } : undefined}>
                      Shop offer
                    </AdminLink>
                  </Button>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function UpcomingGrid() {
  const { remindedOfferIds, toggleReminder } = useShopperStore()

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {UPCOMING_OFFERS.map((offer) => {
        const on = remindedOfferIds.includes(offer.id)
        return (
          <li key={offer.id}>
            <div className="flex h-full flex-col rounded-2xl border border-dashed p-5">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-600 dark:text-brand-300">
                <Clock className="size-3.5" />
                {offer.starts}
              </p>
              <p className="mt-2 text-[18px] font-semibold text-ink-900 dark:text-white">{offer.title}</p>
              <p className="mt-1 text-[13px] text-ink-500">{offer.detail}</p>
              <Button
                variant={on ? 'ghost' : 'outline'}
                size="sm"
                className="mt-4 w-fit"
                onClick={() => {
                  toggleReminder(offer.id)
                  toast.success(on ? 'Reminder removed' : "We'll remind you", {
                    description: on ? undefined : `${offer.title} — ${offer.starts.toLowerCase()}`,
                  })
                }}
              >
                {on ? (
                  <>
                    <Check className="size-4" />
                    Reminder set
                  </>
                ) : (
                  <>
                    <Bell className="size-4" />
                    Remind me
                  </>
                )}
              </Button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

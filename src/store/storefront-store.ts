import { create } from 'zustand'

import { getPlan, type PlanId, type SalesChannel } from '@/data/plans'

/* ==========================================================================
   Seller subscription + white-label storefront.

   One catalogue, many channels: a product is created once and the seller
   chooses where it sells and at what price per channel. Inventory stays
   shared — SafalMarketHub is the single source of stock.
   ========================================================================== */

export type StoreStatus = 'not_started' | 'draft' | 'published'

export type DomainStatus = 'none' | 'pending' | 'verified'

export type StorefrontConfig = {
  name: string
  slug: string
  themeId: string
  logoText: string
  brandColor: string
  accentColor: string
  font: 'Inter' | 'Sora' | 'Playfair'
  bannerHeadline: string
  bannerSub: string
  description: string
  supportEmail: string
  supportPhone: string
  instagram: string
  policiesConfigured: boolean
}

type StorefrontState = {
  planId: PlanId
  status: StoreStatus
  config: StorefrontConfig
  customDomain: string
  domainStatus: DomainStatus
  /** Which channels each product sells on, and at what price. */
  channelPricing: Record<string, { marketplace: { on: boolean; price: number }; store: { on: boolean; price: number } }>

  changePlan: (planId: PlanId) => void
  updateConfig: (patch: Partial<StorefrontConfig>) => void
  publish: () => void
  unpublish: () => void
  connectDomain: (domain: string) => void
  verifyDomain: () => void
  removeDomain: () => void
  setChannel: (productId: string, channel: 'marketplace' | 'store', patch: { on?: boolean; price?: number }) => void
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 24) || 'mystore'

export const useStorefrontStore = create<StorefrontState>((set) => ({
  // Starts on the free plan so the upgrade path is reviewable end to end.
  planId: 'starter',
  status: 'not_started',
  customDomain: '',
  domainStatus: 'none',
  config: {
    name: 'ABC Electronics',
    slug: 'abcelectronics',
    themeId: 'minimal',
    logoText: 'ABC',
    brandColor: '#543BCB',
    accentColor: '#14827C',
    font: 'Inter',
    bannerHeadline: 'Audio gear, chosen well',
    bannerSub: 'Headphones, speakers and accessories from a Mumbai shop that has been at it since 2019.',
    description: 'Audio and mobile accessories retailer based in Mumbai. Authorised dealer for SoundPro and Kairo.',
    supportEmail: 'support@abcelectronics.in',
    supportPhone: '+91 98200 41122',
    instagram: '@abcelectronics',
    policiesConfigured: false,
  },
  channelPricing: {},

  changePlan: (planId) =>
    set((state) => {
      const plan = getPlan(planId)
      // Downgrading below a white-label plan takes the storefront offline.
      const status: StoreStatus = plan.whiteLabel ? state.status : 'not_started'
      const keepsDomain = plan.customDomain
      return {
        planId,
        status,
        customDomain: keepsDomain ? state.customDomain : '',
        domainStatus: keepsDomain ? state.domainStatus : 'none',
      }
    }),

  updateConfig: (patch) =>
    set((state) => {
      const next = { ...state.config, ...patch }
      if (patch.name && !patch.slug) next.slug = slugify(patch.name)
      return { config: next, status: state.status === 'not_started' ? 'draft' : state.status }
    }),

  publish: () => set({ status: 'published' }),
  unpublish: () => set({ status: 'draft' }),

  connectDomain: (domain) => set({ customDomain: domain.trim().replace(/^https?:\/\//, ''), domainStatus: 'pending' }),
  verifyDomain: () => set({ domainStatus: 'verified' }),
  removeDomain: () => set({ customDomain: '', domainStatus: 'none' }),

  setChannel: (productId, channel, patch) =>
    set((state) => {
      const current = state.channelPricing[productId] ?? {
        marketplace: { on: true, price: 0 },
        store: { on: false, price: 0 },
      }
      return {
        channelPricing: {
          ...state.channelPricing,
          [productId]: { ...current, [channel]: { ...current[channel], ...patch } },
        },
      }
    }),
}))

/* ---------------------------------------------------------------- derived -- */

export function usePlan() {
  return getPlan(useStorefrontStore((s) => s.planId))
}

/** The address customers actually visit. */
export function useStoreUrl() {
  const { config, customDomain, domainStatus } = useStorefrontStore()
  if (domainStatus === 'verified' && customDomain) return customDomain
  return `${config.slug}.safalmarkethub.store`
}

export function useHasWhiteLabel() {
  const planId = useStorefrontStore((s) => s.planId)
  return getPlan(planId).whiteLabel
}

/** Growth keeps the badge; Pro and above remove it. */
export function useShowsPoweredBy() {
  const planId = useStorefrontStore((s) => s.planId)
  return !getPlan(planId).removeBranding
}

export const CHANNEL_BADGE: Record<SalesChannel, { label: string; short: string }> = {
  marketplace: { label: 'SafalMarketHub', short: 'Marketplace' },
  store: { label: 'Online Store', short: 'Own store' },
  b2b: { label: 'B2B Wholesale', short: 'B2B' },
}

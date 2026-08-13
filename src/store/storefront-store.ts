import { create } from 'zustand'

import { getPlan, TRIAL_DAYS, type PlanId, type SalesChannel } from '@/data/plans'
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  SELLER_COLLECTIONS,
  SELLER_COUPONS,
  type Collection,
  type Coupon,
  type HomepageSection,
  type HomepageSectionId,
  type PolicyKey,
} from '@/data/marketing'

/* ==========================================================================
   Seller subscription + white-label storefront.

   One catalogue, many channels: a product is created once and the seller
   chooses where it sells and at what price per channel. Inventory stays
   shared — SafalMarketHub is the single source of stock.

   A storefront can be *built* on any plan during the trial; publishing is
   what requires a subscription. That way sellers see the thing before paying.
   ========================================================================== */

export type StoreStatus = 'not_started' | 'draft' | 'published' | 'paused'

export type DomainStatus = 'none' | 'pending' | 'verified'

export type StorefrontConfig = {
  name: string
  slug: string
  themeId: string
  logoText: string
  faviconText: string
  brandColor: string
  accentColor: string
  font: 'Inter' | 'Sora' | 'Playfair'
  bannerHeadline: string
  bannerSub: string
  description: string
  supportEmail: string
  supportPhone: string
  instagram: string
  /** Thin strip above the header — the cheapest conversion lever there is. */
  announcement: { on: boolean; text: string }
  freeShipping: { on: boolean; threshold: number }
  brandedEmails: boolean
}

/** Which of the six setup steps the seller has finished. */
export type SetupStepId = 'details' | 'branding' | 'homepage' | 'selling' | 'url' | 'preview'

type StorefrontState = {
  planId: PlanId
  status: StoreStatus
  config: StorefrontConfig
  customDomain: string
  domainStatus: DomainStatus
  /** Which channels each product sells on, and at what price. */
  channelPricing: Record<string, { marketplace: { on: boolean; price: number }; store: { on: boolean; price: number } }>
  homepageSections: HomepageSection[]
  collections: Collection[]
  coupons: Coupon[]
  policies: Record<PolicyKey, string>
  completedSteps: SetupStepId[]
  /** Days left in the build-before-you-pay trial. */
  trialDaysLeft: number
  trialUsed: boolean
  pauseMessage: string

  changePlan: (planId: PlanId) => void
  startTrial: () => void
  updateConfig: (patch: Partial<StorefrontConfig>) => void
  completeStep: (step: SetupStepId) => void
  publish: () => void
  unpublish: () => void
  pauseStore: (message: string) => void
  resumeStore: () => void
  connectDomain: (domain: string) => void
  verifyDomain: () => void
  removeDomain: () => void
  setChannel: (productId: string, channel: 'marketplace' | 'store', patch: { on?: boolean; price?: number }) => void
  toggleSection: (id: HomepageSectionId) => void
  moveSection: (id: HomepageSectionId, direction: -1 | 1) => void
  addCollection: (collection: Omit<Collection, 'id'>) => void
  updateCollection: (id: string, patch: Partial<Collection>) => void
  removeCollection: (id: string) => void
  addCoupon: (coupon: Omit<Coupon, 'id' | 'used'>) => void
  updateCoupon: (id: string, patch: Partial<Coupon>) => void
  removeCoupon: (id: string) => void
  setPolicy: (key: PolicyKey, body: string) => void
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 24) || 'mystore'

export const useStorefrontStore = create<StorefrontState>((set) => ({
  // Starts on the free plan so the upgrade path is reviewable end to end.
  planId: 'free',
  status: 'not_started',
  customDomain: '',
  domainStatus: 'none',
  trialDaysLeft: TRIAL_DAYS,
  trialUsed: false,
  pauseMessage: '',
  config: {
    name: 'ABC Electronics',
    slug: 'abcelectronics',
    themeId: 'minimal',
    logoText: 'ABC',
    faviconText: 'A',
    brandColor: '#543BCB',
    accentColor: '#14827C',
    font: 'Inter',
    bannerHeadline: 'Audio gear, chosen well',
    bannerSub: 'Headphones, speakers and accessories from a shop that has been at it since 2019.',
    description: 'Audio and mobile accessories retailer. Authorised dealer for SoundPro and Kairo.',
    supportEmail: 'support@abcelectronics.com',
    supportPhone: '+1 415 555 0142',
    instagram: '@abcelectronics',
    announcement: { on: true, text: 'Free shipping on orders above $99 · 7-day returns' },
    freeShipping: { on: true, threshold: 99 },
    brandedEmails: false,
  },
  channelPricing: {},
  homepageSections: DEFAULT_HOMEPAGE_SECTIONS,
  collections: SELLER_COLLECTIONS,
  coupons: SELLER_COUPONS,
  policies: { returns: '', shipping: '', privacy: '', terms: '' },
  completedSteps: [],

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

  startTrial: () => set({ trialUsed: true, trialDaysLeft: TRIAL_DAYS, status: 'draft' }),

  updateConfig: (patch) =>
    set((state) => {
      const next = { ...state.config, ...patch }
      if (patch.name && !patch.slug) next.slug = slugify(patch.name)
      return { config: next, status: state.status === 'not_started' ? 'draft' : state.status }
    }),

  completeStep: (step) =>
    set((state) => ({
      completedSteps: state.completedSteps.includes(step) ? state.completedSteps : [...state.completedSteps, step],
      status: state.status === 'not_started' ? 'draft' : state.status,
    })),

  publish: () => set({ status: 'published', pauseMessage: '' }),
  unpublish: () => set({ status: 'draft' }),

  // Vacation mode: the store stays online and browsable, but stops taking orders.
  pauseStore: (message) => set({ status: 'paused', pauseMessage: message }),
  resumeStore: () => set({ status: 'published', pauseMessage: '' }),

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

  toggleSection: (id) =>
    set((state) => ({
      homepageSections: state.homepageSections.map((s) => (s.id === id && !s.locked ? { ...s, on: !s.on } : s)),
    })),

  moveSection: (id, direction) =>
    set((state) => {
      const sections = [...state.homepageSections]
      const from = sections.findIndex((s) => s.id === id)
      const to = from + direction
      if (from === -1 || to < 0 || to >= sections.length) return state
      ;[sections[from], sections[to]] = [sections[to], sections[from]]
      return { homepageSections: sections }
    }),

  addCollection: (collection) =>
    set((state) => ({ collections: [...state.collections, { ...collection, id: `COL-${state.collections.length + 1}` }] })),

  updateCollection: (id, patch) =>
    set((state) => ({ collections: state.collections.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

  removeCollection: (id) => set((state) => ({ collections: state.collections.filter((c) => c.id !== id) })),

  addCoupon: (coupon) =>
    set((state) => ({ coupons: [{ ...coupon, id: `CPN-${1005 + state.coupons.length}`, used: 0 }, ...state.coupons] })),

  updateCoupon: (id, patch) =>
    set((state) => ({ coupons: state.coupons.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

  removeCoupon: (id) => set((state) => ({ coupons: state.coupons.filter((c) => c.id !== id) })),

  setPolicy: (key, body) => set((state) => ({ policies: { ...state.policies, [key]: body } })),
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

/** Growth keeps the badge; Pro removes it. */
export function useShowsPoweredBy() {
  const planId = useStorefrontStore((s) => s.planId)
  return !getPlan(planId).removeBranding
}

/**
 * A seller on Free can build the whole storefront on trial, but publishing
 * is the paywall — that is the moment the store becomes worth paying for.
 */
export function useTrial() {
  const { planId, trialUsed, trialDaysLeft } = useStorefrontStore()
  const onPaidPlan = getPlan(planId).whiteLabel
  return {
    active: trialUsed && !onPaidPlan,
    available: !trialUsed && !onPaidPlan,
    daysLeft: trialDaysLeft,
    /** Can the seller open the builder at all? */
    canBuild: onPaidPlan || trialUsed,
    /** Publishing always needs a subscription. */
    canPublish: onPaidPlan,
  }
}

/** Which policies still need writing — surfaced before publish. */
export function usePolicyProgress() {
  const policies = useStorefrontStore((s) => s.policies)
  const keys = Object.keys(policies) as PolicyKey[]
  const done = keys.filter((k) => policies[k].trim().length > 0)
  return { done: done.length, total: keys.length, complete: done.length === keys.length }
}

export const CHANNEL_BADGE: Record<SalesChannel, { label: string; short: string }> = {
  marketplace: { label: 'SafalMarketHub', short: 'Marketplace' },
  store: { label: 'Online Store', short: 'Own store' },
  b2b: { label: 'B2B Wholesale', short: 'B2B' },
}

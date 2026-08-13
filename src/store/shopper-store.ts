import { create } from 'zustand'

/* ==========================================================================
   Shopper preferences.

   What the assistant is allowed to do on someone's behalf, and the defaults
   it may reach for. One rule is deliberately not a setting: the customer
   always confirms the purchase. Everything else can be turned off.
   ========================================================================== */

export type SavedCard = {
  id: string
  brand: 'Visa' | 'Mastercard' | 'Amex'
  last4: string
  expires: string
  isDefault: boolean
}

export type AssistantPermissions = {
  /** Master switch — off means the assistant only searches and recommends. */
  allowShoppingHelp: boolean
  useSavedAddresses: boolean
  useSavedPayments: boolean
  applyBestOffer: boolean
}

export type ShoppingPreferences = {
  defaultAddressLabel: string
  preferredCardId: string | null
  preferredBudget: number | null
  showOffersFirst: boolean
  notifyPriceDrops: boolean
  notifyUpcomingSales: boolean
}

type ShopperState = {
  permissions: AssistantPermissions
  preferences: ShoppingPreferences
  cards: SavedCard[]
  /** Offers the shopper explicitly kept, and ones they've already used. */
  savedOfferIds: string[]
  usedOfferIds: string[]
  remindedOfferIds: string[]
  /** Feedback captured after delivery, keyed by order. */
  feedback: Record<string, OrderFeedback>

  setPermission: (key: keyof AssistantPermissions, value: boolean) => void
  setPreference: <K extends keyof ShoppingPreferences>(key: K, value: ShoppingPreferences[K]) => void
  addCard: (card: Omit<SavedCard, 'id' | 'isDefault'>) => void
  removeCard: (id: string) => void
  setDefaultCard: (id: string) => void
  toggleSavedOffer: (id: string) => void
  markOfferUsed: (id: string) => void
  toggleReminder: (id: string) => void
  saveFeedback: (orderId: string, patch: Partial<OrderFeedback>) => void
}

export type OrderFeedback = {
  productRating?: number
  productIssue?: string
  review?: string
  sellerRating?: number
  sellerTags?: string[]
  deliveryRating?: 'good' | 'poor'
  deliveryIssue?: string
}

export const useShopperStore = create<ShopperState>((set) => ({
  permissions: {
    allowShoppingHelp: true,
    useSavedAddresses: true,
    useSavedPayments: true,
    applyBestOffer: true,
  },
  preferences: {
    defaultAddressLabel: 'Home',
    preferredCardId: 'CARD-1',
    preferredBudget: null,
    showOffersFirst: true,
    notifyPriceDrops: true,
    notifyUpcomingSales: true,
  },
  cards: [{ id: 'CARD-1', brand: 'Visa', last4: '4242', expires: '08/29', isDefault: true }],
  savedOfferIds: ['OF-202'],
  usedOfferIds: ['OF-203'],
  remindedOfferIds: [],
  feedback: {},

  setPermission: (key, value) =>
    set((state) => {
      const permissions = { ...state.permissions, [key]: value }
      // Turning the master switch off withdraws the rest with it, rather than
      // leaving permissions that look active but cannot apply.
      if (key === 'allowShoppingHelp' && !value) {
        permissions.useSavedAddresses = false
        permissions.useSavedPayments = false
        permissions.applyBestOffer = false
      }
      return { permissions }
    }),

  setPreference: (key, value) => set((state) => ({ preferences: { ...state.preferences, [key]: value } })),

  addCard: (card) =>
    set((state) => ({
      cards: [...state.cards, { ...card, id: `CARD-${state.cards.length + 1}`, isDefault: state.cards.length === 0 }],
    })),

  removeCard: (id) =>
    set((state) => {
      const cards = state.cards.filter((c) => c.id !== id)
      // Never leave the wallet without a default while cards remain.
      if (cards.length && !cards.some((c) => c.isDefault)) cards[0] = { ...cards[0], isDefault: true }
      return {
        cards,
        preferences:
          state.preferences.preferredCardId === id
            ? { ...state.preferences, preferredCardId: cards[0]?.id ?? null }
            : state.preferences,
      }
    }),

  setDefaultCard: (id) =>
    set((state) => ({ cards: state.cards.map((c) => ({ ...c, isDefault: c.id === id })) })),

  toggleSavedOffer: (id) =>
    set((state) => ({
      savedOfferIds: state.savedOfferIds.includes(id)
        ? state.savedOfferIds.filter((o) => o !== id)
        : [...state.savedOfferIds, id],
    })),

  markOfferUsed: (id) =>
    set((state) => ({ usedOfferIds: state.usedOfferIds.includes(id) ? state.usedOfferIds : [...state.usedOfferIds, id] })),

  toggleReminder: (id) =>
    set((state) => ({
      remindedOfferIds: state.remindedOfferIds.includes(id)
        ? state.remindedOfferIds.filter((o) => o !== id)
        : [...state.remindedOfferIds, id],
    })),

  saveFeedback: (orderId, patch) =>
    set((state) => ({ feedback: { ...state.feedback, [orderId]: { ...state.feedback[orderId], ...patch } } })),
}))

/** The card the assistant would reach for, honouring the permission switch. */
export function usePreferredCard() {
  const { cards, preferences, permissions } = useShopperStore()
  if (!permissions.useSavedPayments) return null
  return cards.find((c) => c.id === preferences.preferredCardId) ?? cards.find((c) => c.isDefault) ?? null
}

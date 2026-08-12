import { create } from 'zustand'

import { getProduct, SHIPPING_OPTIONS, type Address } from '@/data/shop'
import type { ProductGlyph } from '@/data/catalog'

/* ==========================================================================
   Customer cart + checkout selections.

   Identity is NOT here — it lives in account-store, because one account can be
   a buyer and a seller. The cart survives sign-in (UX rule 6) because it isn't
   behind auth at all.
   ========================================================================== */

export type CartItem = {
  /** productId + variant is the cart line identity. */
  key: string
  productId: string
  name: string
  brand: string
  seller: string
  variant: string
  price: number
  mrp: number
  qty: number
  glyph: ProductGlyph
  tone: 'brand' | 'teal' | 'gold' | 'ink'
  /** Stock at the time of adding — used for the "quantity changed" notice. */
  stock: number
}

type CartState = {
  items: CartItem[]
  wishlist: string[]
  /** Checkout selections kept here so steps can be revisited. */
  addressId: string | null
  newAddress: Address | null
  shippingId: string
  buyNowKey: string | null

  add: (productId: string, variant: string, qty?: number) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  clear: () => void
  buyNow: (productId: string, variant: string) => void
  clearBuyNow: () => void

  toggleWishlist: (productId: string) => void

  setAddressId: (id: string) => void
  saveNewAddress: (address: Address) => void
  setShippingId: (id: string) => void
}

const lineKey = (productId: string, variant: string) => `${productId}::${variant}`

export const useCartStore = create<CartState>((set) => ({
  items: [],
  wishlist: [],
  addressId: null,
  newAddress: null,
  shippingId: SHIPPING_OPTIONS[0].id,
  buyNowKey: null,

  add: (productId, variant, qty = 1) =>
    set((state) => {
      const product = getProduct(productId)
      if (!product) return state
      const key = lineKey(productId, variant)
      const existing = state.items.find((i) => i.key === key)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.key === key ? { ...i, qty: Math.min(i.qty + qty, Math.max(product.stock, 1)) } : i
          ),
        }
      }
      return {
        items: [
          ...state.items,
          {
            key,
            productId,
            name: product.name,
            brand: product.brand,
            seller: product.seller,
            variant,
            price: product.price,
            mrp: product.mrp,
            qty,
            glyph: product.glyph,
            tone: product.tone,
            stock: product.stock,
          },
        ],
      }
    }),

  setQty: (key, qty) =>
    set((state) => ({
      items: state.items.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(qty, i.stock || 1)) } : i)),
    })),

  remove: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
  clear: () => set({ items: [], buyNowKey: null }),

  /** Buy Now keeps the existing cart intact and checks out just this line. */
  buyNow: (productId, variant) =>
    set((state) => {
      const product = getProduct(productId)
      if (!product) return state
      const key = lineKey(productId, variant)
      const already = state.items.some((i) => i.key === key)
      const items = already
        ? state.items
        : [
            ...state.items,
            {
              key,
              productId,
              name: product.name,
              brand: product.brand,
              seller: product.seller,
              variant,
              price: product.price,
              mrp: product.mrp,
              qty: 1,
              glyph: product.glyph,
              tone: product.tone,
              stock: product.stock,
            },
          ]
      return { items, buyNowKey: key }
    }),
  clearBuyNow: () => set({ buyNowKey: null }),

  toggleWishlist: (productId) =>
    set((state) => ({
      wishlist: state.wishlist.includes(productId)
        ? state.wishlist.filter((id) => id !== productId)
        : [...state.wishlist, productId],
    })),

  setAddressId: (id) => set({ addressId: id }),
  saveNewAddress: (address) => set({ newAddress: address, addressId: address.id }),
  setShippingId: (id) => set({ shippingId: id }),
}))

/* ---------------------------------------------------------------- derived -- */

/** Lines being checked out — the whole cart, or just the Buy Now line. */
export function useCheckoutLines() {
  const items = useCartStore((s) => s.items)
  const buyNowKey = useCartStore((s) => s.buyNowKey)
  return buyNowKey ? items.filter((i) => i.key === buyNowKey) : items
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.qty, 0)
}

/** Group lines by seller — customers see one cart, but shipments are per seller. */
export function groupBySeller(items: CartItem[]) {
  const map = new Map<string, CartItem[]>()
  for (const item of items) map.set(item.seller, [...(map.get(item.seller) ?? []), item])
  return [...map.entries()].map(([seller, lines]) => ({ seller, lines }))
}

export function totals(items: CartItem[], shippingId: string) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const mrpTotal = items.reduce((sum, i) => sum + i.mrp * i.qty, 0)
  const discount = mrpTotal - subtotal
  const shipping = items.length === 0 ? 0 : (SHIPPING_OPTIONS.find((o) => o.id === shippingId)?.price ?? 0)
  // Prices are tax inclusive; the tax line is informational only.
  const tax = Math.round(subtotal - subtotal / 1.18)
  return { subtotal, mrpTotal, discount, shipping, tax, total: subtotal + shipping }
}

export function useCartCount() {
  return cartCount(useCartStore((s) => s.items))
}

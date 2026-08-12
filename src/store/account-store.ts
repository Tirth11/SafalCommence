import { create } from 'zustand'

import { useSellerStore } from '@/store/seller-store'

/* ==========================================================================
   One SafalMarketHub account → multiple capabilities.

   The USER is a person (Rahul). The SELLER is an organisation the user belongs
   to (ABC Electronics), not a second login. Adding seller access creates an
   organisation membership — it never creates another user identity, and
   switching between buying and selling never requires signing out.

        ACCOUNT (rahul@gmail.com)
          ├── buyer profile      → cart, orders, addresses, returns, wishlist
          └── memberships[]      → ABC Electronics (Owner) → products, orders,
                                    inventory, settlements
   ========================================================================== */

export type OrgRole = 'Owner' | 'Admin'

export type Membership = {
  /** Organisation id — the seller identity, separate from the user. */
  id: string
  name: string
  role: OrgRole
  /** Mirrors the seller onboarding/approval state for this organisation. */
  status: 'Onboarding' | 'Pending Review' | 'Active' | 'Suspended' | 'Payout Hold'
}

/** 'personal' = shopping context. Anything else is an organisation id. */
export type Context = 'personal' | (string & {})

export type AccountUser = {
  id: string
  firstName: string
  lastName: string
  email: string
}

type AccountState = {
  user: AccountUser | null
  /** Guest checkout: known by email, but no account yet. */
  guest: { firstName: string; email: string } | null
  memberships: Membership[]
  context: Context

  signIn: (user: AccountUser, memberships?: Membership[]) => void
  continueAsGuest: (firstName: string, email: string) => void
  signOut: () => void

  /** Adds seller access to the EXISTING account — no new user identity. */
  createOrganization: (name: string) => Membership
  updateOrganization: (id: string, patch: Partial<Membership>) => void
  switchContext: (context: Context) => void
}

export const useAccountStore = create<AccountState>((set, get) => ({
  // Signed in as a buyer+seller by default so both contexts are reviewable.
  user: { id: 'USR-1', firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@gmail.com' },
  guest: null,
  memberships: [{ id: 'ORG-1', name: 'ABC Electronics', role: 'Owner', status: 'Active' }],
  context: 'personal',

  signIn: (user, memberships = []) => {
    set({ user, guest: null, memberships, context: 'personal' })
    const org = memberships[0]
    useSellerStore.setState({
      ownerName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      ...(org ? { storeName: org.name } : {}),
    })
  },
  continueAsGuest: (firstName, email) => set({ guest: { firstName, email } }),
  signOut: () => set({ user: null, guest: null, memberships: [], context: 'personal' }),

  createOrganization: (name) => {
    const user = get().user
    const org: Membership = {
      id: `ORG-${get().memberships.length + 1}`,
      name,
      role: 'Owner',
      status: 'Onboarding',
    }
    set((state) => ({ memberships: [...state.memberships, org], context: org.id }))
    // Bind the seller workspace to this organisation and this user.
    useSellerStore.setState({
      storeName: name,
      ownerName: user ? `${user.firstName} ${user.lastName}` : '',
      email: user?.email ?? '',
      status: 'Onboarding',
      kyc: 'Not Submitted',
    })
    return org
  },

  updateOrganization: (id, patch) =>
    set((state) => ({ memberships: state.memberships.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),

  switchContext: (context) => {
    set({ context })
    const org = get().memberships.find((m) => m.id === context)
    const user = get().user
    if (org) {
      // Keep the seller workspace pointing at the organisation being operated.
      useSellerStore.setState({
        storeName: org.name,
        ownerName: user ? `${user.firstName} ${user.lastName}` : '',
        email: user?.email ?? '',
      })
    }
  },
}))

/* ---------------------------------------------------------------- derived -- */

export function useIsSignedIn() {
  return useAccountStore((s) => s.user !== null)
}

/** Known to us at all — signed in, or a guest who gave an email at checkout. */
export function useIsKnown() {
  return useAccountStore((s) => s.user !== null || s.guest !== null)
}

export function useDisplayName() {
  return useAccountStore((s) => s.user?.firstName ?? s.guest?.firstName ?? '')
}

export function useIsSeller() {
  return useAccountStore((s) => s.memberships.length > 0)
}

/** The organisation currently being operated, if the context is a seller one. */
export function useActiveOrg() {
  return useAccountStore((s) => s.memberships.find((m) => m.id === s.context) ?? null)
}

/** The organisation to open when the user asks to go to the seller portal. */
export function usePrimaryOrg() {
  return useAccountStore((s) => s.memberships[0] ?? null)
}

/**
 * Where "Start Selling" should go for this visitor:
 *  - not signed in  → register first
 *  - signed in, no organisation → straight into business setup, no re-register
 *  - already a seller → their seller dashboard
 */
export function useStartSellingTarget(): { to: string; label: string } {
  const signedIn = useAccountStore((s) => s.user !== null)
  const memberships = useAccountStore((s) => s.memberships)

  if (!signedIn) return { to: '/register', label: 'Start Selling' }
  if (memberships.length === 0) return { to: '/seller/setup', label: 'Start Selling' }
  return { to: '/seller', label: 'Seller Dashboard' }
}

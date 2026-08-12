# SafalMarketHub

Phase 1 MVP UI for a multi-vendor commerce platform: a **Customer marketplace**, a **Seller Portal** and a **Super Admin Portal**.

**Stack** — Vite + React 19 + TypeScript · Tailwind 4 · shadcn/ui (radix-ui) · TanStack Router + Query · react-hook-form + zod · lucide-react · motion · recharts · sonner · zustand

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
```

## Routes

### Storefront
| Route | Screen |
| --- | --- |
| `/` | Landing — one page for both audiences (see below) |
| `/login` | Sign in · forgot password · reset-link-sent |
| `/register` | Create account · verify email · verified → shop-or-sell choice |

#### One account, multiple capabilities

A single SafalMarketHub account can be a buyer, a seller, or both. The **user** is a person; the **seller** is an organisation they belong to — never a second login.

```
ACCOUNT (rahul@gmail.com)
  ├── buyer profile   → cart, orders, addresses, returns, wishlist
  └── memberships[]   → ABC Electronics (Owner) → products, orders, inventory, settlements
```

- A customer clicking **Start Selling** goes straight to `/seller/setup` — never back through registration. Business details create an *organisation* on the existing account.
- A seller clicking **Shop SafalMarketHub** lands in the marketplace with the same session. Their purchases appear under My Orders; their sales stay in the seller portal.
- A **context switcher** in both shells flips between *Personal · Shopping* and each organisation. Switching never signs anyone out.
- Registration collects name, email and password only. The shop-or-sell cards afterwards are "what next", not an account type.

State lives in `src/store/account-store.ts`. Sign-in returns the user plus their memberships, and the UI derives the landing context from that — there is no portal picker.

| Sign in with | Capabilities | Lands on |
| --- | --- | --- |
| `rahul@gmail.com` | Buyer + Seller (ABC Electronics) | `/seller` |
| `demo@safalmarkethub.com` | Buyer only | `/shop` |
| `admin@safalmarkethub.com` | SafalMarketHub staff | `/admin` |

Any password works. `unverified@example.com` and `suspended@example.com` show those error states; anything else returns invalid credentials.

#### The landing page

Built to serve shoppers and sellers equally, in this order:

1. **Hero** — one statement (*"Shop what you love. Sell what you make."*) with a dual CTA, and the two sides shown side by side: a shopper's product view and a seller's dashboard.
2. **Discover** — category tiles and a swipeable product rail (embla), proving there is something real to buy.
3. **How it works** — an *"I want to shop / I want to sell"* switch that swaps the whole panel, so neither audience reads the other's copy.
4. **Seller story** — a dark editorial band going deeper for businesses, with a sample-seller quote and figures labelled as such.
5. **Trust**, **Pricing**, then a **two-door split** and closing CTA.

Imagery is generated, not stock: `components/marketing/scene.tsx` draws a mesh-gradient ground, a grain layer, the product with a gradient stroke and a contact shadow. To use real photography later, swap `<ProductScene>` for an `<img>` at the same aspect ratio — nothing else changes.

Entrance animations (`components/marketing/reveal.tsx`) animate **position only, never opacity**, so content is never invisible if an animation doesn't run (throttled tab, print, prerender, script error).

### Customer / Buyer (`/shop`, `/cart`, `/checkout`, `/account`)
| Route | Screen |
| --- | --- |
| `/shop` | Marketplace home — hero, categories, featured, new arrivals, trust |
| `/shop/categories` | Category tree, three levels deep |
| `/shop/all` | Listing + search results (`?q=` `?category=` `?sub=` `?brand=` `?price=` `?stock=in` `?sort=`) with filters and sort |
| `/product/$id` | Product detail — gallery, variants, PIN delivery check, tabs, sticky mobile buy bar |
| `/cart` | Multi-seller cart grouped by seller, price details, empty state |
| `/checkout` | `?step=` account → address → shipping → review → payment → processing / success / failed / pending |
| `/account` | Dashboard, orders, order detail + tracking, returns & refunds, addresses, wishlist, profile & security, notifications, support |

Browsing, searching, variant selection and adding to cart all work **without signing in**. Checkout offers guest, sign-in or register, and the cart survives all three.

Delivery is mocked: serviceable PINs are `400001, 400053, 400069, 110024, 560038, 600020, 380015, 700029, 411001`. Oversized items (backpack, dumbbell set) can't reach `400001` or `110024`, which is what triggers the per-item "this item cannot be delivered" state instead of failing the whole checkout. On the payment step a **Mockup — gateway response** control switches between success, failed and pending.

### Seller Portal (`/seller`)
| Route | Screen |
| --- | --- |
| `/seller` | Dashboard — onboarding checklist for new sellers, KPIs + action centre for active sellers |
| `/seller/setup` | Activation wizard: `?step=` welcome → business → kyc → bank → pickup → product → review → done |
| `/seller/products` · `/seller/products/$id` | Catalogue list · 7-step product wizard (`?step=basic…review`) incl. submitted state |
| `/seller/inventory` | Stock table + set/add stock dialog |
| `/seller/orders` · `/seller/orders/$id` | Status tabs · fulfilment: accept → pack checklist → ship (label or manual) → track → delivered → return response |
| `/seller/transactions` · `/seller/settlements` · `/seller/settlements/$id` | Earnings: commission, deductions, settlement lifecycle |
| `/seller/profile` | Store, legal, addresses, bank, verification, public profile |
| `/seller/notifications` · `/seller/support` · `/seller/settings` | Notifications, tickets, account & security |

### Super Admin Portal (`/admin`)
`/admin/login` · `/admin` dashboard · `sellers` + `sellers/$id` + `kyc` · `buyers` · `products` + `products/$id` · `catalogue` · `orders` + `orders/$id` · `payments` · `refunds` · `returns` · `settlements` + `settlements/$id` · `commission` · `support` · `reports` · `audit-logs` · `admin-users` · `settings`

Admin sign-in: `admin@safalmarkethub.com` (success), `inactive@safalmarkethub.com` (inactive account).

## Design system

Tokens live in `src/index.css` — brand "Indigo Ink" (`--brand-*`), warm neutrals (`--ink-*`), gold accent for pricing, teal for verification, plus the shadcn semantic layer (light + dark). Radii 8/12/16, soft low-contrast shadows, Inter Variable.

Shared building blocks:

- `components/ui/*` — shadcn primitives (button, input, form, dialog, select, table, tabs, sheet, switch, …)
- `components/admin/data-table.tsx` — search, filters, sort, selection, bulk actions, page size, pagination, export, empty state
- `components/admin/action-dialog.tsx` — the confirmation gate for sensitive actions; mandatory reason + note, extra fields (payment reference, refund amount)
- `components/admin/status-badge.tsx` — one map for every lifecycle label across all three portals
- `components/admin/primitives.tsx` — page header, panel, definition list, money rows, timeline, empty/error states
- `components/seller/seller-bits.tsx` — stepper, onboarding checklist, document upload card, sticky form actions
- `components/shop/shop-bits.tsx` — product card, price + discount, rating, stock pill, breadcrumbs, price details, quantity stepper
- `store/cart-store.ts` — cart, wishlist, guest/sign-in session and checkout selections (zustand)

## Review helpers (dev only)

A floating **state preview** control appears in development:

- storefront login/register — jump between validation, verification and success states
- seller portal — switch the account between new / mid-onboarding / pending approval / active / KYC changes required / suspended / payout hold (`src/store/seller-store.ts`)

Both are stripped from production builds (`import.meta.env.DEV`).

## Data

All screens read from typed mocks — `src/data/catalog.ts` (marketing storefront), `src/data/shop.ts` (customer catalogue, orders, returns), `src/data/admin.ts` (platform), `src/data/seller.ts` (single seller). Shapes mirror the intended API so components can be wired to real endpoints without changing props.

Customer-facing data deliberately excludes commission, seller banking and internal sub-order ids — a shopper sees shipments, not the platform's split.

## Not built (later phases)

White-label storefronts, custom domains, multi-warehouse, advanced RBAC, ads, B2B/wholesale, multi-currency, advanced analytics, AI moderation, loyalty/wallet/BNPL, product comparison, live seller chat, gift cards and referrals.

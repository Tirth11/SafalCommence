# SafalHub — UI

Marketplace UI built with **Vite + React 19 + TypeScript**, **Tailwind 4**, **shadcn/ui (radix-ui)**,
**TanStack Router**, **react-hook-form + zod**, **lucide-react**, **motion**, **recharts** and **sonner**.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
```

---

## Brand & design system

Original identity — **"Indigo Ink"**. Deliberately unlike existing marketplaces: no orange, no
primary blue, no commerce-green.

| Token group | Purpose |
| --- | --- |
| `brand-50…950` | Primary indigo (`brand-600` = `#543bcb`) |
| `ink-50…950` | Slightly warm neutrals |
| `gold-*` | Pricing, discount, ratings, "needs attention" |
| `teal-*` | Verified / secure / success |

Everything else follows the shadcn token contract (`--background`, `--primary`, `--muted`, …) in
[`src/index.css`](src/index.css), including a full dark theme. Radii are 8 / 12 / 16 / 22 px,
shadows are soft and low-contrast, body text never drops below 16 px on mobile.

Product imagery is **generated** (duotone field + line-art glyph, see
[`product-thumb.tsx`](src/components/commerce/product-thumb.tsx)) — no stock photography anywhere.

---

## Routes

### Storefront

| Route | Screen |
| --- | --- |
| `/` | Landing page — hero, marketplace preview, seller value, how it works, buyer value, dashboard preview, trust, pricing, final CTA, footer |
| `/login` | Sign in · forgot password · reset-link-sent |
| `/register` | Create account · verify email · verified → shop-or-sell choice |
| `/seller/onboarding` | Seller onboarding step 1 of 5 (business/KYC starts **here**, never at registration) |

Registration collects name, email and password only. Business and KYC details are requested only
after the user chooses **Start Selling** — one account can later both buy and sell.

### Super Admin portal

| Route | Screen |
| --- | --- |
| `/admin/login` | Staff sign-in (no social login, no self-signup) |
| `/admin` | Platform dashboard — KPIs, queues, 4 charts, "Requires your attention", recent activity |
| `/admin/sellers` | Seller list; `?status=` drives Pending / Active / Suspended / Payout Hold |
| `/admin/sellers/$sellerId` | Seller detail — Overview, Business, KYC, Banking, Products, Orders, Payments, Settlements, Activity + approve / request changes / reject / suspend / reactivate / payout hold |
| `/admin/kyc` | KYC review queue |
| `/admin/buyers` | Buyer list + profile, addresses, orders, refunds, returns, suspend/reactivate |
| `/admin/products` | Product list; `?status=In Review` is the moderation queue (with safe bulk approve) |
| `/admin/products/$productId` | Product review — images, information, variants, pricing/tax, seller + approve / request changes / reject / disable |
| `/admin/catalogue` | Categories tree and brand registry (`?tab=brands`) |
| `/admin/orders` | Order list across all sellers |
| `/admin/orders/$orderId` | Parent order + one card per seller sub-order, financial breakdown, payment, address, timeline, cancel/refund |
| `/admin/returns` | Return requests and lifecycle |
| `/admin/payments` | Transactions; `?status=Failed` shows failure reasons and gateway messages |
| `/admin/refunds` | Refund queue + review with approve / modify amount / reject |
| `/admin/settlements` | Settlement list by status |
| `/admin/settlements/$settlementId` | Calculation, payout account, lifecycle, hold / mark-as-paid |
| `/admin/commission` | Default commission, override rules, calculator |
| `/admin/support` | Tickets, customer reply, internal notes |
| `/admin/reports` | Sales, seller, product, commission, settlement, refund exports |
| `/admin/audit-logs` | Append-only trail: actor, action, target, old → new, reason, IP |
| `/admin/admin-users` | Staff accounts + Phase 1 permission matrix |
| `/admin/settings` | General, Seller, Orders, Payments, Settlement, Shipping, Marketplace, Homepage |

Sign in at `/admin/login` with `admin@safalhub.com` (any password). `inactive@safalhub.com`
returns the inactive-account error; anything else returns incorrect credentials.

---

## Admin patterns worth reusing

- **[`data-table.tsx`](src/components/admin/data-table.tsx)** — one list surface for every module:
  search, filter chips, sorting, selection + bulk actions, page size (10/25/50/100), pagination,
  export and empty state.
- **[`action-dialog.tsx`](src/components/admin/action-dialog.tsx)** — every sensitive action funnels
  through one confirmation dialog that names the record and the amount, and enforces a **mandatory
  reason** (plus extra fields, e.g. payment date + bank reference when marking a settlement paid).
- **[`status-badge.tsx`](src/components/admin/status-badge.tsx)** — single map from every lifecycle
  label to a tone, so "Pending Review" reads identically in the list, the queue and the audit log.
- **[`global-search.tsx`](src/components/admin/global-search.tsx)** — ⌘K lookup across sellers,
  buyers, orders, products, payments and settlements; an order id jumps straight to the order.

Sensitive-data rules are enforced in the UI: bank accounts are masked (`XXXX1234`), card numbers /
CVV / gateway credentials are never rendered, and a failed payment cannot be flipped to successful
from the portal — only gateway reconciliation can change it.

---

## Data

All screens read from mock modules that mirror the intended API shapes:
[`src/data/catalog.ts`](src/data/catalog.ts) (storefront) and
[`src/data/admin.ts`](src/data/admin.ts) (platform). Swap these for API calls — TanStack Query is
already wired in [`main.tsx`](src/main.tsx) — without changing component contracts.

The floating **state preview** control on `/login`, `/register` and `/admin/login` is
development-only (`import.meta.env.DEV`); it exists so reviewers can jump between screen states
without a backend. Remove [`state-preview.tsx`](src/components/dev/state-preview.tsx) once auth is
real.

## Not built yet

Commercial numbers on the landing **Pricing** section (commission rates, settlement cycle) are
placeholders for the commercial team to confirm. Seller onboarding steps 2–5, the seller dashboard
itself (only previewed on the landing page), and role-gated rendering for Operations Admin (the
matrix is documented and displayed, but the UI currently renders as Super Admin) are out of scope
for this pass.

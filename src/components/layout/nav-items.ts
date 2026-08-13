/**
 * One nav definition for every customer-facing header.
 *
 * The landing page and the shop shell used to declare their own lists, so the
 * bar moved and relabelled itself as you walked between them. Both import
 * this now, which is the only way the two stay aligned.
 */
export type NavItem = { label: string; to: string; search?: Record<string, string>; hash?: string }

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop/all' },
  { label: 'Categories', to: '/shop/categories' },
  { label: 'Offers', to: '/shop/all', search: { sort: 'price-asc' } },
  // Scrolls to the contact section on the landing page rather than
  // navigating away — the answer is already on the page they are reading.
  { label: 'Contact Us', to: '/', hash: 'contact' },
]

/** Shared geometry so the two bars line up pixel for pixel. */
export const NAV_LINK_CLASS =
  'flex h-10 items-center rounded-md px-3 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-950 dark:text-ink-300 dark:hover:bg-secondary dark:hover:text-white'

export const HEADER_BAR_CLASS = 'container-wide flex h-18 items-center gap-4'

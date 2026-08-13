import { AdminLink } from '@/components/admin/admin-link'
import { InstagramMark, LinkedInMark, XMark } from '@/components/brand/social-icons'
import { Logo } from '@/components/brand/logo'

/** Every link here resolves to a real page — see routes/pages.tsx. */
const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'Marketplace', to: '/shop' },
      { label: 'Categories', to: '/shop/categories' },
      { label: 'Offers', to: '/shop/all', search: { sort: 'price-asc' } },
      { label: 'Wishlist', to: '/account/wishlist' },
    ],
  },
  {
    title: 'Sell',
    links: [
      { label: 'Become a Seller', to: '/register' },
      { label: 'Seller Login', to: '/login' },
      { label: 'Pricing', to: '/pricing' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Centre', to: '/help' },
      { label: 'Contact Us', to: '/contact' },
      { label: 'Track an Order', to: '/account/orders' },
      { label: 'Returns & Refunds', to: '/returns' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms & Conditions', to: '/terms' },
    ],
  },
]

const SOCIAL = [
  { label: 'SafalMarketHub on X', Icon: XMark },
  { label: 'SafalMarketHub on LinkedIn', Icon: LinkedInMark },
  { label: 'SafalMarketHub on Instagram', Icon: InstagramMark },
]

export function SiteFooter() {
  return (
    <footer className="bg-ink-950 pb-8 pt-16 text-ink-400 md:pt-18">
      <div className="container-page">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.6fr_repeat(4,1fr)] lg:gap-8">
          <div className="lg:pr-8">
            <Logo onInk />
            <p className="mt-4 max-w-[320px] text-sm leading-relaxed">
              A modern platform connecting businesses and customers through simple digital commerce.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-ink-300">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <AdminLink to={link.to} search={link.search} className="text-sm transition-colors hover:text-white">
                      {link.label}
                    </AdminLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-5 border-t border-white/10 pt-6 text-sm sm:flex-row sm:items-center">
          <p>Copyright © SafalVir, Inc. 2026. All rights reserved.</p>
          <ul className="flex gap-1">
            {SOCIAL.map(({ label, Icon }) => (
              <li key={label}>
                <a
                  href="/#"
                  aria-label={label}
                  className="grid size-9 place-items-center rounded-sm text-ink-400 transition-colors hover:bg-white/8 hover:text-white"
                >
                  <Icon className="size-[18px]" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}

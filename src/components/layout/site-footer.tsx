import { Link } from '@tanstack/react-router'
import { InstagramMark, LinkedInMark, XMark } from '@/components/brand/social-icons'
import { Logo } from '@/components/brand/logo'

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'Marketplace', to: '/#marketplace' },
      { label: 'Categories', to: '/#categories' },
      { label: 'New Products', to: '/#marketplace' },
    ],
  },
  {
    title: 'Sell',
    links: [
      { label: 'Start Selling', to: '/register' },
      { label: 'Seller Login', to: '/login' },
      { label: 'How It Works', to: '/#how-it-works' },
      { label: 'Pricing', to: '/#pricing' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Centre', to: '/#' },
      { label: 'Contact Us', to: '/#' },
      { label: 'Returns & Refunds', to: '/#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/#' },
      { label: 'Privacy Policy', to: '/#' },
      { label: 'Terms & Conditions', to: '/#' },
    ],
  },
]

const SOCIAL = [
  { label: 'SafalHub on X', Icon: XMark },
  { label: 'SafalHub on LinkedIn', Icon: LinkedInMark },
  { label: 'SafalHub on Instagram', Icon: InstagramMark },
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
                    {link.to.startsWith('/#') ? (
                      <a href={link.to} className="text-sm transition-colors hover:text-white">
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.to} className="text-sm transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-5 border-t border-white/10 pt-6 text-sm sm:flex-row sm:items-center">
          <p>© 2026 SafalHub. All rights reserved.</p>
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

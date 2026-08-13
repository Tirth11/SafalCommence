import { Link } from '@tanstack/react-router'
import { Clock, Mail, MapPin, MessageCircle, Phone, RotateCcw, ShieldCheck, Truck } from 'lucide-react'

import { AdminLink } from '@/components/admin/admin-link'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { Pricing } from '@/components/marketing/pricing'
import { AssistantProvider } from '@/components/shop/assistant'
import { Button } from '@/components/ui/button'

/* ==========================================================================
   The pages the header and footer link to.

   Every link in the chrome now resolves to something real — a dead "/#" in a
   footer reads as an unfinished product, and there were seven of them.
   ========================================================================== */

/** Shared chrome so each page keeps the header, the assistant and the footer. */
function Page({ children }: { children: React.ReactNode }) {
  return (
    <AssistantProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-sm focus:bg-brand-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </AssistantProvider>
  )
}

function PageHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <header className="border-b bg-muted/40 py-14 dark:bg-card/30">
      <div className="container-wide">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">{eyebrow}</p>
        <h1 className="mt-3 max-w-[720px] text-[34px] leading-[1.08] tracking-[-0.03em] sm:text-[46px]">{title}</h1>
        <p className="mt-4 max-w-[620px] text-[17px] leading-relaxed text-ink-600 dark:text-ink-300">{sub}</p>
      </div>
    </header>
  )
}

/* ---------------------------------------------------------------- pricing -- */
export function PricingPage() {
  return (
    <Page>
      <PageHead
        eyebrow="Seller pricing"
        title="Simple pricing for people who sell."
        sub="Shopping on SafalMarketHub is free. These plans are for businesses selling here — start free on the marketplace and subscribe when you want your own storefront."
      />
      <Pricing />
    </Page>
  )
}

/* ---------------------------------------------------------------- contact -- */
const CONTACT_METHODS = [
  { icon: MessageCircle, label: 'Chat with us', value: 'Fastest — replies in a few minutes', action: 'Start a chat', to: '/account/support' },
  { icon: Mail, label: 'Email', value: 'help@safalmarkethub.com', action: 'Send an email', to: '/account/support' },
  { icon: Phone, label: 'Phone', value: '+1 (415) 555-0142', action: 'Call support', to: '/account/support' },
]

export function ContactPage() {
  return (
    <Page>
      <PageHead
        eyebrow="Contact us"
        title="Talk to a person."
        sub="Questions about an order, a return or selling on SafalMarketHub — here is how to reach us."
      />

      <section className="container-wide py-14">
        <ul className="grid gap-4 lg:grid-cols-3">
          {CONTACT_METHODS.map((method) => (
            <li key={method.label} className="rounded-2xl border bg-card p-6 shadow-xs">
              <span className="grid size-10 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                <method.icon className="size-5" />
              </span>
              <p className="mt-4 text-[16px] font-semibold text-ink-900 dark:text-white">{method.label}</p>
              <p className="mt-1 text-[14px] text-ink-600 dark:text-ink-300">{method.value}</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <AdminLink to={method.to}>{method.action}</AdminLink>
              </Button>
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6 shadow-xs">
            <h2 className="flex items-center gap-2.5 text-[17px]">
              <Clock className="size-4.5 text-ink-400" />
              When we're around
            </h2>
            <dl className="mt-4 divide-y text-[14px]">
              {[
                ['Monday – Friday', '9:00 – 20:00'],
                ['Saturday', '10:00 – 18:00'],
                ['Sunday', 'Closed — email still gets a reply'],
              ].map(([day, hours]) => (
                <div key={day} className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0">
                  <dt className="text-ink-600 dark:text-ink-300">{day}</dt>
                  <dd className="font-semibold tabular text-ink-900 dark:text-white">{hours}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-xs">
            <h2 className="flex items-center gap-2.5 text-[17px]">
              <MapPin className="size-4.5 text-ink-400" />
              Registered office
            </h2>
            <address className="mt-4 text-[14px] not-italic leading-relaxed text-ink-600 dark:text-ink-300">
              SafalVir, Inc.
              <br />
              2261 Market Street, Suite 5320
              <br />
              San Francisco, CA 94114
              <br />
              United States
            </address>
            <p className="mt-4 border-t pt-4 text-[13px] text-ink-500">
              Selling enquiries: <span className="font-semibold text-ink-800 dark:text-ink-100">sellers@safalmarkethub.com</span>
            </p>
          </div>
        </div>
      </section>
    </Page>
  )
}

/* ------------------------------------------------------------------- help -- */
const FAQS = [
  {
    q: 'Where is my order?',
    a: 'Open My Orders and pick the order — every shipment shows its courier, tracking number and expected date. Orders with items from different sellers arrive separately.',
  },
  {
    q: 'How do returns work?',
    a: 'Most items can be returned within 7 days of delivery. Raise the request from the order, and we arrange a pickup. The refund reaches your original payment method 5–7 business days after the item passes inspection.',
  },
  {
    q: 'When am I charged?',
    a: 'At checkout. If an order fails or is cancelled before dispatch, the amount is released back to your payment method automatically.',
  },
  {
    q: 'Do I need an account to buy?',
    a: 'No. You can check out as a guest and still track the order by email. Creating an account keeps your addresses, orders and wishlist together.',
  },
  {
    q: 'How do I start selling?',
    a: 'Use the same account you shop with — Become a seller adds a business to it. You never need a second login, and you can switch between shopping and selling at any time.',
  },
]

export function HelpPage() {
  return (
    <Page>
      <PageHead
        eyebrow="Help centre"
        title="Questions we get most."
        sub="If none of these covers it, contact us — a person will read it."
      />

      <section className="container-wide py-14">
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            { icon: Truck, label: 'Track an order', to: '/account/orders' },
            { icon: RotateCcw, label: 'Start a return', to: '/account/returns' },
            { icon: ShieldCheck, label: 'Payment help', to: '/account/support' },
            { icon: MessageCircle, label: 'Contact us', to: '/contact' },
          ].map((item) => (
            <AdminLink
              key={item.label}
              to={item.to}
              className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-xs transition-[transform,border-color] hover:-translate-y-0.5 hover:border-brand-200"
            >
              <item.icon className="size-5 shrink-0 text-brand-600 dark:text-brand-300" />
              <span className="text-[14px] font-semibold text-ink-900 dark:text-white">{item.label}</span>
            </AdminLink>
          ))}
        </div>

        <ul className="mt-10 grid gap-3">
          {FAQS.map((faq) => (
            <li key={faq.q}>
              <details className="group rounded-2xl border bg-card p-5 shadow-xs">
                <summary className="cursor-pointer list-none text-[16px] font-semibold text-ink-900 marker:hidden dark:text-white">
                  {faq.q}
                </summary>
                <p className="mt-3 max-w-[720px] text-[14px] leading-relaxed text-ink-600 dark:text-ink-300">{faq.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </Page>
  )
}

/* ------------------------------------------------------------------ about -- */
export function AboutPage() {
  return (
    <Page>
      <PageHead
        eyebrow="About"
        title="A marketplace that helps you decide."
        sub="SafalMarketHub is built by SafalVir, Inc. We connect small businesses with customers, and we try to make choosing as easy as buying."
      />

      <section className="container-wide py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="max-w-[640px] space-y-5 text-[16px] leading-relaxed text-ink-600 dark:text-ink-300">
            <p>
              Most marketplaces are search boxes attached to a warehouse. That works when you know exactly what you
              want, and fails the rest of the time — which is most of the time.
            </p>
            <p>
              So SafalMarketHub gives you three ways in. Type what you need. Show us a photo of something you saw.
              Or answer two questions and let us narrow it down. Whichever you pick, you get a short list with a plain
              reason next to each option, not forty results sorted by who paid the most.
            </p>
            <p>
              For the businesses selling here, the same idea applies. Start free on the marketplace, and when you are
              ready for your own branded storefront, it takes an afternoon rather than a web agency.
            </p>
          </div>

          <dl className="grid content-start gap-4">
            {[
              ['485', 'Verified sellers'],
              ['12,450', 'Products listed'],
              ['18,560', 'Registered shoppers'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border bg-card p-5 shadow-xs">
                <dt className="text-[28px] font-bold leading-none tabular text-ink-950 dark:text-white">{value}</dt>
                <dd className="mt-2 text-[13px] text-ink-500">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </Page>
  )
}

/* ----------------------------------------------------------------- legal --- */
const LEGAL: Record<string, { eyebrow: string; title: string; sub: string; sections: { heading: string; body: string }[] }> = {
  privacy: {
    eyebrow: 'Privacy',
    title: 'What we collect, and why.',
    sub: 'The short version: only what an order needs, and we never sell it.',
    sections: [
      { heading: 'What we collect', body: 'Your name, contact details and delivery address, plus the orders you place. If you use photo search, the image is processed to find similar products and is not kept afterwards.' },
      { heading: 'Payments', body: 'Card and bank details are handled by our payment provider. SafalMarketHub never sees or stores your full card number.' },
      { heading: 'What sellers see', body: 'A seller receives only what they need to fulfil your order — your name, delivery address and a masked phone number.' },
      { heading: 'Your choices', body: 'You can download or delete your account data at any time from Profile. Deleting an account removes personal data but keeps the invoice records tax law requires us to hold.' },
    ],
  },
  terms: {
    eyebrow: 'Terms',
    title: 'Terms & conditions.',
    sub: 'The ground rules for buying and selling on SafalMarketHub.',
    sections: [
      { heading: 'Using SafalMarketHub', body: 'You agree that the details you give us are accurate, and that products bought here are for lawful use. Accounts are personal; a business account may add staff members.' },
      { heading: 'Orders and pricing', body: 'An order is an offer to buy. Prices and availability can change until the order is confirmed. If we get a price obviously wrong, we will cancel and refund rather than hold you to it.' },
      { heading: 'Sellers', body: 'Sellers are independent businesses responsible for their products, descriptions and dispatch times. SafalMarketHub verifies sellers before they go live and can suspend any that break these terms.' },
      { heading: 'Liability', body: 'We are responsible for the service we provide. We are not liable for indirect losses, and nothing here limits rights you have under consumer law.' },
    ],
  },
  returns: {
    eyebrow: 'Returns',
    title: 'Returns & refunds.',
    sub: 'Seven days on most items, and one place to ask about any of it.',
    sections: [
      { heading: 'The window', body: 'Most products can be returned within 7 days of delivery, unused and in their original packaging. Some categories — innerwear, opened beauty products, perishables — cannot be returned for hygiene reasons, and this is stated on the product page before you buy.' },
      { heading: 'How to start one', body: 'Open the order, choose Return, and pick a reason. We schedule a pickup at your address, usually within two business days.' },
      { heading: 'When the money arrives', body: 'Once the returned item passes inspection, the refund is issued to your original payment method and takes 5–7 business days to appear.' },
      { heading: 'Damaged or wrong items', body: 'Tell us within 48 hours of delivery and we will arrange a replacement or a full refund, including any delivery charge you paid.' },
    ],
  },
}

export function LegalPage({ kind }: { kind: 'privacy' | 'terms' | 'returns' }) {
  const page = LEGAL[kind]

  return (
    <Page>
      <PageHead eyebrow={page.eyebrow} title={page.title} sub={page.sub} />

      <section className="container-wide py-14">
        <div className="max-w-[720px]">
          {page.sections.map((section) => (
            <section key={section.heading} className="border-b py-6 first:pt-0 last:border-0">
              <h2 className="text-[18px] tracking-[-0.01em]">{section.heading}</h2>
              <p className="mt-2.5 text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">{section.body}</p>
            </section>
          ))}

          <p className="mt-8 text-[13px] text-ink-500">
            Last updated 12 August 2026. Questions?{' '}
            <Link to="/contact" className="font-semibold text-brand-600 underline dark:text-brand-300">
              Contact us
            </Link>
            .
          </p>
        </div>
      </section>
    </Page>
  )
}

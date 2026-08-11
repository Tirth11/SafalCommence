import { Link } from '@tanstack/react-router'
import { Package, ShoppingBag, Store, Wallet } from 'lucide-react'

import { Section, SectionHead } from '@/components/marketing/section'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CARDS = [
  {
    icon: Store,
    tone: 'brand',
    title: 'Create Your Business',
    body: 'Register your business and complete seller onboarding.',
  },
  {
    icon: Package,
    tone: 'teal',
    title: 'List Your Products',
    body: 'Add products, variants, pricing and available inventory.',
  },
  {
    icon: ShoppingBag,
    tone: 'gold',
    title: 'Receive Orders',
    body: 'Manage customer orders and fulfilment from your dashboard.',
  },
  {
    icon: Wallet,
    tone: 'ink',
    title: 'Track Your Earnings',
    body: 'View transactions, commissions and seller settlements.',
  },
] as const

const TONES = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-200',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-600/15 dark:text-teal-100',
  gold: 'bg-gold-50 text-gold-600 dark:bg-gold-600/15 dark:text-gold-400',
  ink: 'bg-ink-100 text-ink-700 dark:bg-secondary dark:text-ink-200',
}

export function SellerValue() {
  return (
    <Section id="sellers" tone="muted" className="border-y">
      <div className="container-page">
        <SectionHead
          eyebrow="For sellers"
          title="Everything you need to start selling"
          sub="Create your seller account, add products, manage inventory, receive orders and track your earnings from one simple dashboard."
        />

        {/* Horizontally scrollable on mobile, grid from sm up */}
        <div className="-mx-5 mt-12 overflow-x-auto px-5 pb-2 no-scrollbar sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
          <div className="grid min-w-max grid-flow-col auto-cols-[76%] gap-4 sm:min-w-0 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {CARDS.map(({ icon: Icon, tone, title, body }) => (
              <div
                key={title}
                className="rounded-lg border bg-card p-6 shadow-xs transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className={cn('grid size-12 place-items-center rounded-md', TONES[tone])}>
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-lg">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link to="/register">Start Selling Today</Link>
          </Button>
        </div>
      </div>
    </Section>
  )
}

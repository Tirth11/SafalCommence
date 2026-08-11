import { motion } from 'motion/react'
import { Boxes, IndianRupee, Package, ShoppingBag } from 'lucide-react'

import { Logo } from '@/components/brand/logo'

const CARDS = [
  { icon: ShoppingBag, label: 'Orders', value: '124', note: 'This month' },
  { icon: Package, label: 'Products', value: '128', note: 'Live listings' },
  { icon: IndianRupee, label: 'Payments', value: '₹84,250', note: 'Received' },
  { icon: Boxes, label: 'Shopping Bag', value: '2 items', note: 'Ready to checkout' },
]

/**
 * Left panel for the auth split-screen. Deliberately calm: one headline,
 * one paragraph and four quiet cards — no busy dashboard chrome.
 */
export function AuthBrandPanel({
  title = 'Welcome back',
  body = 'Manage your business or continue shopping with your SafalHub account.',
}: {
  title?: string
  body?: string
}) {
  return (
    <div className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:w-[45%] lg:shrink-0 lg:flex-col">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-160 from-brand-800/50 via-transparent to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-24 size-[440px] rounded-full bg-brand-600/20 blur-3xl" />

      <div className="relative flex h-full flex-col p-10 xl:p-14">
        <Logo onInk />

        <div className="mt-auto pt-16">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-[420px] text-4xl text-white xl:text-[42px]"
          >
            {title}
          </motion.h2>
          <p className="mt-4 max-w-[400px] text-[15px] leading-relaxed text-ink-300">{body}</p>

          <div className="mt-10 grid max-w-[440px] grid-cols-2 gap-3">
            {CARDS.map(({ icon: Icon, label, value, note }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                className="rounded-md border border-white/10 bg-white/6 p-4 backdrop-blur-sm"
              >
                <Icon className="size-[18px] text-brand-300" />
                <p className="mt-3 text-[17px] font-bold leading-none text-white tabular">{value}</p>
                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">{label}</p>
                <p className="mt-0.5 text-[11px] text-ink-400">{note}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="mt-auto pt-12 text-xs text-ink-500">© 2026 SafalHub</p>
      </div>
    </div>
  )
}

import { motion } from 'motion/react'
import { ArrowUpRight, Bell, Boxes, IndianRupee, Package, ShoppingBag, TrendingUp } from 'lucide-react'

import { ProductThumb } from '@/components/commerce/product-thumb'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const },
})

/**
 * Hero composition — a seller's working surface, not a stock photo.
 * Communicates "shop here" + "sell here" in one glance.
 */
export function HeroCollage() {
  return (
    <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
      {/* soft brand glow behind the stack */}
      <div
        aria-hidden="true"
        className="absolute -inset-8 -z-10 rounded-[40px] bg-linear-160 from-brand-100/70 via-brand-50/40 to-transparent blur-2xl dark:from-brand-900/40 dark:via-brand-950/30"
      />

      {/* Main panel — seller dashboard summary */}
      <motion.div
        {...rise(0.05)}
        className="rounded-xl border bg-card p-5 shadow-xl sm:p-6"
        role="img"
        aria-label="Seller dashboard preview showing sales, orders and growth for the current month"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-brand-50 text-brand-600 dark:bg-brand-950">
              <ShoppingBag className="size-[19px]" />
            </span>
            <div>
              <p className="text-[13px] font-semibold leading-tight text-ink-900 dark:text-white">ABC Electronics</p>
              <p className="text-[11px] text-ink-500">Seller dashboard</p>
            </div>
          </div>
          <Badge variant="success" className="gap-1">
            <span className="size-1.5 rounded-full bg-teal-500" />
            Active
          </Badge>
        </div>

        <div className="mt-5 rounded-lg border bg-muted/60 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-400">Sales this month</p>
          <div className="mt-1.5 flex items-end justify-between gap-3">
            <p className="text-[32px] font-bold leading-none tracking-[-0.03em] text-ink-950 tabular dark:text-white">
              ₹84,250
            </p>
            <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-600 dark:bg-teal-600/15 dark:text-teal-100">
              <TrendingUp className="size-3.5" />
              +18.4%
            </span>
          </div>
          <Sparkline className="mt-4" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <MiniStat icon={ShoppingBag} label="Orders" value="124" />
          <MiniStat icon={Package} label="Products" value="128" />
          <MiniStat icon={IndianRupee} label="Payouts" value="₹42.9k" />
        </div>
      </motion.div>

      {/* Floating: product listing card */}
      <motion.div
        {...rise(0.22)}
        className="absolute -bottom-[68px] -left-3 w-[206px] rounded-lg border bg-card p-3 shadow-lg sm:-left-6 sm:w-[224px]"
      >
        <div className="flex items-center gap-3">
          <ProductThumb glyph="headphones" tone="brand" className="aspect-square size-14 shrink-0 rounded-sm" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-ink-900 dark:text-white">Wireless Headphones</p>
            <p className="text-sm font-bold text-ink-950 tabular dark:text-white">₹4,999</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-100">
              <Boxes className="size-3" />
              42 in stock
            </p>
          </div>
        </div>
      </motion.div>

      {/* Floating: new order notification */}
      <motion.div
        {...rise(0.36)}
        className="absolute -top-11 right-2 w-[212px] rounded-lg border bg-card p-3.5 shadow-lg sm:right-4"
      >
        <div className="flex items-start gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
            <Bell className="size-4" />
          </span>
          <div>
            <p className="text-[13px] font-semibold leading-tight text-ink-900 dark:text-white">New Order Received</p>
            <p className="mt-0.5 text-[11px] text-ink-500 tabular">Order #SH-10482</p>
          </div>
        </div>
      </motion.div>

      {/* Floating: growth chip */}
      <motion.div
        {...rise(0.5)}
        className="absolute -bottom-5 right-4 inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 shadow-lg sm:right-8"
      >
        <ArrowUpRight className="size-4 text-teal-600 dark:text-teal-100" />
        <span className="text-[13px] font-bold text-ink-900 tabular dark:text-white">+18.4%</span>
        <span className="text-[11px] text-ink-500">growth</span>
      </motion.div>
    </div>
  )
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof ShoppingBag; label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <Icon className="size-4 text-ink-400" />
      <p className="mt-2 text-[15px] font-bold leading-none text-ink-950 tabular dark:text-white">{value}</p>
      <p className="mt-1 text-[11px] text-ink-500">{label}</p>
    </div>
  )
}

function Sparkline({ className }: { className?: string }) {
  const points = '0,34 14,29 28,31 42,22 56,25 70,15 84,18 98,8 112,11 126,4'
  return (
    <svg viewBox="0 0 126 40" className={cn('h-11 w-full', className)} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand-600)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--brand-600)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${points} 126,40 0,40`} fill="url(#spark)" />
      <motion.polyline
        points={points}
        fill="none"
        stroke="var(--brand-600)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, delay: 0.35, ease: 'easeOut' }}
      />
    </svg>
  )
}

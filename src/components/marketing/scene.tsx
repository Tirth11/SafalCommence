import { useId } from 'react'

import { cn } from '@/lib/utils'
import type { ProductGlyph } from '@/data/catalog'

/* ==========================================================================
   Generated product imagery.

   The brief rules out generic stock photography, so these scenes are drawn:
   a soft mesh-gradient ground, a grain layer for depth, the product rendered
   large with a gradient stroke, and a contact shadow underneath. The result
   reads like a styled product shot rather than a flat icon.

   To swap in real photography later, replace <ProductScene> with an <img>
   using the same aspect ratio and rounding — nothing else needs to change.
   ========================================================================== */

export type SceneTone = 'brand' | 'teal' | 'gold' | 'ink' | 'blush'

const TONES: Record<SceneTone, { from: string; via: string; to: string; ink: string; glow: string }> = {
  brand: { from: '#EDE9FE', via: '#F5F3FF', to: '#FFFFFF', ink: '#4A32B8', glow: '#8570EC' },
  teal: { from: '#DCF2EF', via: '#EFFAF8', to: '#FFFFFF', ink: '#0F6A65', glow: '#3FBFAF' },
  gold: { from: '#FDF0DC', via: '#FEF8EE', to: '#FFFFFF', ink: '#A9670F', glow: '#F3B24C' },
  ink: { from: '#E4E7F0', via: '#F3F5F9', to: '#FFFFFF', ink: '#2B3150', glow: '#8E94A8' },
  blush: { from: '#FBE7EC', via: '#FEF4F6', to: '#FFFFFF', ink: '#9E3B52', glow: '#E58BA0' },
}

/** Filled, gradient-stroked product art — heavier and more product-like than the catalogue glyphs. */
const ART: Record<ProductGlyph, (id: string) => React.ReactNode> = {
  headphones: () => (
    <>
      <path d="M26 78V62a38 38 0 0 1 76 0v16" />
      <rect x="12" y="72" width="26" height="42" rx="12" />
      <rect x="90" y="72" width="26" height="42" rx="12" />
      <path d="M25 84h1M103 84h1" strokeLinecap="round" />
    </>
  ),
  watch: () => (
    <>
      <rect x="38" y="38" width="52" height="52" rx="16" />
      <circle cx="64" cy="64" r="17" />
      <path d="M64 54v10l7 5" strokeLinecap="round" />
      <path d="M46 38 48 14h32l2 24M46 90l2 24h32l2-24" />
    </>
  ),
  shirt: () => (
    <>
      <path d="M44 20 64 32l20-12 26 14-9 24-9-4v58H36V54l-9 4-9-24 26-14Z" />
      <path d="M52 24a12 12 0 0 0 24 0" />
    </>
  ),
  lamp: () => (
    <>
      <path d="M38 18h52l18 40H20l18-40Z" />
      <path d="M64 58v34" />
      <path d="M44 112h40l-6-20H50l-6 20Z" />
      <path d="M30 58h68" />
    </>
  ),
  bottle: () => (
    <>
      <path d="M52 14h24v16c0 5 2 9 5 12l4 5c3 4 5 9 5 14v52a5 5 0 0 1-5 5H43a5 5 0 0 1-5-5V61c0-5 2-10 5-14l4-5c3-3 5-7 5-12V14Z" />
      <path d="M38 68h52" />
      <path d="M56 14h16" strokeLinecap="round" />
    </>
  ),
  dumbbell: () => (
    <>
      <rect x="16" y="46" width="16" height="36" rx="5" />
      <rect x="96" y="46" width="16" height="36" rx="5" />
      <rect x="4" y="54" width="12" height="20" rx="4" />
      <rect x="112" y="54" width="12" height="20" rx="4" />
      <path d="M32 64h64" strokeWidth="10" strokeLinecap="round" />
    </>
  ),
  bag: () => (
    <>
      <path d="M28 42h72l6 68a6 6 0 0 1-6 6H28a6 6 0 0 1-6-6l6-68Z" />
      <path d="M46 50V34a18 18 0 0 1 36 0v16" />
      <path d="M40 74h48" />
    </>
  ),
  camera: () => (
    <>
      <rect x="12" y="38" width="104" height="68" rx="12" />
      <circle cx="64" cy="72" r="22" />
      <circle cx="64" cy="72" r="11" />
      <path d="M44 38l7-12h26l7 12" />
    </>
  ),
}

export function ProductScene({
  glyph,
  tone = 'brand',
  className,
  padded = true,
  grain = true,
}: {
  glyph: ProductGlyph
  tone?: SceneTone
  className?: string
  padded?: boolean
  grain?: boolean
}) {
  const id = useId().replace(/:/g, '')
  const t = TONES[tone]

  return (
    <div className={cn('relative isolate overflow-hidden rounded-2xl', className)}>
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-ground`} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor={t.from} />
            <stop offset="55%" stopColor={t.via} />
            <stop offset="100%" stopColor={t.to} />
          </linearGradient>
          <radialGradient id={`${id}-glow`} cx="72%" cy="18%" r="62%">
            <stop offset="0%" stopColor={t.glow} stopOpacity="0.42" />
            <stop offset="100%" stopColor={t.glow} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-glow2`} cx="14%" cy="88%" r="52%">
            <stop offset="0%" stopColor={t.ink} stopOpacity="0.16" />
            <stop offset="100%" stopColor={t.ink} stopOpacity="0" />
          </radialGradient>
          <filter id={`${id}-grain`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        <rect width="400" height="300" fill={`url(#${id}-ground)`} />
        <rect width="400" height="300" fill={`url(#${id}-glow)`} />
        <rect width="400" height="300" fill={`url(#${id}-glow2)`} />
        {grain && <rect width="400" height="300" filter={`url(#${id}-grain)`} opacity="0.045" />}
      </svg>

      {/* Product art with a contact shadow so it sits on the surface */}
      <div className={cn('relative grid h-full w-full place-items-center', padded && 'p-[14%]')}>
        <svg viewBox="0 0 128 128" className="h-full w-full max-h-[78%] max-w-[78%] overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={t.ink} stopOpacity="0.95" />
              <stop offset="100%" stopColor={t.ink} stopOpacity="0.55" />
            </linearGradient>
            <filter id={`${id}-shadow`} x="-40%" y="-40%" width="180%" height="200%">
              <feDropShadow dx="0" dy="7" stdDeviation="7" floodColor={t.ink} floodOpacity="0.16" />
            </filter>
          </defs>
          <ellipse cx="64" cy="122" rx="40" ry="5" fill={t.ink} opacity="0.12" />
          <g
            fill="none"
            stroke={`url(#${id}-stroke)`}
            strokeWidth="4.5"
            strokeLinejoin="round"
            filter={`url(#${id}-shadow)`}
          >
            {ART[glyph](id)}
          </g>
        </svg>
      </div>
    </div>
  )
}

/** Airbnb-style rounded category tile with a label resting on the image. */
export function CategoryTile({
  label,
  meta,
  glyph,
  tone,
  className,
}: {
  label: string
  meta: string
  glyph: ProductGlyph
  tone: SceneTone
  className?: string
}) {
  return (
    <span className={cn('group block', className)}>
      <span className="block overflow-hidden rounded-2xl">
        <ProductScene
          glyph={glyph}
          tone={tone}
          className="aspect-square transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </span>
      <span className="mt-3 block text-[15px] font-semibold text-ink-900 dark:text-white">{label}</span>
      <span className="block text-[13px] text-ink-500">{meta}</span>
    </span>
  )
}

/** Soft ambient wash used behind hero and closing sections. */
export function AmbientWash({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}>
      <div className="absolute -right-32 -top-40 size-[620px] rounded-full bg-brand-100/60 blur-[110px] dark:bg-brand-900/25" />
      <div className="absolute -left-40 top-1/3 size-[520px] rounded-full bg-teal-100/50 blur-[110px] dark:bg-teal-600/10" />
      <div className="absolute bottom-0 right-1/4 size-[420px] rounded-full bg-gold-100/50 blur-[110px] dark:bg-gold-600/10" />
    </div>
  )
}

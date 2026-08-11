import type { ProductGlyph } from '@/data/catalog'
import { cn } from '@/lib/utils'

/**
 * Generated product imagery — deliberately no stock photography.
 * Soft duotone field + line-art glyph, so the marketplace reads as
 * "real catalogue" without shipping fake photos.
 */
const TONES = {
  brand: 'from-brand-100 to-brand-50 text-brand-700 dark:from-brand-900 dark:to-brand-950 dark:text-brand-200',
  teal: 'from-teal-100 to-teal-50 text-teal-600 dark:from-teal-600/30 dark:to-teal-600/5 dark:text-teal-100',
  gold: 'from-gold-100 to-gold-50 text-gold-600 dark:from-gold-600/30 dark:to-gold-600/5 dark:text-gold-400',
  ink: 'from-ink-200 to-ink-50 text-ink-700 dark:from-ink-800 dark:to-ink-900 dark:text-ink-200',
}

const GLYPHS: Record<ProductGlyph, React.ReactNode> = {
  headphones: (
    <>
      <path d="M14 40v-6a18 18 0 0 1 36 0v6" />
      <rect x="8" y="38" width="12" height="20" rx="5" />
      <rect x="44" y="38" width="12" height="20" rx="5" />
    </>
  ),
  watch: (
    <>
      <circle cx="32" cy="32" r="15" />
      <path d="M24 18.5 25 6h14l1 12.5M24 45.5 25 58h14l1-12.5M32 25v8l6 3" />
    </>
  ),
  shirt: <path d="M22 8 32 15l10-7 14 7-5 12-5-2v30H18V25l-5 2L8 15l14-7Z" />,
  lamp: (
    <>
      <path d="M20 8h24l9 20H11l9-20Z" />
      <path d="M32 28v18M22 56h20l-3-10H25l-3 10Z" />
    </>
  ),
  bottle: (
    <>
      <path d="M26 6h12v8.5c0 2.4.9 4.6 2.5 6.3l2 2.2a9 9 0 0 1 2.5 6.2V56a2 2 0 0 1-2 2H21a2 2 0 0 1-2-2V29.2a9 9 0 0 1 2.5-6.2l2-2.2A9.3 9.3 0 0 0 26 14.5V6Z" />
      <path d="M19 36h26" />
    </>
  ),
  dumbbell: <path d="M12 22v20M6 26v12M20 18v28M44 18v28M52 22v20M58 26v12M20 32h24" />,
  bag: (
    <>
      <path d="M14 20h36l3 36a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2l3-36Z" />
      <path d="M23 26V17a9 9 0 0 1 18 0v9" />
    </>
  ),
  camera: (
    <>
      <rect x="6" y="18" width="52" height="34" rx="5" />
      <circle cx="32" cy="35" r="10" />
      <path d="M22 18l4-6h12l4 6" />
    </>
  ),
}

export function ProductThumb({
  glyph,
  tone = 'brand',
  className,
}: {
  glyph: ProductGlyph
  tone?: keyof typeof TONES
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative grid aspect-4/3 place-items-center overflow-hidden rounded-md bg-linear-160',
        TONES[tone],
        className
      )}
    >
      {/* faint concentric rings for depth */}
      <svg viewBox="0 0 200 150" className="absolute inset-0 h-full w-full opacity-35" aria-hidden="true">
        <circle cx="160" cy="20" r="52" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="160" cy="20" r="76" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="26" cy="132" r="40" fill="none" stroke="currentColor" strokeWidth="0.8" />
      </svg>
      <svg
        viewBox="0 0 64 64"
        className="relative h-[46%] w-[46%]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {GLYPHS[glyph]}
      </svg>
    </div>
  )
}

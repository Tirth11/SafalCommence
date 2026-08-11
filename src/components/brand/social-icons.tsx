/**
 * Social marks — lucide v1 no longer ships brand logos, so these are
 * minimal in-house line versions. Kept deliberately subtle per brand direction.
 */
type Props = { className?: string }

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function XMark({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4 4l7 9.2L4.4 20h1.9l5.6-5.8 4.4 5.8H21l-7.3-9.6L19.8 4h-1.9l-5.2 5.4L8.6 4H4Z" />
    </svg>
  )
}

export function LinkedInMark({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M8 10.5V16M8 7.6h.01M12 16v-3.2a2 2 0 0 1 4 0V16" />
    </svg>
  )
}

export function InstagramMark({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <path d="M16.9 7.1h.01" />
    </svg>
  )
}

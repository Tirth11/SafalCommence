import { useLocation, useNavigate } from '@tanstack/react-router'

import { AdminLink, adminLinkProps } from '@/components/admin/admin-link'
import { NAV_LINK_CLASS, type NavItem } from '@/components/layout/nav-items'

/** Sticky header height, so the section heading isn't hidden under the bar. */
const HEADER_OFFSET = 88

function scrollToOffset(target: number) {
  const top = Math.max(0, Math.min(target, document.documentElement.scrollHeight - window.innerHeight))
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo({ top, behavior: 'instant' })
    return
  }

  const start = window.scrollY
  const distance = top - start
  const duration = Math.min(700, Math.max(280, Math.abs(distance) * 0.35))
  const startedAt = performance.now()
  let finished = false

  const step = (now: number) => {
    const elapsed = Math.min(1, (now - startedAt) / duration)
    // easeOutCubic — quick off the mark, gentle at the destination.
    const eased = 1 - Math.pow(1 - elapsed, 3)
    window.scrollTo({ top: start + distance * eased, behavior: 'instant' })
    if (elapsed < 1) requestAnimationFrame(step)
    else finished = true
  }
  requestAnimationFrame(step)

  // Background tabs and throttled engines never tick rAF, which would leave
  // the shopper exactly where they were. Arriving late beats not arriving.
  window.setTimeout(() => {
    if (!finished && Math.abs(window.scrollY - top) > 4) window.scrollTo({ top, behavior: 'instant' })
  }, duration + 120)
}

/**
 * A primary nav link. Items with a `hash` scroll to that section when the
 * shopper is already on the page — jumping to a fresh page load to reach
 * something twelve inches below them is the wrong answer. From anywhere else
 * it navigates first, then scrolls once the section exists.
 */
export function PrimaryNavLink({
  item,
  className = NAV_LINK_CLASS,
  onNavigate,
}: {
  item: NavItem
  className?: string
  onNavigate?: () => void
}) {
  const navigate = useNavigate()
  const location = useLocation()

  if (!item.hash) {
    return (
      <AdminLink to={item.to} search={item.search} className={className} onClick={onNavigate}>
        {item.label}
      </AdminLink>
    )
  }

  const scrollToSection = () => {
    const section = document.getElementById(item.hash!)
    if (!section) return
    // Animated by hand rather than with `behavior: 'smooth'`. Some engines
    // ignore that flag entirely, and a nav button that does nothing at all is
    // far worse than one that jumps.
    scrollToOffset(section.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET)
  }

  return (
    <AdminLink
      to={item.to}
      search={item.search}
      hash={item.hash}
      className={className}
      onClick={(event) => {
        onNavigate?.()
        if (location.pathname === item.to) {
          // Already here — scroll instead of re-rendering the whole route.
          event.preventDefault()
          scrollToSection()
          return
        }
        event.preventDefault()
        navigate(adminLinkProps({ to: item.to, search: item.search, hash: item.hash }))
        // The section only exists once the new route paints, and how long that
        // takes varies. Poll briefly rather than guessing a single delay.
        let attempts = 0
        const tryScroll = () => {
          attempts += 1
          if (document.getElementById(item.hash!)) scrollToSection()
          else if (attempts < 12) window.setTimeout(tryScroll, 60)
        }
        window.setTimeout(tryScroll, 60)
      }}
    >
      {item.label}
    </AdminLink>
  )
}

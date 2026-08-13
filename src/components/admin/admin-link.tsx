import { Link, useLocation, type LinkProps } from '@tanstack/react-router'
import type * as React from 'react'

/**
 * The admin navigation is data-driven (see admin-nav.ts), so paths arrive as
 * plain strings rather than literal route ids. This is the single, contained
 * place where that widening is reconciled with TanStack Router's typed Link.
 */
export type AdminTarget = { to: string; search?: Record<string, string | undefined>; hash?: string }

export function adminLinkProps({ to, search, hash }: AdminTarget): LinkProps {
  return { to, search, hash } as unknown as LinkProps
}

export function AdminLink({
  to,
  search,
  hash,
  className,
  children,
  ...rest
}: AdminTarget & { className?: string; children: React.ReactNode } & Omit<React.ComponentProps<'a'>, 'href'>) {
  return (
    <Link {...adminLinkProps({ to, search, hash })} className={className} {...rest}>
      {children}
    </Link>
  )
}

/** Search params without per-route schemas — the admin lists read them loosely. */
export function useAdminSearch(): Record<string, string> {
  const location = useLocation()
  return (location.search ?? {}) as Record<string, string>
}

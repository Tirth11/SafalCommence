import { useNavigate } from '@tanstack/react-router'
import { Check, ChevronDown, Plus, ShoppingBag, Store } from 'lucide-react'

import { AdminLink, adminLinkProps } from '@/components/admin/admin-link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAccountStore, type Context } from '@/store/account-store'
import { cn } from '@/lib/utils'

/**
 * Switches the working context of one account: personal shopping, or one of the
 * user's seller organisations. Never signs anyone out — it just changes which
 * side of the marketplace they're operating.
 */
export function ContextSwitcher({ variant = 'light' }: { variant?: 'light' | 'onInk' }) {
  const navigate = useNavigate()
  const { context, memberships, switchContext } = useAccountStore()
  const user = useAccountStore((s) => s.user)

  if (!user) return null

  const activeOrg = memberships.find((m) => m.id === context)
  const label = activeOrg ? activeOrg.name : 'Personal · Shopping'
  const Icon = activeOrg ? Store : ShoppingBag

  function go(next: Context) {
    switchContext(next)
    navigate(adminLinkProps({ to: next === 'personal' ? '/shop' : '/seller' }))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex max-w-[220px] items-center gap-2 rounded-sm border px-2.5 py-1.5 text-left transition-colors',
            variant === 'onInk'
              ? 'border-white/15 text-white hover:bg-white/10'
              : 'bg-card text-ink-800 hover:border-ink-400 dark:text-ink-100'
          )}
        >
          <Icon className="size-4 shrink-0 text-brand-600 dark:text-brand-300" />
          <span className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-ink-400">Using</span>
            <span className="block truncate text-[13px] font-semibold leading-tight">{label}</span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-ink-400" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[260px]">
        <DropdownMenuLabel>Switch context</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => go('personal')}>
          <ShoppingBag />
          <span className="flex-1">Personal · Shopping</span>
          {context === 'personal' && <Check className="size-4 text-brand-600 dark:text-brand-300" />}
        </DropdownMenuItem>

        {memberships.length > 0 && <DropdownMenuSeparator />}
        {memberships.map((org) => (
          <DropdownMenuItem key={org.id} onSelect={() => go(org.id)}>
            <Store />
            <span className="min-w-0 flex-1">
              <span className="block truncate">{org.name}</span>
              <span className="block text-[11px] text-ink-500">
                {org.role} · {org.status}
              </span>
            </span>
            {context === org.id && <Check className="size-4 text-brand-600 dark:text-brand-300" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <AdminLink to="/seller/setup">
            <Plus />
            {memberships.length === 0 ? 'Start selling' : 'Start another business'}
          </AdminLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Account menu shared by the shopping and selling shells: one identity, with a
 * Shopping group and a Selling group. A shopper who isn't a seller yet sees the
 * invitation instead of an empty section.
 */
export function AccountMenuSections({ onSignOut }: { onSignOut: () => void }) {
  const { memberships, switchContext } = useAccountStore()

  return (
    <>
      <DropdownMenuLabel>Shopping</DropdownMenuLabel>
      <DropdownMenuItem asChild>
        <AdminLink to="/account/orders">My Orders</AdminLink>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <AdminLink to="/account/addresses">My Addresses</AdminLink>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <AdminLink to="/account/returns">Returns &amp; Refunds</AdminLink>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <AdminLink to="/account/wishlist">Wishlist</AdminLink>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      {memberships.length > 0 ? (
        memberships.map((org) => (
          <div key={org.id}>
            <DropdownMenuLabel className="flex items-center gap-1.5 normal-case tracking-normal">
              <Store className="size-3.5" />
              {org.name}
            </DropdownMenuLabel>
            <DropdownMenuItem asChild onSelect={() => switchContext(org.id)}>
              <AdminLink to="/seller">Seller Dashboard</AdminLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild onSelect={() => switchContext(org.id)}>
              <AdminLink to="/seller/products">Products</AdminLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild onSelect={() => switchContext(org.id)}>
              <AdminLink to="/seller/orders">Seller Orders</AdminLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild onSelect={() => switchContext(org.id)}>
              <AdminLink to="/seller/settlements">Payments</AdminLink>
            </DropdownMenuItem>
          </div>
        ))
      ) : (
        <>
          <DropdownMenuLabel>Selling</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <AdminLink to="/seller/setup">Start selling with this account</AdminLink>
          </DropdownMenuItem>
        </>
      )}

      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <AdminLink to="/account/profile">Account Settings</AdminLink>
      </DropdownMenuItem>
      <DropdownMenuItem variant="destructive" onSelect={onSignOut}>
        Logout
      </DropdownMenuItem>
    </>
  )
}

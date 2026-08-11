import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Bell, ChevronDown, LogOut, Menu, Plus, Search, Store, User } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink, adminLinkProps } from '@/components/admin/admin-link'
import { Logo } from '@/components/brand/logo'
import { SELLER_MOBILE_NAV, SELLER_NAV } from '@/components/seller/seller-nav'
import { SellerStatusPill } from '@/components/seller/status-banner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { SELLER_NOTIFICATIONS, SELLER_ORDERS, SELLER_PRODUCTS } from '@/data/seller'
import { useSellerStore } from '@/store/seller-store'
import { cn } from '@/lib/utils'

export function SellerShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const storeName = useSellerStore((s) => s.storeName)

  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <div className="min-h-dvh bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r bg-sidebar lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b px-5">
          <Logo size="sm" sub="Seller" to="/seller" />
        </div>
        <SellerNavList />
        <div className="shrink-0 border-t p-3">
          <div className="rounded-sm border bg-background p-3">
            <p className="flex items-center gap-2 text-[12px] font-semibold text-ink-800 dark:text-ink-100">
              <Store className="size-3.5 shrink-0 text-brand-600 dark:text-brand-300" />
              <span className="truncate">{storeName}</span>
            </p>
            <SellerStatusPill className="mt-2" />
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl lg:pl-[248px]">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation" className="lg:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetTitle className="sr-only">Seller navigation</SheetTitle>
              <div className="flex h-16 shrink-0 items-center border-b px-5">
                <Logo size="sm" sub="Seller" to="/seller" />
              </div>
              <SellerNavList />
            </SheetContent>
          </Sheet>

          <Logo size="sm" sub="Seller" to="/seller" className="lg:hidden" />

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="ml-auto hidden h-10 min-w-0 flex-1 items-center gap-2.5 rounded-sm border border-input bg-background px-3 text-left text-sm text-ink-400 shadow-xs transition-colors hover:border-ink-400 sm:flex sm:max-w-[360px] lg:ml-0"
          >
            <Search className="size-4 shrink-0" />
            <span className="truncate">Search product, SKU or order ID</span>
          </button>

          <div className="ml-auto flex items-center gap-1">
            <Button size="sm" className="hidden lg:inline-flex" asChild>
              <AdminLink to="/seller/products/new">
                <Plus className="size-4" />
                Add Product
              </AdminLink>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Search" className="sm:hidden" onClick={() => setSearchOpen(true)}>
              <Search className="size-5" />
            </Button>
            <SellerNotificationBell />
            <SellerAccountMenu />
          </div>
        </div>
      </header>

      <main className="lg:pl-[248px]">
        <div className="mx-auto max-w-[1320px] px-4 pb-24 pt-6 sm:px-6 sm:pb-10 sm:pt-8">{children}</div>
      </main>

      <SellerMobileNav />
      <SellerSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}

/* ------------------------------------------------------------ navigation --- */
function SellerNavList() {
  const location = useLocation()
  const search = (location.search ?? {}) as Record<string, string>

  return (
    <nav aria-label="Seller" className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
      <ul className="space-y-0.5">
        {SELLER_NAV.map((item) => {
          const active =
            location.pathname === item.to ||
            location.pathname.startsWith(`${item.to}/`) ||
            (item.label === 'Payments' && location.pathname.startsWith('/seller/settlements'))
          return (
            <li key={item.label}>
              <AdminLink
                to={item.to}
                className={cn(
                  'flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13px] font-medium transition-colors',
                  active
                    ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-secondary dark:hover:text-white'
                )}
              >
                <item.icon className="size-[17px] shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge ? (
                  <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    {item.badge}
                  </span>
                ) : null}
              </AdminLink>

              {active && item.children && (
                <ul className="mb-1 ml-[26px] mt-0.5 border-l pl-3">
                  {item.children.map((child) => {
                    const childActive =
                      location.pathname === child.to && (child.search?.tab ?? '') === (search.tab ?? '')
                    return (
                      <li key={child.label}>
                        <AdminLink
                          to={child.to}
                          search={child.search}
                          className={cn(
                            'flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-[12px] transition-colors',
                            childActive
                              ? 'font-semibold text-brand-700 dark:text-brand-200'
                              : 'text-ink-500 hover:text-ink-900 dark:hover:text-white'
                          )}
                        >
                          <span className="flex-1 truncate">{child.label}</span>
                          {child.badge ? (
                            <span className="text-[10px] font-bold text-brand-600 dark:text-brand-300">{child.badge}</span>
                          ) : null}
                        </AdminLink>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function SellerMobileNav() {
  const location = useLocation()
  return (
    <nav
      aria-label="Seller mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {SELLER_MOBILE_NAV.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
          return (
            <li key={item.label}>
              <AdminLink
                to={item.to}
                className={cn(
                  'relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors',
                  active ? 'text-brand-600 dark:text-brand-300' : 'text-ink-500'
                )}
              >
                <item.icon className="size-5" />
                {item.label}
                {item.badge ? (
                  <span className="absolute right-[22%] top-1.5 grid size-4 place-items-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </AdminLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/* --------------------------------------------------------- notifications --- */
function SellerNotificationBell() {
  const [items, setItems] = useState(SELLER_NOTIFICATIONS)
  const unread = items.filter((n) => n.unread).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Notifications, ${unread} unread`} className="relative">
          <Bell className="size-[18px]" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 grid h-[17px] min-w-[17px] place-items-center rounded-full border-2 border-background bg-brand-600 px-1 text-[10px] font-bold leading-none text-white">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[330px] p-0">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <p className="text-[13px] font-semibold">Notifications</p>
          <button
            type="button"
            onClick={() => setItems((prev) => prev.map((n) => ({ ...n, unread: false })))}
            className="text-[11px] font-semibold text-brand-600 hover:underline dark:text-brand-300"
          >
            Mark all as read
          </button>
        </div>
        <ul className="max-h-[300px] overflow-y-auto">
          {items.slice(0, 5).map((n) => (
            <li key={n.id} className={cn('border-b last:border-0', n.unread && 'bg-brand-50/50 dark:bg-brand-950/40')}>
              <AdminLink to={n.to ?? '/seller/notifications'} className="block px-4 py-3 hover:bg-muted/60">
                <p className="text-[13px] font-semibold leading-snug text-ink-900 dark:text-white">{n.title}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-ink-500">{n.detail}</p>
                <p className="mt-1 text-[11px] text-ink-400">{n.at}</p>
              </AdminLink>
            </li>
          ))}
        </ul>
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <AdminLink to="/seller/notifications">View all</AdminLink>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SellerAccountMenu() {
  const { storeName, ownerName, email } = useSellerStore()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-sm py-1 pl-1 pr-2 transition-colors hover:bg-ink-100 dark:hover:bg-secondary"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-600 text-[12px] font-bold text-white">
            {storeName.slice(0, 2).toUpperCase()}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block max-w-[140px] truncate text-[13px] font-semibold leading-tight text-ink-900 dark:text-white">
              {storeName}
            </span>
            <span className="block text-[11px] leading-tight text-ink-500">{ownerName}</span>
          </span>
          <ChevronDown className="size-4 text-ink-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[230px]">
        <DropdownMenuLabel>{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <AdminLink to="/seller/profile">
            <Store />
            Business profile
          </AdminLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <AdminLink to="/seller/settings">
            <User />
            Account settings
          </AdminLink>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" asChild>
          <Link to="/login" onClick={() => toast.success('Signed out')}>
            <LogOut />
            Sign out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ---------------------------------------------------------------- search --- */
function SellerSearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const products = SELLER_PRODUCTS.filter((p) => `${p.name} ${p.sku} ${p.id}`.toLowerCase().includes(q)).map((p) => ({
      group: 'Products',
      label: p.name,
      meta: `${p.sku} · ${p.status}`,
      to: `/seller/products/${p.id}`,
    }))
    const orders = SELLER_ORDERS.filter((o) => `${o.id} ${o.parentOrder} ${o.customer}`.toLowerCase().includes(q)).map(
      (o) => ({ group: 'Orders', label: o.id, meta: `${o.customer} · ${o.status}`, to: `/seller/orders/${o.id}` })
    )
    return [...orders, ...products].slice(0, 10)
  }, [query])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className="top-[12%] max-w-[520px] translate-y-0 gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">Search your products, SKUs and orders.</DialogDescription>
        <div className="flex items-center gap-3 border-b px-4">
          <Search className="size-[18px] shrink-0 text-ink-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product, SKU or order ID…"
            className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-ink-400"
          />
        </div>
        <div className="max-h-[340px] overflow-y-auto p-2">
          {!query && <p className="px-3 py-6 text-center text-sm text-ink-500">Try an order id like SH-100145-01, or a SKU like WH-001.</p>}
          {query && results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-ink-500">No products or orders match “{query}”.</p>
          )}
          {results.map((hit) => (
            <button
              key={`${hit.group}-${hit.label}`}
              type="button"
              onClick={() => {
                onOpenChange(false)
                setQuery('')
                navigate(adminLinkProps({ to: hit.to }))
              }}
              className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors hover:bg-accent"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-ink-900 dark:text-white">{hit.label}</span>
                <span className="block truncate text-[11px] text-ink-500">
                  {hit.group} · {hit.meta}
                </span>
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

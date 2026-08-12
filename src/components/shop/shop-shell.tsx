import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Bell, ChevronDown, ChevronRight, Grid2x2, Heart, House, Menu, Search, ShoppingCart, User } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink, adminLinkProps } from '@/components/admin/admin-link'
import { Logo } from '@/components/brand/logo'
import { SiteFooter } from '@/components/layout/site-footer'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { CUSTOMER_NOTIFICATIONS, SHOP_CATEGORIES, SHOP_PRODUCTS } from '@/data/shop'
import { AccountMenuSections, ContextSwitcher } from '@/components/account/context-switcher'
import { useAccountStore, useStartSellingTarget } from '@/store/account-store'
import { useCartCount, useCartStore } from '@/store/cart-store'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Home', to: '/shop' },
  { label: 'Shop', to: '/shop/all' },
  { label: 'Categories', to: '/shop/categories' },
  { label: 'Help', to: '/account/support' },
]

const MOBILE_NAV = [
  { label: 'Home', to: '/shop', icon: House },
  { label: 'Categories', to: '/shop/categories', icon: Grid2x2 },
  { label: 'Search', to: '/shop/all', icon: Search },
  { label: 'Cart', to: '/cart', icon: ShoppingCart, badge: true },
  { label: 'Account', to: '/account', icon: User },
]

export function ShopShell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <ShopHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main className={cn('flex-1 pb-24 pt-6 sm:pb-12', wide ? 'container-wide' : 'container-page')}>{children}</main>
      <SiteFooter />
      <ShopMobileNav />
    </div>
  )
}

/* ---------------------------------------------------------------- header --- */
function ShopHeader({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (v: boolean) => void }) {
  const count = useCartCount()
  const user = useAccountStore((s) => s.user)
  const wishlist = useCartStore((s) => s.wishlist)
  const sell = useStartSellingTarget()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl">
      <div className="container-wide flex h-16 items-center gap-3 sm:gap-5">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu" className="lg:hidden">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[290px] p-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex h-16 items-center border-b px-5">
              <Logo size="sm" />
            </div>
            <nav className="flex-1 overflow-y-auto p-5">
              {NAV.map((item) => (
                <AdminLink
                  key={item.label}
                  to={item.to}
                  className="flex items-center justify-between border-b py-3.5 text-[15px] font-semibold text-ink-900 dark:text-white"
                >
                  {item.label}
                  <ChevronRight className="size-4 text-ink-400" />
                </AdminLink>
              ))}
              <p className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-400">Categories</p>
              {SHOP_CATEGORIES.map((cat) => (
                <AdminLink
                  key={cat.id}
                  to="/shop/all"
                  search={{ category: cat.label }}
                  className="flex items-center justify-between py-2.5 text-[14px] text-ink-700 dark:text-ink-200"
                >
                  {cat.label}
                  <span className="text-[11px] text-ink-400 tabular">{cat.count.toLocaleString('en-US')}</span>
                </AdminLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => (
            <AdminLink
              key={item.label}
              to={item.to}
              className="rounded-sm px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-950 dark:text-ink-300 dark:hover:bg-secondary dark:hover:text-white"
            >
              {item.label}
            </AdminLink>
          ))}
          {/* Existing accounts go straight to business setup — never re-register */}
          <AdminLink
            to={sell.to}
            className="rounded-sm px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-950 dark:text-ink-300 dark:hover:bg-secondary dark:hover:text-white"
          >
            {sell.label === 'Seller Dashboard' ? 'Seller Dashboard' : 'Sell on SafalMarketHub'}
          </AdminLink>
        </nav>

        <SearchBox className="hidden flex-1 md:block" />

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <NotificationBell />

          <Button variant="ghost" size="icon" aria-label={`Wishlist, ${wishlist.length} items`} className="relative hidden sm:inline-flex" asChild>
            <AdminLink to="/account/wishlist">
              <Heart className="size-5" />
              {wishlist.length > 0 && (
                <span className="absolute right-1 top-1 grid h-[17px] min-w-[17px] place-items-center rounded-full border-2 border-background bg-brand-600 px-1 text-[10px] font-bold leading-none text-white">
                  {wishlist.length}
                </span>
              )}
            </AdminLink>
          </Button>

          <Button variant="ghost" size="icon" aria-label={`Cart, ${count} items`} className="relative" asChild>
            <AdminLink to="/cart">
              <ShoppingCart className="size-5" />
              {count > 0 && (
                <span className="absolute right-1 top-1 grid h-[17px] min-w-[17px] place-items-center rounded-full border-2 border-background bg-brand-600 px-1 text-[10px] font-bold leading-none text-white">
                  {count}
                </span>
              )}
            </AdminLink>
          </Button>

          {user ? (
            <>
              <div className="hidden xl:block">
                <ContextSwitcher />
              </div>
              <AccountMenu />
            </>
          ) : (
            <Button size="sm" className="hidden sm:inline-flex" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile search sits below the bar so the header stays compact */}
      <div className="border-t px-4 py-2.5 md:hidden">
        <SearchBox />
      </div>
    </header>
  )
}

/* ------------------------------------------------------ search + suggest --- */
function SearchBox({ className }: { className?: string }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return { products: [], brands: [], categories: [] }
    return {
      products: SHOP_PRODUCTS.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 4),
      brands: [...new Set(SHOP_PRODUCTS.filter((p) => p.brand.toLowerCase().includes(q)).map((p) => p.brand))].slice(0, 3),
      categories: SHOP_CATEGORIES.filter((c) => c.label.toLowerCase().includes(q)).slice(0, 3),
    }
  }, [query])

  const hasSuggestions = suggestions.products.length + suggestions.brands.length + suggestions.categories.length > 0

  function submit(term = query) {
    if (!term.trim()) return
    setOpen(false)
    navigate(adminLinkProps({ to: '/shop/all', search: { q: term.trim() } }))
  }

  return (
    <div className={cn('relative', className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-400" />
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search for products, brands or categories"
          aria-label="Search for products, brands or categories"
          className="h-10 w-full pl-11 text-sm md:max-w-[440px]"
        />
      </form>

      {open && query && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-md border bg-popover p-2 shadow-lg md:max-w-[440px]">
          {!hasSuggestions && <p className="px-3 py-4 text-center text-[13px] text-ink-500">No suggestions for “{query}”.</p>}

          {suggestions.products.length > 0 && (
            <Group title="Products">
              {suggestions.products.map((p) => (
                <Suggestion key={p.id} label={p.name} meta={`${p.brand} · ${p.category}`} onSelect={() => navigate(adminLinkProps({ to: `/product/${p.id}` }))} />
              ))}
            </Group>
          )}
          {suggestions.brands.length > 0 && (
            <Group title="Brands">
              {suggestions.brands.map((b) => (
                <Suggestion key={b} label={b} onSelect={() => submit(b)} />
              ))}
            </Group>
          )}
          {suggestions.categories.length > 0 && (
            <Group title="Categories">
              {suggestions.categories.map((c) => (
                <Suggestion
                  key={c.id}
                  label={c.label}
                  meta={`${c.count.toLocaleString('en-US')} products`}
                  onSelect={() => navigate(adminLinkProps({ to: '/shop/all', search: { category: c.label } }))}
                />
              ))}
            </Group>
          )}
        </div>
      )}
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-1 last:mb-0">
      <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">{title}</p>
      {children}
    </div>
  )
}

function Suggestion({ label, meta, onSelect }: { label: string; meta?: string; onSelect: () => void }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onSelect}
      className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-left transition-colors hover:bg-accent"
    >
      <Search className="size-3.5 shrink-0 text-ink-400" />
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium text-ink-900 dark:text-white">{label}</span>
        {meta && <span className="block truncate text-[11px] text-ink-500">{meta}</span>}
      </span>
    </button>
  )
}

/* --------------------------------------------------------- notifications --- */
function NotificationBell() {
  const [items, setItems] = useState(CUSTOMER_NOTIFICATIONS)
  const unread = items.filter((n) => n.unread).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Notifications, ${unread} unread`} className="relative">
          <Bell className="size-5" />
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
              <AdminLink to={n.to ?? '/account/notifications'} className="block px-4 py-3 hover:bg-muted/60">
                <p className="text-[13px] font-semibold leading-snug text-ink-900 dark:text-white">{n.title}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-ink-500">{n.detail}</p>
                <p className="mt-1 text-[11px] text-ink-400">{n.at}</p>
              </AdminLink>
            </li>
          ))}
        </ul>
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <AdminLink to="/account/notifications">View all</AdminLink>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* --------------------------------------------------------- account menu --- */
function AccountMenu() {
  const user = useAccountStore((s) => s.user)
  const signOut = useAccountStore((s) => s.signOut)
  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-sm py-1 pl-1 pr-2 transition-colors hover:bg-ink-100 dark:hover:bg-secondary"
        >
          <span className="grid size-8 place-items-center rounded-full bg-brand-600 text-[12px] font-bold text-white">
            {user.firstName.slice(0, 1).toUpperCase()}
          </span>
          <span className="hidden text-[13px] font-semibold text-ink-900 sm:block dark:text-white">
            Hi, {user.firstName}
          </span>
          <ChevronDown className="size-4 text-ink-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[250px]">
        <DropdownMenuLabel className="normal-case tracking-normal">
          <span className="block text-[13px] font-semibold text-ink-900 dark:text-white">
            {user.firstName} {user.lastName}
          </span>
          <span className="block text-[11px] font-normal text-ink-500">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <AccountMenuSections
          onSignOut={() => {
            signOut()
            toast.success('Signed out')
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* --------------------------------------------------------- mobile nav ----- */
function ShopMobileNav() {
  const location = useLocation()
  const count = useCartCount()

  return (
    <nav
      aria-label="Shop mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden"
    >
      <ul className="grid grid-cols-5">
        {MOBILE_NAV.map((item) => {
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
                {item.badge && count > 0 && (
                  <span className="absolute right-[22%] top-1.5 grid size-4 place-items-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
                    {count}
                  </span>
                )}
              </AdminLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

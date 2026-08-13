import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ChevronRight, Heart, Menu, Mic, Search, ShoppingCart, Store, User } from 'lucide-react'

import { AdminLink, adminLinkProps } from '@/components/admin/admin-link'
import { AccountMenuSections } from '@/components/account/context-switcher'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useOptionalAssistant } from '@/components/shop/assistant'
import { useAccountStore, useStartSellingTarget } from '@/store/account-store'
import { useCartStore } from '@/store/cart-store'

/**
 * Every entry resolves to a real route and navigates client-side. Raw <a>
 * hrefs were doing full page reloads and dropping router state, which is what
 * made the nav feel unresponsive.
 */
const NAV: { label: string; to: string; search?: Record<string, string> }[] = [
  { label: 'Categories', to: '/shop/categories' },
  { label: 'Offers', to: '/shop/all', search: { sort: 'price-asc' } },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Help', to: '/help' },
  { label: 'Contact', to: '/contact' },
]

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const user = useAccountStore((s) => s.user)
  const signOut = useAccountStore((s) => s.signOut)
  const sell = useStartSellingTarget()
  const { items, wishlist } = useCartStore()
  const assistant = useOptionalAssistant()

  const search = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(adminLinkProps({ to: '/shop/all', search: query.trim() ? { q: query.trim() } : undefined }))
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-xl backdrop-saturate-150">
      <div className="container-wide flex h-18 items-center gap-4">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-0.5 xl:flex">
          {NAV.map((item) => (
            <AdminLink
              key={item.label}
              to={item.to}
              search={item.search}
              className="flex h-10 items-center rounded-md px-3 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-950 dark:text-ink-300 dark:hover:bg-secondary dark:hover:text-white"
            >
              {item.label}
            </AdminLink>
          ))}
        </nav>

        {/* Search is the main event, so it stays open and centred. */}
        <form onSubmit={search} className="mx-auto hidden w-full max-w-[420px] md:block">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3.5 size-[18px] text-ink-400" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for anything..."
              aria-label="Search for anything"
              className="h-11 rounded-full pl-11 pr-11 text-sm"
            />
            <button
              type="button"
              onClick={() => assistant?.open('voice')}
              aria-label="Search by voice"
              className="absolute right-1.5 grid size-8 place-items-center rounded-full text-ink-500 transition-colors hover:bg-muted hover:text-ink-900 dark:hover:text-white"
            >
              <Mic className="size-[18px]" />
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-0.5 md:ml-0">
          <Button variant="ghost" size="icon" aria-label={`Wishlist, ${wishlist.length} saved`} className="relative hidden sm:inline-flex" asChild>
            <AdminLink to="/account/wishlist">
              <Heart className="size-5" />
              {wishlist.length > 0 && <Badge count={wishlist.length} />}
            </AdminLink>
          </Button>

          <Button variant="ghost" size="icon" aria-label={`Cart, ${items.length} items`} className="relative" asChild>
            <Link to="/cart">
              <ShoppingCart className="size-5" />
              {items.length > 0 && <Badge count={items.length} />}
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account">
                  <span className="grid size-7 place-items-center rounded-full bg-brand-600 text-[12px] font-bold text-white">
                    {user.firstName.slice(0, 1)}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[260px]">
                <AccountMenuSections onSignOut={signOut} />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
              <Link to="/login">
                <User className="size-4" />
                Sign in
              </Link>
            </Button>
          )}

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="xl:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm p-0">
              <div className="border-b p-5 pr-14">
                <Logo size="sm" />
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <form onSubmit={search} className="relative mb-5">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-400" />
                  <Input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for anything..."
                    aria-label="Search for anything"
                    className="pl-11 pr-11"
                  />
                  {assistant && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        assistant.open('voice')
                      }}
                      aria-label="Search by voice"
                      className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-500"
                    >
                      <Mic className="size-[18px]" />
                    </button>
                  )}
                </form>

                <nav aria-label="Mobile" className="mb-7">
                  {[...NAV, { label: 'Wishlist', to: '/account/wishlist', search: undefined }].map((item) => (
                    <AdminLink
                      key={item.label}
                      to={item.to}
                      search={item.search}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between border-b py-4 text-[17px] font-semibold text-ink-900 dark:text-white"
                    >
                      {item.label}
                      <ChevronRight className="size-4 text-ink-400" />
                    </AdminLink>
                  ))}
                </nav>

                <div className="grid gap-3">
                  {!user && (
                    <Button asChild className="w-full">
                      <Link to="/login" onClick={() => setMenuOpen(false)}>
                        Sign in
                      </Link>
                    </Button>
                  )}
                  {/* Selling lives at the bottom of the menu, not in the header. */}
                  <Button variant="outline" asChild className="w-full">
                    <AdminLink to={sell.to} onClick={() => setMenuOpen(false)}>
                      <Store className="size-4" />
                      Become a seller
                    </AdminLink>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function Badge({ count }: { count: number }) {
  return (
    <span className="absolute right-1 top-1 grid h-[17px] min-w-[17px] place-items-center rounded-full border-2 border-background bg-brand-600 px-1 text-[10px] font-bold leading-none text-white">
      {count}
    </span>
  )
}

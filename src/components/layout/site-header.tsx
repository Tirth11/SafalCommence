import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight, Menu, Search, ShoppingCart } from 'lucide-react'

import { AdminLink } from '@/components/admin/admin-link'
import { Logo } from '@/components/brand/logo'
import { useAccountStore, useStartSellingTarget } from '@/store/account-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const NAV = [
  { label: 'Shop', href: '/shop/all' },
  { label: 'Categories', href: '/shop/categories' },
  { label: 'Sell on SafalMarketHub', href: '/#sellers' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
]

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const user = useAccountStore((s) => s.user)
  const sell = useStartSellingTarget()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-xl backdrop-saturate-150">
      <div className="container-wide flex h-18 items-center gap-5">
        <Logo />

        <nav aria-label="Primary" className="mx-auto hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-sm px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-950 dark:text-ink-300 dark:hover:bg-secondary dark:hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          {/* Search collapses to an icon; expands inline on desktop */}
          <div className="hidden md:block">
            {searchOpen ? (
              <div className="relative animate-in fade-in slide-in-from-right-2 duration-200">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-ink-400" />
                <Input
                  autoFocus
                  type="search"
                  placeholder="Search products, brands and sellers"
                  aria-label="Search products, brands and sellers"
                  onBlur={(e) => !e.target.value && setSearchOpen(false)}
                  className="h-10 w-[290px] pl-10 text-sm"
                />
              </div>
            ) : (
              <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
                <Search className="size-5" />
              </Button>
            )}
          </div>

          {!user && (
            <Button variant="ghost" size="sm" className="hidden lg:inline-flex" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          )}

          <Button variant="ghost" size="icon" aria-label="Cart, 2 items" className="relative" asChild>
            <Link to="/cart">
            <ShoppingCart className="size-5" />
            <span className="absolute right-1 top-1 grid h-[17px] min-w-[17px] place-items-center rounded-full border-2 border-background bg-brand-600 px-1 text-[10px] font-bold leading-none text-white">
              2
            </span>
            </Link>
          </Button>

          <Button size="sm" className="hidden lg:inline-flex" asChild>
            <AdminLink to={sell.to}>{sell.label}</AdminLink>
          </Button>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="lg:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm p-0">
              <div className="border-b p-5 pr-14">
                <Logo size="sm" />
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <div className="relative mb-5">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-400" />
                  <Input type="search" placeholder="Search products" aria-label="Search products" className="pl-11" />
                </div>
                <nav aria-label="Mobile" className="mb-7">
                  {NAV.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between border-b py-4 text-[17px] font-semibold text-ink-900 dark:text-white"
                    >
                      {item.label}
                      <ChevronRight className="size-4 text-ink-400" />
                    </a>
                  ))}
                </nav>
                <div className="grid gap-3">
                  <Button asChild className="w-full">
                    <AdminLink to={sell.to} onClick={() => setMenuOpen(false)}>
                      {sell.label}
                    </AdminLink>
                  </Button>
                  {!user && (
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/login" onClick={() => setMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

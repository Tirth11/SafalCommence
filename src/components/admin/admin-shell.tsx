import { useEffect, useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Bell, ChevronDown, ExternalLink, LogOut, Menu, PanelLeft, Search, ShieldCheck, User } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink } from '@/components/admin/admin-link'
import { ADMIN_NAV, KIND_ICON } from '@/components/admin/admin-nav'
import { GlobalSearch } from '@/components/admin/global-search'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ADMIN_NOTIFICATIONS } from '@/data/admin'
import { useAccountStore } from '@/store/account-store'
import { cn } from '@/lib/utils'

/** Signed-in admin — swap for the session once auth is wired. */
export const CURRENT_ADMIN = {
  name: 'Tirth Thaker',
  email: 'tirth.thaker@safalmarkethub.com',
  role: 'Super Admin' as const,
  initials: 'TT',
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const location = useLocation()
  const user = useAccountStore((s) => s.user)
  const signOut = useAccountStore((s) => s.signOut)
  // Staff identity comes from the signed-in account when available.
  const admin = user
    ? { name: `${user.firstName} ${user.lastName}`, email: user.email, role: CURRENT_ADMIN.role, initials: `${user.firstName[0]}${user.lastName[0]}` }
    : CURRENT_ADMIN

  useEffect(() => setMobileNav(false), [location.pathname])

  // ⌘K / Ctrl+K opens global lookup
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-dvh bg-muted/40">
      {/* Sidebar — fixed on desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r bg-sidebar lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b px-5">
          <Logo size="sm" sub="Super Admin" to="/admin" />
        </div>
        <SidebarNav />
        <AdminIdentityCard />
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl lg:pl-[264px]">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <Sheet open={mobileNav} onOpenChange={setMobileNav}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation" className="lg:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[290px] p-0">
              <SheetTitle className="sr-only">Admin navigation</SheetTitle>
              <div className="flex h-16 shrink-0 items-center border-b px-5">
                <Logo size="sm" sub="Super Admin" to="/admin" />
              </div>
              <SidebarNav />
              <AdminIdentityCard />
            </SheetContent>
          </Sheet>

          <Button variant="ghost" size="icon" aria-label="Collapse sidebar" className="hidden lg:inline-flex">
            <PanelLeft className="size-[18px]" />
          </Button>

          {/* Global lookup */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-sm border border-input bg-background px-3 text-left text-sm text-ink-400 shadow-xs transition-colors hover:border-ink-400 sm:max-w-[420px]"
          >
            <Search className="size-4 shrink-0" />
            <span className="truncate">Search sellers, orders, products…</span>
            <kbd className="ml-auto hidden shrink-0 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-semibold sm:block">
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="sm" className="hidden xl:inline-flex" asChild>
              <Link to="/">
                <ExternalLink className="size-4" />
                View storefront
              </Link>
            </Button>

            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-sm py-1 pl-1 pr-2 transition-colors hover:bg-ink-100 dark:hover:bg-secondary"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-brand-600 text-[12px] font-bold text-white">
                    {admin.initials}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-[13px] font-semibold leading-tight text-ink-900 dark:text-white">
                      {admin.name}
                    </span>
                    <span className="block text-[11px] leading-tight text-ink-500">{admin.role}</span>
                  </span>
                  <ChevronDown className="size-4 text-ink-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[240px]">
                <DropdownMenuLabel>{admin.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User />
                  My profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ShieldCheck />
                  Change password
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast.success('Signed out of all other sessions')}>
                  <LogOut />
                  Log out all sessions
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" asChild onSelect={() => signOut()}>
                  <Link to="/admin/login">
                    <LogOut />
                    Sign out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="lg:pl-[264px]">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </main>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}

/* ------------------------------------------------------------- sidebar ---- */
function SidebarNav() {
  const location = useLocation()
  const search = (location.search ?? {}) as Record<string, string>

  return (
    <nav aria-label="Admin" className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
      {ADMIN_NAV.map((group, gi) => (
        <div key={group.section ?? gi} className={cn(gi > 0 && 'mt-5')}>
          {group.section && (
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-400">{group.section}</p>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
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

                  {/* Status-scoped children of the active section */}
                  {active && item.children && (
                    <ul className="mb-1 ml-[26px] mt-0.5 border-l pl-3">
                      {item.children.map((child) => {
                        const childActive =
                          location.pathname === child.to &&
                          (child.search?.status ?? child.search?.tab ?? '') === (search.status ?? search.tab ?? '')
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
                                <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400">
                                  {child.badge}
                                </span>
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
        </div>
      ))}
    </nav>
  )
}

function AdminIdentityCard() {
  return (
    <div className="shrink-0 border-t p-3">
      <div className="rounded-sm border bg-background p-3">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-600 dark:text-brand-300">
          <ShieldCheck className="size-3.5" />
          Platform-level access
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-500">
          You are viewing data across every seller organisation. All actions are recorded in the audit log.
        </p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------- notifications --- */
function NotificationBell() {
  const [items, setItems] = useState(ADMIN_NOTIFICATIONS)
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
      <DropdownMenuContent align="end" className="w-[340px] p-0">
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
        <ul className="max-h-[320px] overflow-y-auto">
          {items.map((n) => {
            const Icon = KIND_ICON[n.kind]
            return (
              <li key={n.id} className={cn('border-b last:border-0', n.unread && 'bg-brand-50/50 dark:bg-brand-950/40')}>
                <div className="flex gap-3 px-4 py-3">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-muted text-ink-600 dark:text-ink-300">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold leading-snug text-ink-900 dark:text-white">{n.title}</p>
                    <p className="mt-0.5 text-[12px] leading-snug text-ink-500">{n.detail}</p>
                    <p className="mt-1 text-[11px] text-ink-400">{n.at}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link to="/admin/support">View all</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

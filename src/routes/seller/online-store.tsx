import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  BadgeCheck,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Lock,
  Palette,
  Rocket,
  Search,
  ShoppingCart,
  Sparkles,
  Store,
  TriangleAlert,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { DefinitionList, EmptyState, PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { ProductScene } from '@/components/marketing/scene'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { GENERATED_PAGES, STORE_THEMES } from '@/data/plans'
import { SELLER_PRODUCTS } from '@/data/seller'
import { usePlan, useStorefrontStore, useStoreUrl } from '@/store/storefront-store'
import { cn, money } from '@/lib/utils'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'customize', label: 'Customise' },
  { value: 'products', label: 'Products' },
  { value: 'domains', label: 'Domains' },
  { value: 'pages', label: 'Pages' },
]

export function SellerOnlineStorePage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const plan = usePlan()
  const { status, publish, unpublish } = useStorefrontStore()
  const storeUrl = useStoreUrl()
  const { config: dialog, open, setOpen, ask } = useActionDialog()

  const tab = search.tab ?? 'overview'
  const setTab = (value: string) => navigate(adminLinkProps({ to: '/seller/online-store', search: { tab: value } }))

  /* ------------------------------------------------- locked on Starter ---- */
  if (!plan.whiteLabel) {
    return (
      <>
        <PageHeader
          title="Online Store"
          description="Your own branded storefront, powered by the same catalogue and inventory."
          breadcrumb={[{ label: 'Dashboard', to: '/seller' }, { label: 'Online Store', to: '/seller/online-store' }]}
        />

        <Panel padded={false}>
          <EmptyState
            icon={Lock}
            title="Your own store comes with Growth"
            body="On Starter you sell on the SafalMarketHub marketplace. Upgrade to get a branded storefront on your own address — same products, same stock, lower fees on the customers you bring."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild>
                  <AdminLink to="/seller/plan">See plans from $12/mo</AdminLink>
                </Button>
                <Button variant="outline" asChild>
                  <AdminLink to="/seller/products">Back to products</AdminLink>
                </Button>
              </div>
            }
          />
        </Panel>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Store, title: 'Your brand, your address', body: 'yourbrand.safalmarkethub.store on Growth, your own domain on Pro.' },
            { icon: Palette, title: 'Themes, not page building', body: 'Pick a theme, add your logo and colours, publish. No website to design.' },
            { icon: Sparkles, title: 'Lower fees on your traffic', body: 'Marketplace commission drops, and own-store sales pay only 1–2%.' },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border bg-card p-5">
              <item.icon className="size-5 text-brand-600 dark:text-brand-300" />
              <p className="mt-3 text-[14px] font-semibold text-ink-900 dark:text-white">{item.title}</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-500">{item.body}</p>
            </div>
          ))}
        </div>
      </>
    )
  }

  /* ---------------------------------------------------- store management -- */
  return (
    <>
      <PageHeader
        title="Online Store"
        description={`Your branded storefront on ${plan.name}. Same catalogue, same stock, your own front door.`}
        breadcrumb={[{ label: 'Dashboard', to: '/seller' }, { label: 'Online Store', to: '/seller/online-store' }]}
        actions={
          <>
            <StatusBadge status={status === 'published' ? 'Active' : status === 'draft' ? 'Draft' : 'Not Submitted'} />
            <Button variant="outline" size="sm" asChild>
              <AdminLink to="/seller/online-store" search={{ tab: 'customize' }}>
                <Eye className="size-4" />
                Preview
              </AdminLink>
            </Button>
            {status === 'published' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  ask({
                    title: 'Take your store offline?',
                    description: `${storeUrl} will stop accepting orders. Marketplace listings are unaffected.`,
                    confirmLabel: 'Unpublish store',
                    destructive: true,
                    successMessage: 'Store unpublished',
                  })
                }
              >
                Unpublish
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  publish()
                  toast.success('Your store is live', { description: storeUrl })
                }}
              >
                <Rocket className="size-4" />
                Publish store
              </Button>
            )}
          </>
        }
      />

      {status !== 'published' && (
        <Alert variant="info" className="mb-5">
          <Rocket />
          <AlertTitle>Your store isn't live yet</AlertTitle>
          <AlertDescription>
            Set your branding, pick the products to sell, then publish. Nothing is visible to customers until you do.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-5">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <StoreOverview />
        </TabsContent>
        <TabsContent value="customize">
          <StoreCustomize />
        </TabsContent>
        <TabsContent value="products">
          <StoreProducts />
        </TabsContent>
        <TabsContent value="domains">
          <StoreDomains />
        </TabsContent>
        <TabsContent value="pages">
          <StorePages />
        </TabsContent>
      </Tabs>

      <ActionDialog config={dialog} open={open} onOpenChange={setOpen} onConfirm={() => unpublish()} />
    </>
  )
}

/* ------------------------------------------------------------- overview --- */
function StoreOverview() {
  const plan = usePlan()
  const { status, config, domainStatus, customDomain } = useStorefrontStore()
  const storeUrl = useStoreUrl()
  const liveProducts = SELLER_PRODUCTS.filter((p) => p.status === 'Active').length

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Panel title="Your storefront">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
          <Globe className="size-4 shrink-0 text-ink-400" />
          <span className="min-w-0 flex-1 truncate text-[14px] font-semibold tabular text-ink-900 dark:text-white">
            {storeUrl}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => toast.success('Store URL copied', { description: storeUrl })}
          >
            <Copy className="size-3.5" />
            Copy
          </Button>
          <Button variant="outline" size="sm" className="h-8" disabled={status !== 'published'}>
            <ExternalLink className="size-3.5" />
            Visit
          </Button>
        </div>

        <DefinitionList
          className="mt-5"
          items={[
            { label: 'Store name', value: config.name },
            { label: 'Theme', value: STORE_THEMES.find((t) => t.id === config.themeId)?.name ?? '—' },
            { label: 'Status', value: <StatusBadge status={status === 'published' ? 'Active' : 'Draft'} /> },
            {
              label: 'Address',
              value: domainStatus === 'verified' ? customDomain : `${config.slug}.safalmarkethub.store`,
              hint: plan.customDomain ? undefined : 'Custom domains need Pro',
            },
            { label: 'Products on this store', value: String(liveProducts) },
            {
              label: 'Branding',
              value: plan.removeBranding ? 'No SafalMarketHub badge' : '"Powered by SafalMarketHub" in footer',
            },
          ]}
        />
      </Panel>

      <div className="grid content-start gap-4">
        <Panel title="What this store costs you">
          <dl className="divide-y">
            <div className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0">
              <dt className="text-[13px] text-ink-600 dark:text-ink-300">Subscription</dt>
              <dd className="text-[13px] font-semibold tabular">{money(plan.price)}/mo</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[13px] text-ink-600 dark:text-ink-300">Fee on own-store sales</dt>
              <dd className="text-[13px] font-semibold tabular">{plan.ownStoreFee}%</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[13px] text-ink-600 dark:text-ink-300">Marketplace commission</dt>
              <dd className="text-[13px] font-semibold tabular">{plan.commission}%</dd>
            </div>
          </dl>
          <p className="mt-3 border-t pt-3 text-[12px] leading-relaxed text-ink-500">
            A {money(10000)} sale on your own store keeps {money(10000 - (10000 * (plan.ownStoreFee ?? 0)) / 100)} — versus{' '}
            {money(10000 - (10000 * plan.commission) / 100)} on the marketplace.
          </p>
          <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
            <AdminLink to="/seller/plan">Manage plan</AdminLink>
          </Button>
        </Panel>

        <Alert variant="default">
          <BadgeCheck />
          <AlertDescription>
            Orders from this store arrive in the same Orders screen, tagged <strong>Online Store</strong>, and settle
            through SafalMarketHub like any other sale.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ customise --- */
function StoreCustomize() {
  const plan = usePlan()
  const { config, updateConfig } = useStorefrontStore()
  const availableThemes = STORE_THEMES.filter((t) => (t.minPlan === 'pro' ? plan.customDomain : true))

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1.05fr]">
      <div className="grid content-start gap-4">
        <Panel title="Theme" description="Pick a professionally designed layout — no page building required.">
          <div className="grid gap-3 sm:grid-cols-2">
            {STORE_THEMES.map((theme) => {
              const locked = !availableThemes.includes(theme)
              const selected = config.themeId === theme.id
              return (
                <button
                  key={theme.id}
                  type="button"
                  disabled={locked}
                  onClick={() => updateConfig({ themeId: theme.id })}
                  className={cn(
                    'overflow-hidden rounded-lg border text-left transition-colors',
                    selected && 'border-brand-600 ring-1 ring-brand-600/20',
                    locked ? 'cursor-not-allowed opacity-60' : 'hover:border-ink-400'
                  )}
                >
                  <ProductScene glyph="headphones" tone={theme.tone} className="aspect-16/10" grain={false} />
                  <div className="p-3.5">
                    <p className="flex items-center justify-between gap-2 text-[13px] font-semibold text-ink-900 dark:text-white">
                      {theme.name}
                      {selected && <Check className="size-4 text-brand-600 dark:text-brand-300" />}
                      {locked && <Lock className="size-3.5 text-ink-400" />}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-ink-500">{theme.description}</p>
                    {locked && <p className="mt-1.5 text-[11px] font-semibold text-gold-600 dark:text-gold-400">Pro plan</p>}
                  </div>
                </button>
              )
            })}
          </div>
        </Panel>

        <Panel title="Brand">
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Store name">
              <Input value={config.name} onChange={(e) => updateConfig({ name: e.target.value })} />
            </Labeled>
            <Labeled label="Store address" hint="Generated from your store name.">
              <Input value={`${config.slug}.safalmarkethub.store`} readOnly className="bg-muted/60 tabular" />
            </Labeled>
            <Labeled label="Logo" hint="PNG or SVG, square, at least 400×400.">
              <div className="flex items-center gap-3">
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-lg text-[13px] font-bold text-white"
                  style={{ background: config.brandColor }}
                >
                  {config.logoText.slice(0, 3).toUpperCase()}
                </span>
                <Button variant="outline" size="sm" onClick={() => toast.success('Logo uploaded')}>
                  <Upload className="size-4" />
                  Upload
                </Button>
              </div>
            </Labeled>
            <Labeled label="Logo text" hint="Used until a logo is uploaded.">
              <Input value={config.logoText} onChange={(e) => updateConfig({ logoText: e.target.value })} maxLength={6} />
            </Labeled>
            <Labeled label="Brand colour">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.brandColor}
                  onChange={(e) => updateConfig({ brandColor: e.target.value })}
                  aria-label="Brand colour"
                  className="size-10 cursor-pointer rounded-sm border bg-background"
                />
                <Input value={config.brandColor} onChange={(e) => updateConfig({ brandColor: e.target.value })} className="tabular" />
              </div>
            </Labeled>
            <Labeled label="Accent colour">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.accentColor}
                  onChange={(e) => updateConfig({ accentColor: e.target.value })}
                  aria-label="Accent colour"
                  className="size-10 cursor-pointer rounded-sm border bg-background"
                />
                <Input value={config.accentColor} onChange={(e) => updateConfig({ accentColor: e.target.value })} className="tabular" />
              </div>
            </Labeled>
            <Labeled label="Font">
              <div className="flex gap-2">
                {(['Inter', 'Sora', 'Playfair'] as const).map((font) => (
                  <button
                    key={font}
                    type="button"
                    onClick={() => updateConfig({ font })}
                    className={cn(
                      'rounded-sm border px-3.5 py-2 text-[13px] font-semibold transition-colors',
                      config.font === font
                        ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                        : 'border-input text-ink-700 hover:border-ink-400 dark:text-ink-200'
                    )}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </Labeled>
          </div>
        </Panel>

        <Panel title="Banner & description">
          <div className="grid gap-4">
            <Labeled label="Banner headline">
              <Input value={config.bannerHeadline} onChange={(e) => updateConfig({ bannerHeadline: e.target.value })} />
            </Labeled>
            <Labeled label="Banner subtext">
              <Input value={config.bannerSub} onChange={(e) => updateConfig({ bannerSub: e.target.value })} />
            </Labeled>
            <Labeled label="Store description" hint="Shown on your About page and in search results.">
              <Textarea rows={3} value={config.description} onChange={(e) => updateConfig({ description: e.target.value })} />
            </Labeled>
          </div>
        </Panel>

        <Panel title="Contact & social">
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Support email">
              <Input value={config.supportEmail} onChange={(e) => updateConfig({ supportEmail: e.target.value })} />
            </Labeled>
            <Labeled label="Support phone">
              <Input value={config.supportPhone} onChange={(e) => updateConfig({ supportPhone: e.target.value })} />
            </Labeled>
            <Labeled label="Instagram">
              <Input value={config.instagram} onChange={(e) => updateConfig({ instagram: e.target.value })} />
            </Labeled>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t pt-5">
            <Button onClick={() => toast.success('Store settings saved')}>Save changes</Button>
            <span className="text-[12px] text-ink-500">Changes appear in the preview immediately.</span>
          </div>
        </Panel>
      </div>

      {/* Live preview */}
      <div className="xl:sticky xl:top-24 xl:self-start">
        <StorePreview />
      </div>
    </div>
  )
}

/** A miniature of the generated storefront, driven by the seller's own settings. */
function StorePreview() {
  const plan = usePlan()
  const { config } = useStorefrontStore()
  const storeUrl = useStoreUrl()
  const products = SELLER_PRODUCTS.filter((p) => p.status === 'Active').slice(0, 4)
  const fontFamily =
    config.font === 'Playfair' ? 'Georgia, serif' : config.font === 'Sora' ? 'system-ui, sans-serif' : 'inherit'

  return (
    <Panel title="Preview" description="This is what your customers will see." padded={false}>
      <div className="overflow-hidden rounded-b-lg" style={{ fontFamily }}>
        {/* browser chrome */}
        <div className="flex items-center gap-3 border-b bg-muted/60 px-4 py-2.5">
          <span className="flex gap-1.5">
            <span className="size-2 rounded-full bg-ink-300" />
            <span className="size-2 rounded-full bg-ink-300" />
            <span className="size-2 rounded-full bg-ink-300" />
          </span>
          <span className="mx-auto flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-[10px] tabular text-ink-500">
            <Lock className="size-2.5" />
            {storeUrl}
          </span>
        </div>

        <div className="bg-background">
          {/* store header — the seller's brand, not ours */}
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <span
              className="grid size-7 shrink-0 place-items-center rounded-md text-[10px] font-bold text-white"
              style={{ background: config.brandColor }}
            >
              {config.logoText.slice(0, 3).toUpperCase()}
            </span>
            <span className="text-[13px] font-bold tracking-[-0.01em] text-ink-950 dark:text-white">{config.name}</span>
            <nav className="ml-4 hidden gap-3 text-[11px] text-ink-500 sm:flex">
              <span>Home</span>
              <span>Shop</span>
              <span>Categories</span>
              <span>About</span>
            </nav>
            <span className="ml-auto flex items-center gap-2 text-ink-400">
              <Search className="size-3.5" />
              <ShoppingCart className="size-3.5" />
            </span>
          </div>

          {/* banner */}
          <div
            className="px-5 py-7"
            style={{ background: `linear-gradient(135deg, ${config.brandColor}14, ${config.accentColor}0F)` }}
          >
            <p className="text-[17px] font-bold leading-tight tracking-[-0.02em] text-ink-950 dark:text-white">
              {config.bannerHeadline}
            </p>
            <p className="mt-1.5 max-w-[320px] text-[11px] leading-relaxed text-ink-600 dark:text-ink-300">
              {config.bannerSub}
            </p>
            <span
              className="mt-3.5 inline-block rounded-md px-3 py-1.5 text-[11px] font-semibold text-white"
              style={{ background: config.brandColor }}
            >
              Shop now
            </span>
          </div>

          {/* products */}
          <div className="grid grid-cols-2 gap-2.5 p-4 sm:grid-cols-4">
            {products.map((p) => (
              <div key={p.id}>
                <ProductScene glyph={p.glyph} tone={p.tone} className="aspect-square rounded-md" grain={false} />
                <p className="mt-1.5 line-clamp-1 text-[10px] font-semibold text-ink-900 dark:text-white">{p.name}</p>
                <p className="text-[10px] font-bold tabular" style={{ color: config.brandColor }}>
                  {money(p.price)}
                </p>
              </div>
            ))}
          </div>

          {/* footer — badge only on Growth */}
          <div className="border-t px-4 py-3 text-center">
            <p className="text-[10px] text-ink-500">
              © 2026 {config.name} · {config.supportEmail}
            </p>
            {!plan.removeBranding && (
              <p className="mt-1 text-[10px] font-semibold text-ink-400">Powered by SafalMarketHub</p>
            )}
          </div>
        </div>
      </div>
    </Panel>
  )
}

/* ------------------------------------------------- products per channel --- */
function StoreProducts() {
  const { channelPricing, setChannel } = useStorefrontStore()

  return (
    <Panel
      title="Products on your store"
      description="One catalogue. Choose which products appear on your own store and at what price — stock stays shared."
      padded={false}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Marketplace</TableHead>
            <TableHead className="text-right">Your store</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Shared stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SELLER_PRODUCTS.map((product) => {
            const channels = channelPricing[product.id] ?? {
              marketplace: { on: true, price: product.price },
              store: { on: true, price: product.price },
            }
            return (
              <TableRow key={product.id}>
                <TableCell>
                  <span className="block max-w-[280px]">
                    <span className="block truncate font-semibold text-ink-900 dark:text-white">{product.name}</span>
                    <span className="block text-[11px] text-ink-500 tabular">{product.sku}</span>
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <ChannelCell
                    on={channels.marketplace.on}
                    price={channels.marketplace.price || product.price}
                    onToggle={(on) => setChannel(product.id, 'marketplace', { on, price: channels.marketplace.price || product.price })}
                    onPrice={(price) => setChannel(product.id, 'marketplace', { price })}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <ChannelCell
                    on={channels.store.on}
                    price={channels.store.price || product.price}
                    onToggle={(on) => setChannel(product.id, 'store', { on, price: channels.store.price || product.price })}
                    onPrice={(price) => setChannel(product.id, 'store', { price })}
                  />
                </TableCell>
                <TableCell className="hidden text-right sm:table-cell">
                  <span className="font-semibold tabular">{product.available}</span>
                  <span className="block text-[11px] text-ink-400">across all channels</span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <div className="border-t bg-muted/40 px-5 py-3">
        <p className="text-[12px] text-ink-500">
          Inventory is shared: a unit sold on either channel reduces the same stock count. Separate per-channel stock can
          come later.
        </p>
      </div>
    </Panel>
  )
}

function ChannelCell({
  on,
  price,
  onToggle,
  onPrice,
}: {
  on: boolean
  price: number
  onToggle: (on: boolean) => void
  onPrice: (price: number) => void
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onToggle(!on)}
        className={cn(
          'inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors',
          on ? 'bg-teal-500' : 'bg-ink-300 dark:bg-ink-700'
        )}
      >
        <span className={cn('size-4 rounded-full bg-white transition-transform', on ? 'translate-x-4' : 'translate-x-0')} />
      </button>
      <Input
        type="number"
        value={price}
        disabled={!on}
        onChange={(e) => onPrice(Number(e.target.value))}
        className="h-9 w-[104px] text-right text-[12px] tabular"
      />
    </div>
  )
}

/* -------------------------------------------------------------- domains --- */
function StoreDomains() {
  const plan = usePlan()
  const { config, customDomain, domainStatus, connectDomain, verifyDomain, removeDomain } = useStorefrontStore()
  const [input, setInput] = useState('')

  const dnsRows = [
    { type: 'A', name: '@', value: '76.76.21.21' },
    { type: 'CNAME', name: 'www', value: `${config.slug}.safalmarkethub.store` },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <div className="grid content-start gap-4">
        <Panel title="Default address" description="Free with every white-label plan.">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
            <Globe className="size-4 shrink-0 text-ink-400" />
            <span className="min-w-0 flex-1 truncate text-[14px] font-semibold tabular text-ink-900 dark:text-white">
              {config.slug}.safalmarkethub.store
            </span>
            <StatusBadge status="Active" />
          </div>
        </Panel>

        <Panel title="Custom domain" description="Your own address, with no SafalMarketHub name in it.">
          {!plan.customDomain ? (
            <Alert variant="warning">
              <Lock />
              <AlertTitle>Custom domains are a Pro feature</AlertTitle>
              <AlertDescription>
                Upgrade to Pro to point www.yourbrand.com at this store and drop the "Powered by" badge.{' '}
                <AdminLink to="/seller/plan" className="font-semibold underline">
                  See Pro
                </AdminLink>
              </AlertDescription>
            </Alert>
          ) : domainStatus === 'none' ? (
            <div>
              <Labeled label="Your domain" hint="Enter the domain you already own, without https://">
                <div className="flex flex-wrap gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="www.abcelectronics.com"
                    className="max-w-[320px]"
                  />
                  <Button
                    disabled={!input.includes('.')}
                    onClick={() => {
                      connectDomain(input)
                      toast.success('Domain added', { description: 'Add the DNS records to finish verification.' })
                    }}
                  >
                    Connect my domain
                  </Button>
                </div>
              </Labeled>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
                <Globe className="size-4 shrink-0 text-ink-400" />
                <span className="min-w-0 flex-1 truncate text-[14px] font-semibold tabular text-ink-900 dark:text-white">
                  {customDomain}
                </span>
                <StatusBadge status={domainStatus === 'verified' ? 'Verified' : 'Pending'} />
              </div>

              {domainStatus === 'pending' && (
                <>
                  <p className="mt-5 text-[13px] font-semibold text-ink-900 dark:text-white">
                    Add these records at your domain registrar
                  </p>
                  <div className="mt-3 overflow-hidden rounded-lg border">
                    <table className="w-full text-left text-[13px]">
                      <thead className="bg-muted/60">
                        <tr className="text-[11px] uppercase tracking-[0.06em] text-ink-500">
                          <th className="px-4 py-2.5 font-bold">Type</th>
                          <th className="px-4 py-2.5 font-bold">Name</th>
                          <th className="px-4 py-2.5 font-bold">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dnsRows.map((row) => (
                          <tr key={row.type} className="border-t">
                            <td className="px-4 py-2.5 font-semibold tabular">{row.type}</td>
                            <td className="px-4 py-2.5 tabular">{row.name}</td>
                            <td className="px-4 py-2.5">
                              <span className="flex items-center gap-2">
                                <span className="truncate tabular">{row.value}</span>
                                <button
                                  type="button"
                                  aria-label={`Copy ${row.type} value`}
                                  onClick={() => toast.success('Copied')}
                                  className="text-ink-400 hover:text-ink-800 dark:hover:text-white"
                                >
                                  <Copy className="size-3.5" />
                                </button>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3 text-[12px] text-ink-500">
                    DNS changes can take up to 24 hours to propagate. We'll issue an SSL certificate automatically once
                    the records resolve.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      onClick={() => {
                        verifyDomain()
                        toast.success('Domain verified', { description: customDomain })
                      }}
                    >
                      Verify now
                    </Button>
                    <Button variant="ghost" onClick={removeDomain}>
                      Remove domain
                    </Button>
                  </div>
                </>
              )}

              {domainStatus === 'verified' && (
                <>
                  <Alert variant="success" className="mt-5">
                    <BadgeCheck />
                    <AlertTitle>Your domain is live</AlertTitle>
                    <AlertDescription>
                      Customers visiting {customDomain} now see your store. SSL is active and the SafalMarketHub
                      subdomain redirects here.
                    </AlertDescription>
                  </Alert>
                  <Button variant="ghost" size="sm" className="mt-4" onClick={removeDomain}>
                    Disconnect domain
                  </Button>
                </>
              )}
            </div>
          )}
        </Panel>
      </div>

      <Panel title="What customers see">
        <ul className="grid gap-3">
          {[
            { label: 'Your brand in the address bar', ok: domainStatus === 'verified' },
            { label: 'Your logo and colours', ok: true },
            { label: 'Your own cart and checkout', ok: true },
            { label: 'No "Powered by SafalMarketHub"', ok: plan.removeBranding },
            { label: 'Your support email on every order', ok: true },
          ].map((item) => (
            <li key={item.label} className="flex items-start gap-2.5 text-[13px] text-ink-700 dark:text-ink-200">
              {item.ok ? (
                <Check className="mt-0.5 size-4 shrink-0 text-teal-500" strokeWidth={2.6} />
              ) : (
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-gold-500" />
              )}
              {item.label}
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t pt-4 text-[12px] leading-relaxed text-ink-500">
          Payments still run through SafalMarketHub, so refunds, returns and settlements stay in one place.
        </p>
      </Panel>
    </div>
  )
}

/* ---------------------------------------------------------------- pages --- */
function StorePages() {
  const { config, updateConfig } = useStorefrontStore()

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Panel title="Pages we generate" description="Every storefront gets these automatically — there is nothing to build.">
        <ul className="grid gap-2 sm:grid-cols-2">
          {GENERATED_PAGES.map((page) => (
            <li key={page} className="flex items-center gap-2.5 rounded-sm border px-3.5 py-2.5">
              <Check className="size-4 shrink-0 text-teal-500" strokeWidth={2.6} />
              <span className="text-[13px] text-ink-700 dark:text-ink-200">{page}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Policies" description="Your business details fill the legal pages.">
        <p className="text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">
          Privacy, Terms, Shipping and Return pages are pre-written from SafalMarketHub's templates and your business
          information. Review them before publishing — they appear under your brand, not ours.
        </p>
        <div className="mt-5 grid gap-2">
          {['Privacy Policy', 'Terms & Conditions', 'Shipping Policy', 'Return Policy'].map((policy) => (
            <div key={policy} className="flex items-center justify-between gap-3 rounded-sm border px-3.5 py-2.5">
              <span className="text-[13px] font-medium text-ink-800 dark:text-ink-100">{policy}</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={config.policiesConfigured ? 'Verified' : 'Pending'} />
                <Button variant="ghost" size="sm" className="h-8">
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button
          className="mt-5"
          variant="outline"
          onClick={() => {
            updateConfig({ policiesConfigured: true })
            toast.success('Policies marked as reviewed')
          }}
        >
          Mark policies as reviewed
        </Button>
      </Panel>
    </div>
  )
}

function Labeled({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return (
    <div>
      <Label htmlFor={id} className="mb-[7px]">
        {label}
      </Label>
      {children}
      {hint && <p className="mt-[7px] text-[12px] text-ink-500">{hint}</p>}
    </div>
  )
}

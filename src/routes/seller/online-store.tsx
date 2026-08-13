import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  GripVertical,
  Lock,
  Palette,
  Pause,
  Play,
  Rocket,
  Sparkles,
  Store,
  TrendingUp,
  TriangleAlert,
  Upload,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { toast } from 'sonner'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { DefinitionList, EmptyState, PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { ProductScene } from '@/components/marketing/scene'
import { StorePreview } from '@/components/seller/store-preview'
import { StoreQr } from '@/components/seller/store-qr'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  COLLECTION_RULES,
  POLICY_TEMPLATES,
  STORE_ANALYTICS,
  STORE_TRAFFIC_14D,
  STORE_TRAFFIC_SOURCES,
  type Collection,
} from '@/data/marketing'
import { GENERATED_PAGES, STORE_THEMES } from '@/data/plans'
import { SELLER_PRODUCTS } from '@/data/seller'
import { usePlan, usePolicyProgress, useStorefrontStore, useStoreUrl } from '@/store/storefront-store'
import { cn, money } from '@/lib/utils'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'customize', label: 'Customise' },
  { value: 'homepage', label: 'Homepage' },
  { value: 'collections', label: 'Collections' },
  { value: 'products', label: 'Products' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'domains', label: 'Domains' },
  { value: 'pages', label: 'Pages' },
]

export function SellerOnlineStorePage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const plan = usePlan()
  const { status, pauseMessage, publish, unpublish, pauseStore, resumeStore } = useStorefrontStore()
  const storeUrl = useStoreUrl()
  const { config: dialog, open, setOpen, ask } = useActionDialog()
  // The shared dialog serves both pause and unpublish, so remember which one asked.
  const [intent, setIntent] = useState<'pause' | 'unpublish'>('unpublish')

  const tab = search.tab ?? 'overview'
  const setTab = (value: string) => navigate(adminLinkProps({ to: '/seller/online-store', search: { tab: value } }))

  /* ---------------------------------------------------- locked on Free ---- */
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
            body="On the Free plan you sell on the SafalMarketHub marketplace. Upgrade to get a branded storefront on your own address — same products, same stock, lower fees on the customers you bring. You can build it free for 14 days before you subscribe."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild>
                  <AdminLink to="/seller/online-store/setup">Start free trial</AdminLink>
                </Button>
                <Button variant="outline" asChild>
                  <AdminLink to="/seller/plan">See plans from $12/mo</AdminLink>
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
            <StatusBadge
              status={
                status === 'published'
                  ? 'Published'
                  : status === 'paused'
                    ? 'Paused'
                    : status === 'draft'
                      ? 'Draft'
                      : 'Not Started'
              }
            />
            <Button variant="outline" size="sm" asChild>
              <AdminLink to="/seller/online-store/setup" search={{ step: 'preview' }}>
                <Eye className="size-4" />
                Preview
              </AdminLink>
            </Button>
            {status === 'paused' ? (
              <Button
                size="sm"
                onClick={() => {
                  resumeStore()
                  toast.success('Store is accepting orders again')
                }}
              >
                <Play className="size-4" />
                Resume store
              </Button>
            ) : status === 'published' ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIntent('pause')
                    ask({
                      title: 'Pause your store?',
                      description:
                        'Customers can still browse, but checkout is disabled and a notice appears at the top. Your marketplace listings are unaffected.',
                      confirmLabel: 'Pause store',
                      reasons: [
                        'On holiday — back soon',
                        'Restocking inventory',
                        'Festival break',
                        'Temporarily not taking orders',
                      ],
                      reasonLabel: 'Message to show customers',
                      successMessage: 'Store paused',
                    })
                  }}
                >
                  <Pause className="size-4" />
                  Pause
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIntent('unpublish')
                    ask({
                      title: 'Take your store offline?',
                      description: `${storeUrl} will stop accepting orders. Marketplace listings are unaffected.`,
                      confirmLabel: 'Unpublish store',
                      destructive: true,
                      successMessage: 'Store unpublished',
                    })
                  }}
                >
                  Unpublish
                </Button>
              </>
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

      {status === 'paused' && (
        <Alert variant="warning" className="mb-5">
          <Pause />
          <AlertTitle>Your store is paused</AlertTitle>
          <AlertDescription>
            {pauseMessage || 'Customers can browse but cannot place orders.'} Marketplace orders continue as normal.
          </AlertDescription>
        </Alert>
      )}

      {status !== 'published' && status !== 'paused' && (
        <Alert variant="info" className="mb-5">
          <Rocket />
          <AlertTitle>Your store isn't live yet</AlertTitle>
          <AlertDescription>
            Walk through setup — branding, homepage, products, policies — then preview and publish. Nothing is visible
            to customers until you do.
            <span className="mt-3 flex">
              <Button size="sm" asChild>
                <AdminLink to="/seller/online-store/setup">Open store setup</AdminLink>
              </Button>
            </span>
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
        <TabsContent value="homepage">
          <StoreHomepage />
        </TabsContent>
        <TabsContent value="collections">
          <StoreCollections />
        </TabsContent>
        <TabsContent value="products">
          <StoreProducts />
        </TabsContent>
        <TabsContent value="analytics">
          <StoreAnalytics />
        </TabsContent>
        <TabsContent value="domains">
          <StoreDomains />
        </TabsContent>
        <TabsContent value="pages">
          <StorePages />
        </TabsContent>
      </Tabs>

      <ActionDialog
        config={dialog}
        open={open}
        onOpenChange={setOpen}
        onConfirm={(result) => (intent === 'pause' ? pauseStore(result.reason) : unpublish())}
      />
    </>
  )
}

/* ------------------------------------------------------------- overview --- */
function StoreOverview() {
  const plan = usePlan()
  const { status, config, domainStatus, customDomain } = useStorefrontStore()
  const storeUrl = useStoreUrl()
  const policyProgress = usePolicyProgress()
  const liveProducts = SELLER_PRODUCTS.filter((p) => p.status === 'Active').length

  return (
    <div className="grid gap-4">
      {/* The four numbers that answer "is this store working?" */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Visitors" value={STORE_ANALYTICS.visitors.toLocaleString('en-US')} previous={STORE_ANALYTICS.previous.visitors} current={STORE_ANALYTICS.visitors} />
        <MetricCard label="Orders" value={String(STORE_ANALYTICS.orders)} previous={STORE_ANALYTICS.previous.orders} current={STORE_ANALYTICS.orders} />
        <MetricCard label="Sales" value={money(STORE_ANALYTICS.sales)} previous={STORE_ANALYTICS.previous.sales} current={STORE_ANALYTICS.sales} />
        <MetricCard label="Conversion" value={`${STORE_ANALYTICS.conversion}%`} previous={STORE_ANALYTICS.previous.conversion} current={STORE_ANALYTICS.conversion} />
      </div>

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
              label: 'Policies',
              value: policyProgress.complete ? 'All four written' : `${policyProgress.done} of ${policyProgress.total} written`,
              hint: policyProgress.complete ? undefined : 'Finish these before publishing',
            },
            {
              label: 'Branding',
              value: plan.removeBranding ? 'No SafalMarketHub badge' : '"Powered by SafalMarketHub" in footer',
            },
          ]}
        />

        {/* Print it, stick it on the counter, put it in a story. */}
        <div className="mt-5 flex flex-wrap items-center gap-5 border-t pt-5">
          <div className="rounded-lg border bg-white p-2">
            <StoreQr url={storeUrl} size={116} />
          </div>
          <div className="min-w-[200px] flex-1">
            <p className="text-[13px] font-semibold text-ink-900 dark:text-white">QR code for your store</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
              Generated from your address. Print it for the counter, add it to packaging, or share it in a story —
              scanning opens your storefront.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.success('QR code downloaded', { description: `${config.slug}-store-qr.svg` })}>
                Download SVG
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toast.success('Store link copied', { description: storeUrl })}>
                <Copy className="size-3.5" />
                Copy link
              </Button>
            </div>
          </div>
        </div>
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
            A {money(1000)} sale on your own store keeps {money(1000 - (1000 * (plan.ownStoreFee ?? 0)) / 100)} — versus{' '}
            {money(1000 - (1000 * plan.commission) / 100)} on the marketplace.
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
    </div>
  )
}

/** A number with its own trend, so "3,480 visitors" means something. */
function MetricCard({
  label,
  value,
  current,
  previous,
}: {
  label: string
  value: string
  current: number
  previous: number
}) {
  const delta = previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100)
  const up = delta >= 0

  return (
    <div className="rounded-lg border bg-card p-4 shadow-xs">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">{label}</p>
      <p className="mt-2 text-[24px] font-bold leading-none tabular text-ink-950 dark:text-white">{value}</p>
      <p
        className={cn(
          'mt-2 flex items-center gap-1 text-[11px] font-semibold tabular',
          up ? 'text-teal-600 dark:text-teal-100' : 'text-red-600 dark:text-red-300'
        )}
      >
        <TrendingUp className={cn('size-3.5', !up && 'rotate-180')} />
        {up ? '+' : ''}
        {delta}% vs last period
      </p>
    </div>
  )
}

/* ------------------------------------------------------------- homepage --- */
function StoreHomepage() {
  const { config, updateConfig, homepageSections, toggleSection, moveSection } = useStorefrontStore()

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <div className="grid content-start gap-4">
        <Panel
          title="Homepage sections"
          description="Turn sections on or off and put them in the order you want. That is the whole layout tool — no page building."
        >
          <ul className="grid gap-2">
            {homepageSections.map((section, i) => (
              <li key={section.id} className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5">
                <GripVertical className="size-4 shrink-0 text-ink-300" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-ink-900 dark:text-white">{section.label}</span>
                  <span className="block text-[11px] text-ink-500">{section.hint}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label={`Move ${section.label} up`}
                    disabled={i === 0}
                    onClick={() => moveSection(section.id, -1)}
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label={`Move ${section.label} down`}
                    disabled={i === homepageSections.length - 1}
                    onClick={() => moveSection(section.id, 1)}
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                  <Switch
                    checked={section.on}
                    disabled={section.locked}
                    aria-label={`Show ${section.label}`}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-ink-500">The hero banner is always shown — it is your store's front door.</p>
        </Panel>

        <Panel title="Announcement bar" description="One message, above everything else.">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="ann-toggle" className="text-[13px]">
              Show the announcement bar
            </Label>
            <Switch
              id="ann-toggle"
              checked={config.announcement.on}
              onCheckedChange={(on) => updateConfig({ announcement: { ...config.announcement, on } })}
            />
          </div>
          <div className="mt-4">
            <Labeled label="Message">
              <Input
                value={config.announcement.text}
                maxLength={80}
                onChange={(e) => updateConfig({ announcement: { ...config.announcement, text: e.target.value } })}
              />
            </Labeled>
          </div>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <AdminLink to="/seller/marketing" search={{ tab: 'announcement' }}>
              More marketing tools
            </AdminLink>
          </Button>
        </Panel>
      </div>

      <div className="xl:sticky xl:top-24 xl:self-start">
        <Panel title="Live preview" padded={false}>
          <StorePreview />
        </Panel>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- collections --- */
function StoreCollections() {
  const { collections, addCollection, updateCollection, removeCollection } = useStorefrontStore()
  const [name, setName] = useState('')
  const [rule, setRule] = useState<Collection['rule']>('newest')
  const [ruleValue, setRuleValue] = useState('25')

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <Panel
        title="Collections"
        description="Group products so customers can browse the way they shop — instead of you designing pages."
        padded={false}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Collection</TableHead>
              <TableHead className="hidden sm:table-cell">Fills by</TableHead>
              <TableHead className="text-right">Products</TableHead>
              <TableHead className="text-right">Shown</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.map((collection) => (
              <TableRow key={collection.id}>
                <TableCell>
                  <span className="block font-semibold text-ink-900 dark:text-white">{collection.name}</span>
                  {collection.system && <span className="block text-[11px] text-ink-500">Built in</span>}
                </TableCell>
                <TableCell className="hidden text-[12px] text-ink-600 sm:table-cell dark:text-ink-300">
                  {COLLECTION_RULES.find((r) => r.id === collection.rule)?.label}
                  {collection.rule === 'under-price' && collection.ruleValue ? ` · ${money(collection.ruleValue)}` : ''}
                </TableCell>
                <TableCell className="text-right tabular">{collection.productCount}</TableCell>
                <TableCell className="text-right">
                  <Switch
                    checked={collection.visible}
                    aria-label={`Show ${collection.name} on the storefront`}
                    onCheckedChange={(visible) => updateCollection(collection.id, { visible })}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-red-600 hover:text-red-700 dark:text-red-300"
                    disabled={collection.system}
                    onClick={() => {
                      removeCollection(collection.id)
                      toast.success(`${collection.name} deleted`)
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <Panel title="New collection">
        <div className="grid gap-4">
          <Labeled label="Collection name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer Collection" />
          </Labeled>

          <div>
            <Label className="mb-[7px]">How it fills</Label>
            <div className="grid gap-2">
              {COLLECTION_RULES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRule(option.id)}
                  className={cn(
                    'rounded-lg border px-3.5 py-2.5 text-left transition-colors',
                    rule === option.id ? 'border-brand-600 ring-1 ring-brand-600/20' : 'hover:border-ink-400'
                  )}
                >
                  <span className="block text-[13px] font-semibold text-ink-900 dark:text-white">{option.label}</span>
                  <span className="block text-[11px] text-ink-500">{option.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {rule === 'under-price' && (
            <Labeled label="Price ceiling">
              <Input type="number" value={ruleValue} onChange={(e) => setRuleValue(e.target.value)} className="tabular" />
            </Labeled>
          )}

          <Button
            disabled={!name.trim()}
            onClick={() => {
              addCollection({
                name: name.trim(),
                rule,
                ruleValue: rule === 'under-price' ? Number(ruleValue) || 0 : undefined,
                productIds: [],
                productCount: rule === 'manual' ? 0 : 5,
                visible: true,
              })
              setName('')
              toast.success('Collection created')
            }}
          >
            Create collection
          </Button>
        </div>
      </Panel>
    </div>
  )
}

/* ------------------------------------------------------------ analytics --- */
function StoreAnalytics() {
  const plan = usePlan()
  const best = [...SELLER_PRODUCTS].sort((a, b) => b.sold - a.sold)[0]

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Visitors" value={STORE_ANALYTICS.visitors.toLocaleString('en-US')} current={STORE_ANALYTICS.visitors} previous={STORE_ANALYTICS.previous.visitors} />
        <MetricCard label="Orders" value={String(STORE_ANALYTICS.orders)} current={STORE_ANALYTICS.orders} previous={STORE_ANALYTICS.previous.orders} />
        <MetricCard label="Sales" value={money(STORE_ANALYTICS.sales)} current={STORE_ANALYTICS.sales} previous={STORE_ANALYTICS.previous.sales} />
        <MetricCard label="Conversion" value={`${STORE_ANALYTICS.conversion}%`} current={STORE_ANALYTICS.conversion} previous={STORE_ANALYTICS.previous.conversion} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Panel title="Visitors & orders" description="Last 14 days on your own store.">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={STORE_TRAFFIC_14D} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} interval={2} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-card)',
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="visitors" stroke="var(--color-brand-500)" strokeWidth={2} fill="url(#visitorsFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="grid content-start gap-4">
          <Panel title="Where visitors came from">
            <ul className="grid gap-3">
              {STORE_TRAFFIC_SOURCES.map((source) => {
                const share = Math.round((source.visitors / STORE_ANALYTICS.visitors) * 100)
                return (
                  <li key={source.source}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[13px] text-ink-700 dark:text-ink-200">{source.source}</span>
                      <span className="text-[12px] font-semibold tabular text-ink-900 dark:text-white">
                        {source.visitors.toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-200 dark:bg-secondary">
                      <div className="h-full rounded-full bg-brand-600" style={{ width: `${share}%` }} />
                    </div>
                    <p className="mt-1 text-[11px] text-ink-500 tabular">{source.orders} orders</p>
                  </li>
                )
              })}
            </ul>
          </Panel>

          <Panel title="Best seller">
            {best && (
              <div className="flex items-center gap-3">
                <ProductScene glyph={best.glyph} tone={best.tone} className="size-14 shrink-0 rounded-md" grain={false} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink-900 dark:text-white">{best.name}</p>
                  <p className="mt-0.5 text-[12px] text-ink-500 tabular">{best.sold} sold · {money(best.price)}</p>
                </div>
              </div>
            )}
          </Panel>

          {plan.analytics !== 'Advanced' && (
            <Alert variant="info">
              <TrendingUp />
              <AlertTitle>{plan.analytics} analytics</AlertTitle>
              <AlertDescription>
                Pro adds product-level funnels, repeat-customer rates and export.{' '}
                <AdminLink to="/seller/plan" className="font-semibold underline">
                  Compare plans
                </AdminLink>
              </AlertDescription>
            </Alert>
          )}
        </div>
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
  const { policies, setPolicy } = useStorefrontStore()
  const progress = usePolicyProgress()

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

      <Panel title="Policies" description="Start from a template, edit to match how you actually trade.">
        <p className="text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">
          These four pages appear under your brand, not ours. Each has a SafalMarketHub template you can use as-is or
          rewrite.
        </p>
        <div className="mt-5 grid gap-4">
          {POLICY_TEMPLATES.map((policy) => (
            <div key={policy.key} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink-900 dark:text-white">{policy.label}</p>
                  <p className="mt-0.5 text-[11px] text-ink-500">{policy.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={policies[policy.key].trim() ? 'Verified' : 'Pending'} />
                  <Button variant="outline" size="sm" className="h-8" onClick={() => setPolicy(policy.key, policy.template)}>
                    Use template
                  </Button>
                </div>
              </div>
              <Textarea
                rows={3}
                className="mt-3"
                placeholder="Write your policy, or start from the template."
                value={policies[policy.key]}
                onChange={(e) => setPolicy(policy.key, e.target.value)}
              />
            </div>
          ))}
        </div>
        <p className="mt-4 text-[12px] text-ink-500">
          {progress.complete
            ? 'All four policies are written — your store is ready to publish.'
            : `${progress.done} of ${progress.total} written. Publishing works either way, but customers trust a store that says how returns work.`}
        </p>
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

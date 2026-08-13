import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  Globe,
  GripVertical,
  Lock,
  Monitor,
  Rocket,
  Smartphone,
  Sparkles,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { PageHeader, Panel } from '@/components/admin/primitives'
import { StorePreview } from '@/components/seller/store-preview'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { POLICY_TEMPLATES } from '@/data/marketing'
import { STORE_THEMES, TRIAL_DAYS } from '@/data/plans'
import { SELLER_PRODUCTS } from '@/data/seller'
import { ProductScene } from '@/components/marketing/scene'
import { usePlan, useStorefrontStore, useStoreUrl, useTrial, type SetupStepId } from '@/store/storefront-store'
import { cn, money } from '@/lib/utils'

/* ==========================================================================
   Online Store → Setup.

   Six steps, in the order a seller thinks about them. No page builder: they
   name the store, brand it, choose which sections appear, decide what sells
   where, get their address, then preview and publish.
   ========================================================================== */

const STEPS: { id: SetupStepId; label: string; blurb: string }[] = [
  { id: 'details', label: 'Store Details', blurb: 'Name, description, logo and favicon.' },
  { id: 'branding', label: 'Branding', blurb: 'Colours, font and theme.' },
  { id: 'homepage', label: 'Homepage', blurb: 'Banner, sections and announcement bar.' },
  { id: 'selling', label: 'Selling Settings', blurb: 'Products, shipping and policies.' },
  { id: 'url', label: 'Store URL', blurb: 'Your address on the web.' },
  { id: 'preview', label: 'Preview', blurb: 'Look it over, then publish.' },
]

export function SellerStoreSetupPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const trial = useTrial()
  const { completedSteps, completeStep } = useStorefrontStore()

  const stepId = (search.step as SetupStepId) ?? 'details'
  const index = Math.max(0, STEPS.findIndex((s) => s.id === stepId))
  const step = STEPS[index]

  const go = (id: SetupStepId) => navigate(adminLinkProps({ to: '/seller/online-store/setup', search: { step: id } }))

  const next = () => {
    completeStep(step.id)
    if (index < STEPS.length - 1) go(STEPS[index + 1].id)
  }

  /* ------------------------------------------ trial gate: build before pay -- */
  if (!trial.canBuild) {
    return (
      <>
        <PageHeader
          title="Create your online store"
          description="Build the whole thing first. You only need a subscription when you're ready to publish."
          breadcrumb={[
            { label: 'Dashboard', to: '/seller' },
            { label: 'Online Store', to: '/seller/online-store' },
            { label: 'Setup', to: '/seller/online-store/setup' },
          ]}
        />

        <Panel className="mx-auto max-w-[680px] text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
            <Sparkles className="size-6" />
          </span>
          <h2 className="mt-4 text-[20px]">Try your online store free for {TRIAL_DAYS} days</h2>
          <p className="mx-auto mt-2 max-w-[460px] text-[14px] leading-relaxed text-ink-600 dark:text-ink-300">
            No card required. Set up your logo, products, theme, homepage and policies. When you want customers to see
            it, choose Growth or Pro.
          </p>

          <ul className="mx-auto mt-6 grid max-w-[420px] gap-2.5 text-left">
            {['Pick a theme and add your branding', 'Choose which products your store sells', 'Arrange your homepage sections', 'Write your policies from templates'].map(
              (item) => (
                <li key={item} className="flex gap-2.5 text-[13px] text-ink-700 dark:text-ink-200">
                  <Check className="mt-0.5 size-4 shrink-0 text-teal-500" strokeWidth={2.6} />
                  {item}
                </li>
              )
            )}
          </ul>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              onClick={() => {
                useStorefrontStore.getState().startTrial()
                toast.success(`Trial started — ${TRIAL_DAYS} days`, { description: 'Build your store, publish when you subscribe.' })
              }}
            >
              Start free trial
            </Button>
            <Button size="lg" variant="outline" asChild>
              <AdminLink to="/seller/plan">Compare plans</AdminLink>
            </Button>
          </div>
        </Panel>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Store setup"
        description={step.blurb}
        breadcrumb={[
          { label: 'Dashboard', to: '/seller' },
          { label: 'Online Store', to: '/seller/online-store' },
          { label: 'Setup', to: '/seller/online-store/setup' },
        ]}
        actions={
          trial.active && (
            <span className="rounded-full bg-gold-100 px-3 py-1 text-[11px] font-bold text-gold-800 dark:bg-gold-950 dark:text-gold-200">
              Trial · {trial.daysLeft} days left
            </span>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* step rail */}
        <nav aria-label="Setup steps" className="lg:sticky lg:top-24 lg:self-start">
          <ol className="grid gap-1">
            {STEPS.map((s, i) => {
              const done = completedSteps.includes(s.id)
              const current = s.id === step.id
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => go(s.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors',
                      current ? 'bg-brand-50 dark:bg-brand-950' : 'hover:bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold',
                        done
                          ? 'bg-teal-500 text-white'
                          : current
                            ? 'bg-brand-600 text-white'
                            : 'border border-input text-ink-400'
                      )}
                    >
                      {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        'text-[13px] font-semibold',
                        current ? 'text-brand-700 dark:text-brand-200' : 'text-ink-700 dark:text-ink-300'
                      )}
                    >
                      {s.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>

        <div>
          {step.id === 'details' && <StepDetails />}
          {step.id === 'branding' && <StepBranding />}
          {step.id === 'homepage' && <StepHomepage />}
          {step.id === 'selling' && <StepSelling />}
          {step.id === 'url' && <StepUrl />}
          {step.id === 'preview' && <StepPreview />}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
            <Button variant="ghost" disabled={index === 0} onClick={() => go(STEPS[index - 1].id)}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            {index < STEPS.length - 1 && (
              <Button onClick={next}>
                Save & continue
                <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------- 1. store details -- */
function StepDetails() {
  const { config, updateConfig } = useStorefrontStore()

  return (
    <Panel title="Store details" description="What your store is called, and how it introduces itself.">
      <div className="grid gap-5">
        <Field label="Store name" hint="Your web address is generated from this.">
          <Input value={config.name} onChange={(e) => updateConfig({ name: e.target.value })} />
        </Field>

        <Field label="Store description" hint="Shown on your About page and in search results.">
          <Textarea rows={3} value={config.description} onChange={(e) => updateConfig({ description: e.target.value })} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Logo" hint="PNG or SVG, square, at least 400×400.">
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
          </Field>

          <Field label="Favicon" hint="The small icon in the browser tab.">
            <div className="flex items-center gap-3">
              <span
                className="grid size-8 shrink-0 place-items-center rounded-sm text-[11px] font-bold text-white"
                style={{ background: config.brandColor }}
              >
                {config.faviconText.slice(0, 1).toUpperCase()}
              </span>
              <Input
                value={config.faviconText}
                onChange={(e) => updateConfig({ faviconText: e.target.value })}
                maxLength={2}
                className="w-20"
              />
            </div>
          </Field>

          <Field label="Logo text" hint="Used until you upload a logo.">
            <Input value={config.logoText} onChange={(e) => updateConfig({ logoText: e.target.value })} maxLength={6} />
          </Field>

          <Field label="Support email">
            <Input value={config.supportEmail} onChange={(e) => updateConfig({ supportEmail: e.target.value })} />
          </Field>
        </div>
      </div>
    </Panel>
  )
}

/* ----------------------------------------------------------- 2. branding -- */
function StepBranding() {
  const plan = usePlan()
  const { config, updateConfig } = useStorefrontStore()
  const themeAllowed = (minPlan: string) => (minPlan === 'pro' ? plan.themes === 'All' : true)

  return (
    <div className="grid gap-4">
      <Panel title="Theme" description="Pick a professionally designed layout. You are choosing a look, not building pages.">
        <div className="grid gap-3 sm:grid-cols-2">
          {STORE_THEMES.map((theme) => {
            const locked = !themeAllowed(theme.minPlan)
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

      <Panel title="Colours & type">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Primary colour" hint="Buttons, links and your announcement bar.">
            <ColorField value={config.brandColor} onChange={(brandColor) => updateConfig({ brandColor })} label="Primary colour" />
          </Field>
          <Field label="Secondary colour" hint="Accents, badges and offers.">
            <ColorField value={config.accentColor} onChange={(accentColor) => updateConfig({ accentColor })} label="Secondary colour" />
          </Field>
          <Field label="Font">
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
          </Field>
        </div>
      </Panel>
    </div>
  )
}

/* ----------------------------------------------------------- 3. homepage -- */
function StepHomepage() {
  const { config, updateConfig, homepageSections, toggleSection, moveSection } = useStorefrontStore()

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <div className="grid content-start gap-4">
        <Panel title="Hero banner">
          <div className="grid gap-4">
            <Field label="Headline">
              <Input value={config.bannerHeadline} onChange={(e) => updateConfig({ bannerHeadline: e.target.value })} />
            </Field>
            <Field label="Subtext">
              <Input value={config.bannerSub} onChange={(e) => updateConfig({ bannerSub: e.target.value })} />
            </Field>
          </div>
        </Panel>

        <Panel title="Announcement bar" description="A thin strip above your header. The cheapest conversion lever there is.">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="ann-on" className="text-[13px]">
              Show the announcement bar
            </Label>
            <Switch
              id="ann-on"
              checked={config.announcement.on}
              onCheckedChange={(on) => updateConfig({ announcement: { ...config.announcement, on } })}
            />
          </div>
          <div className="mt-4">
            <Field label="Message">
              <Input
                value={config.announcement.text}
                onChange={(e) => updateConfig({ announcement: { ...config.announcement, text: e.target.value } })}
                placeholder="Free shipping above $99"
              />
            </Field>
          </div>
        </Panel>

        <Panel
          title="Homepage sections"
          description="Turn sections on or off and put them in the order you want. This is the whole layout tool — no page building."
        >
          <ul className="grid gap-2">
            {homepageSections.map((section, i) => (
              <li
                key={section.id}
                className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5"
              >
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
          <p className="mt-3 text-[11px] text-ink-500">The hero banner is always shown — it is your storefront's front door.</p>
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

/* --------------------------------------------------- 4. selling settings -- */
function StepSelling() {
  const { config, updateConfig, channelPricing, setChannel, policies, setPolicy } = useStorefrontStore()
  const products = SELLER_PRODUCTS.filter((p) => p.status === 'Active')
  const onStore = products.filter((p) => channelPricing[p.id]?.store.on ?? false).length

  return (
    <div className="grid gap-4">
      <Panel
        title="Products to show"
        description="Your catalogue is shared. Choose what your own store sells, and what it charges."
        actions={
          <Button variant="outline" size="sm" asChild>
            <AdminLink to="/seller/online-store" search={{ tab: 'products' }}>
              Set per-product prices
            </AdminLink>
          </Button>
        }
      >
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
          <span className="text-[13px] text-ink-600 dark:text-ink-300">
            <strong className="tabular text-ink-900 dark:text-white">{onStore}</strong> of {products.length} active
            products are listed on your store.
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-8"
            onClick={() => {
              products.forEach((p) => setChannel(p.id, 'store', { on: true, price: p.price }))
              toast.success('All active products added to your store')
            }}
          >
            Add all
          </Button>
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-ink-500">
          Inventory is shared across channels — one stock number, wherever the sale comes from. Prices are per channel,
          so you can price your own store lower than the marketplace.
        </p>
      </Panel>

      <Panel title="Shipping rule">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="fs-on" className="text-[13px]">
            Offer free shipping above a threshold
          </Label>
          <Switch
            id="fs-on"
            checked={config.freeShipping.on}
            onCheckedChange={(on) => updateConfig({ freeShipping: { ...config.freeShipping, on } })}
          />
        </div>
        {config.freeShipping.on && (
          <div className="mt-4 max-w-[240px]">
            <Field label="Free shipping above">
              <Input
                type="number"
                value={config.freeShipping.threshold}
                onChange={(e) => updateConfig({ freeShipping: { ...config.freeShipping, threshold: Number(e.target.value) || 0 } })}
                className="tabular"
              />
            </Field>
            <p className="mt-2 text-[11px] text-ink-500">
              Customers see “Free shipping above {money(config.freeShipping.threshold)}” in the cart.
            </p>
          </div>
        )}
      </Panel>

      <Panel title="Store policies" description="Start from a template and edit. Every storefront needs these four.">
        <div className="grid gap-4">
          {POLICY_TEMPLATES.map((policy) => (
            <div key={policy.key} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink-900 dark:text-white">{policy.label}</p>
                  <p className="mt-0.5 text-[11px] text-ink-500">{policy.description}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setPolicy(policy.key, policy.template)}>
                  Use template
                </Button>
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
      </Panel>
    </div>
  )
}

/* ---------------------------------------------------------- 5. store URL -- */
function StepUrl() {
  const plan = usePlan()
  const { config, customDomain, domainStatus, connectDomain, verifyDomain } = useStorefrontStore()
  const [draft, setDraft] = useState(customDomain)

  return (
    <div className="grid gap-4">
      <Panel title="Your SafalMarketHub address" description="Free with every store, live the moment you publish.">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
          <Globe className="size-4 shrink-0 text-ink-400" />
          <span className="min-w-0 flex-1 truncate text-[14px] font-semibold tabular text-ink-900 dark:text-white">
            {config.slug}.safalmarkethub.store
          </span>
          <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[11px] font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-200">
            Included
          </span>
        </div>
        <p className="mt-3 text-[12px] text-ink-500">Generated from your store name. Change the name to change the address.</p>
      </Panel>

      <Panel title="Custom domain" description="Use a domain you already own, like www.abc.com.">
        {!plan.customDomain ? (
          <div className="rounded-lg border border-dashed p-5 text-center">
            <Lock className="mx-auto size-5 text-ink-400" />
            <p className="mt-2.5 text-[13px] font-semibold text-ink-900 dark:text-white">Custom domains come with Pro</p>
            <p className="mx-auto mt-1 max-w-[380px] text-[12px] leading-relaxed text-ink-500">
              Pro also removes the “Powered by SafalMarketHub” badge, so the store reads as entirely yours.
            </p>
            <Button size="sm" className="mt-4" asChild>
              <AdminLink to="/seller/plan">Upgrade to Pro</AdminLink>
            </Button>
          </div>
        ) : domainStatus === 'none' ? (
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[240px] flex-1">
              <Field label="Domain">
                <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="www.abc.com" className="tabular" />
              </Field>
            </div>
            <Button
              disabled={!draft.trim()}
              onClick={() => {
                connectDomain(draft)
                toast.success('Domain added', { description: 'Add the DNS records, then verify.' })
              }}
            >
              Connect domain
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
              <Globe className="size-4 shrink-0 text-ink-400" />
              <span className="min-w-0 flex-1 truncate text-[14px] font-semibold tabular">{customDomain}</span>
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                  domainStatus === 'verified'
                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200'
                    : 'bg-gold-100 text-gold-800 dark:bg-gold-950 dark:text-gold-200'
                )}
              >
                {domainStatus === 'verified' ? 'Verified' : 'Pending DNS'}
              </span>
            </div>
            {domainStatus === 'pending' && (
              <>
                <p className="mt-4 text-[12px] text-ink-600 dark:text-ink-300">Add these records with your domain registrar:</p>
                <div className="mt-2 overflow-x-auto rounded-lg border">
                  <table className="w-full min-w-[420px] text-left text-[12px]">
                    <thead className="bg-muted/60 text-[11px] uppercase tracking-[0.06em] text-ink-500">
                      <tr>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Value</th>
                      </tr>
                    </thead>
                    <tbody className="tabular">
                      <tr className="border-t">
                        <td className="px-3 py-2">A</td>
                        <td className="px-3 py-2">@</td>
                        <td className="px-3 py-2">76.76.21.21</td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-3 py-2">CNAME</td>
                        <td className="px-3 py-2">www</td>
                        <td className="px-3 py-2">stores.safalmarkethub.store</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <Button
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    verifyDomain()
                    toast.success('Domain verified', { description: customDomain })
                  }}
                >
                  Verify domain
                </Button>
              </>
            )}
          </div>
        )}
      </Panel>
    </div>
  )
}

/* ----------------------------------------------------------- 6. preview --- */
function StepPreview() {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const trial = useTrial()
  const storeUrl = useStoreUrl()
  const { status, publish, completeStep } = useStorefrontStore()

  return (
    <div className="grid gap-4">
      <Panel
        title="Preview my store"
        description="Exactly what a customer sees. Nothing is public until you publish."
        actions={
          <div className="flex items-center gap-1 rounded-md border p-0.5">
            <Button
              variant={device === 'desktop' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7"
              onClick={() => setDevice('desktop')}
            >
              <Monitor className="size-3.5" />
              Desktop
            </Button>
            <Button
              variant={device === 'mobile' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7"
              onClick={() => setDevice('mobile')}
            >
              <Smartphone className="size-3.5" />
              Mobile
            </Button>
          </div>
        }
        padded={false}
      >
        <StorePreview device={device} />
      </Panel>

      {trial.canPublish ? (
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-ink-900 dark:text-white">
                {status === 'published' ? 'Your store is live' : 'Ready to go live?'}
              </p>
              <p className="mt-1 text-[13px] text-ink-500 tabular">{storeUrl}</p>
            </div>
            <Button
              size="lg"
              disabled={status === 'published'}
              onClick={() => {
                publish()
                completeStep('preview')
                toast.success('Your store is live', { description: storeUrl })
              }}
            >
              <Rocket className="size-4" />
              {status === 'published' ? 'Published' : 'Publish store'}
            </Button>
          </div>
        </Panel>
      ) : (
        <Alert variant="info">
          <Eye />
          <AlertTitle>Publishing needs a subscription</AlertTitle>
          <AlertDescription>
            Your store is built and ready. Choose Growth to publish on a SafalMarketHub subdomain, or Pro for your own
            domain with no badge.
            <span className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <AdminLink to="/seller/plan">Choose a plan</AdminLink>
              </Button>
            </span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- bits ------- */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-[13px]">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-ink-500">{hint}</p>}
    </div>
  )
}

function ColorField({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="size-10 cursor-pointer rounded-sm border bg-background"
      />
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="tabular" />
    </div>
  )
}

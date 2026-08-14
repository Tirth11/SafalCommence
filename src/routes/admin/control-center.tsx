import { useNavigate } from '@tanstack/react-router'
import { AlertTriangle, Bot, Brain, ClipboardCheck, Image, Mic, ShieldCheck, Sparkles, Tag, UploadCloud, Users } from 'lucide-react'

import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { DataTable, type Column } from '@/components/admin/data-table'
import { PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AI_ACTIONS,
  AI_CONFIRMATION_RULES,
  AI_CONVERSATIONS,
  BEST_OFFER_RULES,
  BULK_IMPORTS,
  CUSTOMER_AI_METRICS,
  CUSTOMER_COMPLAINTS,
  CUSTOMER_FEEDBACK_SUMMARY,
  CUSTOMER_VOICE_METRICS,
  IMAGE_SEARCH_METRICS,
  IMPORT_ERROR_TYPES,
  INVENTORY_ALERTS,
  OFFER_PERFORMANCE,
  PRICING_ALERTS,
  SELLER_INTELLIGENCE_METRICS,
  SUPER_ADMIN_ATTENTION,
  SUPER_ADMIN_OVERVIEW,
  TEMPLATE_FIELDS,
  VOICE_METRICS,
  type AiAction,
  type AiConversation,
  type BulkImport,
  type ControlMetric,
  type InventoryAlert,
  type OfferPerformance,
  type PricingAlert,
} from '@/data/admin-control'
import { cn } from '@/lib/utils'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'ai', label: 'AI Control' },
  { value: 'intelligence', label: 'Seller Intelligence' },
  { value: 'offers', label: 'Offers' },
  { value: 'voice', label: 'Customer Voice' },
  { value: 'uploads', label: 'Bulk Uploads' },
] as const

type ControlTab = (typeof TABS)[number]['value']

export function AdminControlCenterPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const tab = TABS.some((item) => item.value === search.tab) ? (search.tab as ControlTab) : 'overview'

  function setTab(value: string) {
    navigate(adminLinkProps({ to: '/admin/control-center', search: { tab: value } }))
  }

  return (
    <>
      <PageHeader
        title="Super Admin Control Center"
        description="Marketplace, customer experience, seller operations, AI assistants, offers, payments, reviews, feedback, risk and analytics in one control surface."
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <AdminLink to="/admin/audit-logs">Audit logs</AdminLink>
            </Button>
            <Button size="sm" asChild>
              <AdminLink to="/admin/reports">Export report</AdminLink>
            </Button>
          </>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-5 flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          {TABS.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="rounded-full border bg-card px-3 py-1.5 text-[12px]">
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="ai" className="mt-0">
          <AiControlTab />
        </TabsContent>
        <TabsContent value="intelligence" className="mt-0">
          <SellerIntelligenceTab />
        </TabsContent>
        <TabsContent value="offers" className="mt-0">
          <OffersTab />
        </TabsContent>
        <TabsContent value="voice" className="mt-0">
          <CustomerVoiceTab />
        </TabsContent>
        <TabsContent value="uploads" className="mt-0">
          <BulkUploadsTab />
        </TabsContent>
      </Tabs>
    </>
  )
}

function OverviewTab() {
  return (
    <div className="space-y-5">
      <MetricGrid metrics={SUPER_ADMIN_OVERVIEW} columns="xl:grid-cols-4" />

      <Panel title="Needs your attention" description="The dashboard should answer what is happening, what needs attention, what is working and what is going wrong.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {SUPER_ADMIN_ATTENTION.map((item) => (
            <AdminLink
              key={item.id}
              to="/admin/control-center"
              search={{ tab: item.tab }}
              className="group rounded-xl border bg-background p-4 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-[24px] font-bold tabular tracking-[-0.04em] text-ink-950 dark:text-white">{item.count}</span>
                <StatusBadge status={item.priority} />
              </div>
              <p className="mt-2 text-[13px] font-semibold text-ink-900 dark:text-white">{item.title}</p>
              <p className="mt-1 line-clamp-2 text-[12px] text-ink-500">{item.detail}</p>
              <p className="mt-3 text-[11px] font-bold text-brand-600 group-hover:underline dark:text-brand-300">{item.action}</p>
            </AdminLink>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel
          title="What AI is doing"
          description="Customer assistant, seller assistant, image search and voice flows."
          actions={
            <Button variant="ghost" size="sm" asChild>
              <AdminLink to="/admin/control-center" search={{ tab: 'ai' }}>Open AI control</AdminLink>
            </Button>
          }
        >
          <MetricGrid metrics={CUSTOMER_AI_METRICS.slice(0, 6)} columns="md:grid-cols-3" compact />
        </Panel>

        <Panel
          title="Customer voice snapshot"
          description="Feedback across product, seller, delivery, support and assistant surfaces."
          actions={
            <Button variant="ghost" size="sm" asChild>
              <AdminLink to="/admin/control-center" search={{ tab: 'voice' }}>Open voice center</AdminLink>
            </Button>
          }
        >
          <MetricGrid metrics={CUSTOMER_VOICE_METRICS.slice(0, 6)} columns="md:grid-cols-2" compact />
        </Panel>
      </div>
    </div>
  )
}

function AiControlTab() {
  const actionColumns: Column<AiAction>[] = [
    { key: 'id', header: 'Action ID', cell: (row) => <span className="font-semibold tabular">{row.id}</span>, sortBy: (row) => row.id },
    {
      key: 'user',
      header: 'User',
      cell: (row) => (
        <span>
          <span className="block font-semibold text-ink-900 dark:text-white">{row.user}</span>
          <span className="block text-[11px] text-ink-500">{row.userType} · {row.assistant}</span>
        </span>
      ),
      sortBy: (row) => row.user,
    },
    { key: 'action', header: 'Requested action', cell: (row) => row.requestedAction, sortBy: (row) => row.requestedAction },
    { key: 'target', header: 'Target', cell: (row) => row.target, hideBelow: 'md' },
    {
      key: 'change',
      header: 'Change',
      cell: (row) => (
        <span className="block max-w-[260px] text-[12px]">
          <span className="block text-ink-500">From: {row.previousValue}</span>
          <span className="block font-semibold text-ink-900 dark:text-white">To: {row.newValue}</span>
        </span>
      ),
      hideBelow: 'lg',
    },
    {
      key: 'confirmation',
      header: 'Confirmation',
      cell: (row) => `${row.confirmationRequired} / ${row.confirmationReceived}`,
      hideBelow: 'md',
    },
    { key: 'result', header: 'Result', cell: (row) => <StatusBadge status={row.result} />, sortBy: (row) => row.result },
    { key: 'date', header: 'Date', cell: (row) => row.date, hideBelow: 'lg', sortBy: (row) => row.date },
  ]

  const conversationColumns: Column<AiConversation>[] = [
    { key: 'id', header: 'Conversation', cell: (row) => <span className="font-semibold tabular">{row.id}</span>, sortBy: (row) => row.id },
    { key: 'user', header: 'User', cell: (row) => row.user, sortBy: (row) => row.user },
    { key: 'assistant', header: 'Assistant', cell: (row) => row.assistant, hideBelow: 'md' },
    {
      key: 'issue',
      header: 'Why flagged',
      cell: (row) => (
        <span>
          <span className="block font-semibold text-ink-900 dark:text-white">{row.issue}</span>
          <span className="block text-[11px] text-ink-500">{row.signal}</span>
        </span>
      ),
      sortBy: (row) => row.issue,
    },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} />, sortBy: (row) => row.status },
    { key: 'at', header: 'At', cell: (row) => row.at, hideBelow: 'lg' },
  ]

  return (
    <div className="space-y-5">
      <MetricGrid metrics={CUSTOMER_AI_METRICS} columns="xl:grid-cols-6" />

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Panel title="Image search monitoring" description="Only flagged and problem searches need manual review.">
          <MetricGrid metrics={IMAGE_SEARCH_METRICS} columns="md:grid-cols-3" compact />
        </Panel>
        <Panel title="Voice assistant monitoring" description="Tracks customer and seller voice request quality.">
          <MetricGrid metrics={VOICE_METRICS} columns="md:grid-cols-2" compact />
        </Panel>
      </div>

      <DataTable
        rows={AI_ACTIONS}
        columns={actionColumns}
        searchKeys={(row) => `${row.id} ${row.user} ${row.assistant} ${row.requestedAction} ${row.target} ${row.result}`}
        searchPlaceholder="Search AI actions"
        exportName="ai-actions"
        empty={{ title: 'No AI actions found', body: 'Confirmed assistant actions will appear here.' }}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_0.75fr]">
        <DataTable
          rows={AI_CONVERSATIONS}
          columns={conversationColumns}
          searchKeys={(row) => `${row.id} ${row.user} ${row.assistant} ${row.issue} ${row.signal} ${row.status}`}
          searchPlaceholder="Search flagged conversations"
          exportName="ai-conversations"
          empty={{ title: 'No flagged conversations', body: 'Normal successful conversations are not sent for manual review.' }}
        />

        <Panel title="AI action confirmation policy" description="AI suggests, prepares, then the user confirms before execution.">
          <ul className="grid gap-2">
            {AI_CONFIRMATION_RULES.map((rule) => (
              <li key={rule} className="flex items-start gap-2 rounded-lg border bg-background px-3 py-2.5 text-[13px]">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal-600 dark:text-teal-100" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-lg bg-destructive/8 px-3 py-2 text-[12px] font-medium text-destructive">
            Major financial or commercial actions are never executed silently.
          </p>
        </Panel>
      </div>
    </div>
  )
}

function SellerIntelligenceTab() {
  const pricingColumns: Column<PricingAlert>[] = [
    { key: 'product', header: 'Product', cell: (row) => <span className="font-semibold">{row.product}</span>, sortBy: (row) => row.product },
    { key: 'seller', header: 'Seller', cell: (row) => row.seller, sortBy: (row) => row.seller },
    { key: 'signal', header: 'Signal', cell: (row) => row.signal },
    { key: 'range', header: 'Expected range', cell: (row) => row.expectedRange, hideBelow: 'md' },
    { key: 'price', header: 'Current price', cell: (row) => row.currentPrice, sortBy: (row) => row.currentPrice },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
  ]

  const inventoryColumns: Column<InventoryAlert>[] = [
    { key: 'product', header: 'Product', cell: (row) => <span className="font-semibold">{row.product}</span>, sortBy: (row) => row.product },
    { key: 'stock', header: 'Stock', cell: (row) => row.stock },
    { key: 'velocity', header: 'Sales velocity', cell: (row) => row.salesVelocity, hideBelow: 'md' },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} />, sortBy: (row) => row.status },
  ]

  return (
    <div className="space-y-5">
      <MetricGrid metrics={SELLER_INTELLIGENCE_METRICS} />

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Pricing intelligence" description="Review extreme prices, suspicious prices and possible listing mistakes." padded={false}>
          <DataTable
            rows={PRICING_ALERTS}
            columns={pricingColumns}
            searchKeys={(row) => `${row.product} ${row.seller} ${row.signal} ${row.status}`}
            searchPlaceholder="Search pricing alerts"
            exportName="pricing-alerts"
            initialPageSize={5}
          />
        </Panel>

        <Panel title="Inventory intelligence" description="Marketplace stock, low stock, slow moving products and oversell risk." padded={false}>
          <DataTable
            rows={INVENTORY_ALERTS}
            columns={inventoryColumns}
            searchKeys={(row) => `${row.product} ${row.stock} ${row.salesVelocity} ${row.status}`}
            searchPlaceholder="Search inventory alerts"
            exportName="inventory-alerts"
            initialPageSize={5}
          />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <HealthCard title="Seller Health Score" value="89 / 100" status="Good" good={['Fast fulfilment', 'Strong customer ratings']} needs={['Return rate rising', '3 recent packaging complaints']} />
        <HealthCard title="Listing Health" value="78 / 100" status="Needs Attention" good={['Title', 'Category', 'Price']} needs={['Only 1 image', 'Shipping weight missing']} />
        <HealthCard title="Product Performance" value="4 focus lists" status="Active" good={['Top performing', 'Most viewed', 'Most wishlisted']} needs={['High return products', 'Poor performing products']} />
      </div>
    </div>
  )
}

function OffersTab() {
  const offerColumns: Column<OfferPerformance>[] = [
    {
      key: 'offer',
      header: 'Offer',
      cell: (row) => (
        <span>
          <span className="block font-semibold text-ink-900 dark:text-white">{row.offer}</span>
          <span className="block text-[11px] text-ink-500">{row.visibility}</span>
        </span>
      ),
      sortBy: (row) => row.offer,
    },
    { key: 'views', header: 'Views', cell: (row) => row.views.toLocaleString('en-IN'), align: 'right', sortBy: (row) => row.views },
    { key: 'clicks', header: 'Clicks', cell: (row) => row.clicks.toLocaleString('en-IN'), align: 'right', hideBelow: 'md', sortBy: (row) => row.clicks },
    { key: 'orders', header: 'Orders', cell: (row) => row.orders.toLocaleString('en-IN'), align: 'right', sortBy: (row) => row.orders },
    { key: 'gmv', header: 'GMV', cell: (row) => row.gmv, align: 'right', hideBelow: 'md' },
    { key: 'discount', header: 'Discount', cell: (row) => row.discountGiven, align: 'right', hideBelow: 'lg' },
    { key: 'conversion', header: 'Conversion', cell: (row) => row.conversion, align: 'right', sortBy: (row) => row.conversion },
    { key: 'ai', header: 'AI-assisted', cell: (row) => row.aiAssisted.toLocaleString('en-IN'), align: 'right', hideBelow: 'lg', sortBy: (row) => row.aiAssisted },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
  ]

  return (
    <div className="space-y-5">
      <Panel
        title="Offers & promotions"
        description="Today's offers, upcoming offers, coupons, visibility rules and offer performance."
        actions={<Button size="sm"><Tag className="size-4" /> Create offer</Button>}
        padded={false}
      >
        <DataTable
          rows={OFFER_PERFORMANCE}
          columns={offerColumns}
          searchKeys={(row) => `${row.offer} ${row.visibility} ${row.status}`}
          searchPlaceholder="Search offers"
          exportName="offer-performance"
        />
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Best offer engine" description="AI may find existing eligible offers, but it cannot invent coupons.">
          <dl className="grid gap-2.5">
            {BEST_OFFER_RULES.map((rule) => (
              <div key={rule.label} className="flex items-baseline justify-between gap-4 rounded-lg border bg-background px-3 py-2.5">
                <dt className="text-[12px] text-ink-500">{rule.label}</dt>
                <dd className="text-right text-[13px] font-semibold text-ink-900 dark:text-white">{rule.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="Offer creation fields" description="The fields Super Admin needs before publishing an offer.">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {['Offer name', 'Offer type', 'Applies to', 'Start date/time', 'End date/time', 'Minimum order', 'Customer visibility', 'Specific sellers', 'Specific products'].map((field) => (
              <span key={field} className="rounded-lg border bg-background px-3 py-2 text-[12px] font-semibold text-ink-700 dark:text-ink-200">
                {field}
              </span>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function CustomerVoiceTab() {
  return (
    <div className="space-y-5">
      <MetricGrid metrics={CUSTOMER_VOICE_METRICS} columns="xl:grid-cols-6" />

      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Top customer complaints" description="Click-through categories should reveal original feedback.">
          <div className="grid gap-2 sm:grid-cols-2">
            {CUSTOMER_COMPLAINTS.map((item) => (
              <div key={item.id} className="rounded-xl border bg-background p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[13px] font-semibold text-ink-900 dark:text-white">{item.category}</p>
                  <p className="text-[18px] font-bold tabular text-ink-950 dark:text-white">{item.count}</p>
                </div>
                <p className="mt-1 text-[12px] text-ink-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Customer feedback summary" description="Summaries help triage, but original comments remain accessible.">
          <SummaryList title="Customers like" items={CUSTOMER_FEEDBACK_SUMMARY.likes} icon={Sparkles} />
          <SummaryList title="Common problems" items={CUSTOMER_FEEDBACK_SUMMARY.problems} icon={AlertTriangle} className="mt-4" />
          <p className="mt-4 rounded-lg bg-gold-50 px-3 py-2 text-[12px] font-semibold text-gold-700 dark:bg-gold-600/15 dark:text-gold-400">
            Trending issue: {CUSTOMER_FEEDBACK_SUMMARY.trend}
          </p>
        </Panel>
      </div>

      <Panel title="Feedback sources" description="Customer Voice combines every major feedback stream.">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {['Product Reviews', 'Seller Ratings', 'Delivery Feedback', 'Platform Feedback', 'AI Feedback', 'Support Feedback', 'Return Feedback'].map((source) => (
            <span key={source} className="rounded-lg border bg-background px-3 py-2 text-[12px] font-semibold text-ink-700 dark:text-ink-200">
              {source}
            </span>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function BulkUploadsTab() {
  const importColumns: Column<BulkImport>[] = [
    { key: 'id', header: 'Import ID', cell: (row) => <span className="font-semibold tabular">{row.id}</span>, sortBy: (row) => row.id },
    {
      key: 'seller',
      header: 'Seller / File',
      cell: (row) => (
        <span>
          <span className="block font-semibold text-ink-900 dark:text-white">{row.seller}</span>
          <span className="block text-[11px] text-ink-500">{row.filename}</span>
        </span>
      ),
      sortBy: (row) => row.seller,
    },
    { key: 'rows', header: 'Rows', cell: (row) => row.rows.toLocaleString('en-IN'), align: 'right', sortBy: (row) => row.rows },
    { key: 'valid', header: 'Valid', cell: (row) => row.valid.toLocaleString('en-IN'), align: 'right', hideBelow: 'md', sortBy: (row) => row.valid },
    { key: 'warnings', header: 'Warnings', cell: (row) => row.warnings.toLocaleString('en-IN'), align: 'right', hideBelow: 'md', sortBy: (row) => row.warnings },
    { key: 'errors', header: 'Errors', cell: (row) => row.errors.toLocaleString('en-IN'), align: 'right', hideBelow: 'md', sortBy: (row) => row.errors },
    { key: 'imported', header: 'Imported', cell: (row) => row.imported.toLocaleString('en-IN'), align: 'right', hideBelow: 'lg', sortBy: (row) => row.imported },
    { key: 'date', header: 'Date', cell: (row) => row.date, hideBelow: 'lg' },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} />, sortBy: (row) => row.status },
  ]

  return (
    <div className="space-y-5">
      <Panel title="Bulk product imports" description="Excel and CSV import health across sellers." padded={false}>
        <DataTable
          rows={BULK_IMPORTS}
          columns={importColumns}
          searchKeys={(row) => `${row.id} ${row.seller} ${row.filename} ${row.status}`}
          searchPlaceholder="Search imports"
          exportName="bulk-imports"
        />
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Import error categories" description="Admin sees this mainly for seller support and systemic issues.">
          <div className="grid gap-2 sm:grid-cols-2">
            {IMPORT_ERROR_TYPES.map((error) => (
              <span key={error} className="rounded-lg border bg-background px-3 py-2 text-[12px] font-semibold text-ink-700 dark:text-ink-200">
                {error}
              </span>
            ))}
          </div>
        </Panel>

        <Panel title="Official product import template" description="Template Version 1.2">
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATE_FIELDS.map((field) => (
              <span key={field} className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-ink-600 dark:text-ink-300">
                {field}
              </span>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4">
            <UploadCloud className="size-4" />
            Download template
          </Button>
        </Panel>
      </div>
    </div>
  )
}

function MetricGrid({
  metrics,
  columns = 'lg:grid-cols-4',
  compact,
}: {
  metrics: ControlMetric[]
  columns?: string
  compact?: boolean
}) {
  return (
    <div className={cn('grid grid-cols-2 gap-3', columns)}>
      {metrics.map((metric) => (
        <div key={metric.label} className={cn('rounded-lg border bg-card shadow-xs', compact ? 'p-3' : 'p-4')}>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">{metric.label}</p>
          <p className={cn('mt-2 font-bold leading-none tracking-[-0.03em] tabular text-ink-950 dark:text-white', compact ? 'text-[20px]' : 'text-[26px]')}>
            {metric.value}
          </p>
          <p className="mt-2 truncate text-[11px] text-ink-500">{metric.delta ? `${metric.delta} · ${metric.hint ?? ''}` : metric.hint}</p>
        </div>
      ))}
    </div>
  )
}

function HealthCard({
  title,
  value,
  status,
  good,
  needs,
}: {
  title: string
  value: string
  status: string
  good: string[]
  needs: string[]
}) {
  return (
    <Panel title={title} description={value}>
      <StatusBadge status={status} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        <SummaryList title="Good" items={good} icon={ClipboardCheck} />
        <SummaryList title="Needs attention" items={needs} icon={AlertTriangle} />
      </div>
    </Panel>
  )
}

function SummaryList({
  title,
  items,
  icon: Icon,
  className,
}: {
  title: string
  items: string[]
  icon: typeof Bot
  className?: string
}) {
  return (
    <section className={className}>
      <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-400">
        <Icon className="size-3.5" />
        {title}
      </p>
      <ul className="mt-2 grid gap-1.5 text-[13px] text-ink-700 dark:text-ink-200">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden className="text-brand-500">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export const CONTROL_CENTER_SEARCH_ITEMS = [
  { icon: Bot, label: 'Customer Shopping Assistant', body: 'Conversations, recommendations, cart adds, purchases assisted.', tab: 'ai' },
  { icon: Brain, label: 'Seller Assistant', body: 'Seller AI requests, confirmations and action outcomes.', tab: 'ai' },
  { icon: Image, label: 'Image Search', body: 'Uploads, no-match rate and low-confidence problem searches.', tab: 'ai' },
  { icon: Mic, label: 'Voice Assistant', body: 'Voice requests understood, failed or cancelled.', tab: 'ai' },
  { icon: Tag, label: 'Offer Center', body: 'Today, upcoming, scheduled, paused and expired offers.', tab: 'offers' },
  { icon: Users, label: 'Customer Voice', body: 'Reviews, seller ratings, delivery feedback and AI feedback.', tab: 'voice' },
]

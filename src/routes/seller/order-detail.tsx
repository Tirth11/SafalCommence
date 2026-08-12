import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import {
  Ban,
  Check,
  Download,
  MapPin,
  PackageCheck,
  Printer,
  ShieldCheck,
  Truck,
  TriangleAlert,
  Undo2,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { AdminLink } from '@/components/admin/admin-link'
import { DefinitionList, EmptyState, MoneyRows, PageHeader, Panel, Timeline } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { ProductThumb } from '@/components/commerce/product-thumb'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SELLER_ORDERS, type SellerOrderStatus } from '@/data/seller'
import { money } from '@/lib/utils'

const CANCEL_REASONS = ['Product Out of Stock', 'Damaged Product', 'Pricing Error', 'Unable to Fulfil', 'Other']

export function SellerOrderDetailPage() {
  const { orderId } = useParams({ strict: false }) as { orderId?: string }
  const { config, open, setOpen, ask } = useActionDialog()

  const base = SELLER_ORDERS.find((o) => o.id === orderId)
  const [status, setStatus] = useState<SellerOrderStatus | undefined>(base?.status)
  const [packChecks, setPackChecks] = useState({ product: false, quantity: false, package: false })
  const [shipMode, setShipMode] = useState<'label' | 'manual'>('label')
  const [awb, setAwb] = useState(base?.awb ?? '')
  const [courier, setCourier] = useState(base?.courier ?? '')
  const [returnResponse, setReturnResponse] = useState('')

  if (!base) {
    return (
      <Panel padded={false}>
        <EmptyState
          title="Order not found"
          body="This order reference does not exist in your store."
          action={
            <Button variant="outline" size="sm" asChild>
              <AdminLink to="/seller/orders">Back to orders</AdminLink>
            </Button>
          }
        />
      </Panel>
    )
  }

  const order = { ...base, status: status ?? base.status }
  const allPacked = Object.values(packChecks).every(Boolean)

  const timeline = [
    { label: 'Order placed', at: order.date, done: true },
    { label: 'Payment received', at: order.payment === 'Paid' ? order.date : 'Pending', done: order.payment === 'Paid' },
    { label: 'Order accepted', at: order.status === 'New' ? 'Waiting on you' : 'Accepted', done: order.status !== 'New' },
    {
      label: 'Packed',
      at: ['Packed', 'Shipped', 'Delivered', 'Returned'].includes(order.status) ? 'Packed' : 'Not packed yet',
      done: ['Packed', 'Shipped', 'Delivered', 'Returned'].includes(order.status),
    },
    {
      label: 'Shipped',
      at: order.shippedOn ?? 'Awaiting courier pickup',
      done: ['Shipped', 'Delivered', 'Returned'].includes(order.status),
    },
    {
      label: 'Delivered',
      at: order.deliveredOn ?? order.expectedDelivery ?? 'Pending',
      done: ['Delivered', 'Returned'].includes(order.status),
    },
    {
      label: 'Settlement eligible',
      at: order.settlementDate ? `Expected ${order.settlementDate}` : 'After return window closes',
      done: false,
    },
  ]

  return (
    <>
      <PageHeader
        title={`Order ${order.id}`}
        description={`${order.customer} · ${order.date} · part of customer order ${order.parentOrder}`}
        breadcrumb={[
          { label: 'Dashboard', to: '/seller' },
          { label: 'Orders', to: '/seller/orders' },
          { label: order.id, to: `/seller/orders/${order.id}` },
        ]}
        actions={<StatusBadge status={order.status} />}
      />

      {/* Next action strip — one obvious primary action per state */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border bg-card px-5 py-4 shadow-xs">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Next action</p>
          <p className="mt-0.5 text-[15px] font-semibold text-ink-900 dark:text-white">
            {order.status === 'New' && 'Accept this order to start fulfilment'}
            {order.status === 'Processing' && 'Pack the product and confirm'}
            {order.status === 'Packed' && 'Generate a shipping label or enter courier details'}
            {order.status === 'Shipped' && 'Shipment is on the way — track it'}
            {order.status === 'Delivered' && 'Delivered. Settlement follows the return window'}
            {order.status === 'Cancelled' && 'This order was cancelled'}
            {order.status === 'Returned' && 'Respond to the return request'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {order.status === 'New' && (
            <>
              <Button
                onClick={() => {
                  setStatus('Processing')
                  toast.success('Order accepted successfully.')
                }}
              >
                <Check className="size-4" />
                Accept Order
              </Button>
              <Button
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/8"
                onClick={() =>
                  ask({
                    title: 'Why are you cancelling this order?',
                    description:
                      'Cancelling orders may affect your seller performance. The customer is refunded and inventory is restored.',
                    confirmLabel: 'Confirm Cancellation',
                    destructive: true,
                    reasons: CANCEL_REASONS,
                    requireNote: true,
                    successMessage: 'Order cancelled',
                  })
                }
              >
                <Ban className="size-4" />
                Cancel Order
              </Button>
            </>
          )}
          {order.status === 'Processing' && (
            <Button
              disabled={!allPacked}
              onClick={() => {
                setStatus('Packed')
                toast.success('Order marked as packed')
              }}
            >
              <PackageCheck className="size-4" />
              Confirm Packed
            </Button>
          )}
          {order.status === 'Packed' && (
            <Button
              onClick={() => {
                if (shipMode === 'manual' && (!courier || !awb)) {
                  toast.error('Enter courier name and tracking number')
                  return
                }
                // Label flow: the courier and AWB come back from logistics.
                if (shipMode === 'label') {
                  setCourier('Delhivery')
                  setAwb('DLV12345678')
                }
                setStatus('Shipped')
                toast.success('Shipment details updated successfully.')
              }}
            >
              <Truck className="size-4" />
              {shipMode === 'label' ? 'Mark Ready for Pickup' : 'Mark as Shipped'}
            </Button>
          )}
          {order.status === 'Shipped' && (
            <Button variant="outline">
              <Truck className="size-4" />
              Track Shipment
            </Button>
          )}
        </div>
      </div>

      {order.returnCase && (
        <Alert variant="warning" className="mb-5">
          <Undo2 />
          <AlertTitle>
            Return requested · {order.returnCase.id} · <StatusBadge status={order.returnCase.status} className="ml-1" />
          </AlertTitle>
          <AlertDescription>
            {order.returnCase.reason} — requested {order.returnCase.requested}. SafalMarketHub makes the final decision; add your
            response below.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="grid gap-4">
          {/* Packing checklist */}
          {order.status === 'Processing' && (
            <Panel title="Pack this order" description="Confirm each check before marking the order packed.">
              <ul className="grid gap-2.5">
                {[
                  { key: 'product' as const, label: 'Product verified' },
                  { key: 'quantity' as const, label: 'Quantity verified' },
                  { key: 'package' as const, label: 'Package prepared' },
                ].map((c) => (
                  <li key={c.key}>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-sm border px-3.5 py-3">
                      <Checkbox
                        checked={packChecks[c.key]}
                        onCheckedChange={(v) => setPackChecks((prev) => ({ ...prev, [c.key]: Boolean(v) }))}
                      />
                      <span className="text-[13px] text-ink-700 dark:text-ink-300">{c.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {/* Shipping */}
          {order.status === 'Packed' && (
            <Panel title="Ship this order" description="Use SafalMarketHub logistics or your own courier.">
              <div className="flex rounded-sm border p-0.5">
                {(
                  [
                    { key: 'label' as const, label: 'SafalMarketHub logistics' },
                    { key: 'manual' as const, label: 'My own courier' },
                  ]
                ).map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setShipMode(m.key)}
                    className={
                      'flex-1 rounded-[6px] px-3 py-2 text-[13px] font-semibold transition-colors ' +
                      (shipMode === m.key ? 'bg-brand-600 text-white' : 'text-ink-500 hover:text-ink-900 dark:hover:text-white')
                    }
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {shipMode === 'label' ? (
                <div className="mt-5">
                  <DefinitionList
                    items={[
                      { label: 'Courier', value: 'Delhivery' },
                      { label: 'Shipping service', value: 'Surface — 3 to 5 days' },
                      { label: 'AWB number', value: <span className="tabular">DLV12345678</span> },
                      { label: 'Estimated pickup', value: 'Today, before 6:00 pm' },
                      { label: 'Estimated delivery', value: '16 Aug 2026' },
                      { label: 'Shipping charge', value: money(order.shipping || 65), hint: 'Deducted at settlement' },
                    ]}
                  />
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast.success('Shipping label generated')}>
                      <Printer className="size-4" />
                      Generate Shipping Label
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toast.success('Label downloaded')}>
                      <Download className="size-4" />
                      Download Label
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-[7px]">
                    <Label htmlFor="courier">Courier Name</Label>
                    <Input id="courier" value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="Delhivery" />
                  </div>
                  <div className="grid gap-[7px]">
                    <Label htmlFor="awb">Tracking / AWB Number</Label>
                    <Input id="awb" value={awb} onChange={(e) => setAwb(e.target.value)} placeholder="DLV12345678" />
                  </div>
                  <div className="grid gap-[7px]">
                    <Label htmlFor="shipdate">Shipping Date</Label>
                    <Input id="shipdate" placeholder="12 Aug 2026" />
                  </div>
                </div>
              )}
            </Panel>
          )}

          {/* Tracking */}
          {(order.status === 'Shipped' || order.status === 'Delivered') && (
            <Panel title="Shipment">
              <DefinitionList
                items={[
                  { label: 'Courier', value: order.courier ?? courier ?? 'Delhivery' },
                  { label: 'Tracking / AWB', value: <span className="tabular">{order.awb ?? awb}</span> },
                  { label: 'Shipped on', value: order.shippedOn ?? '12 Aug 2026' },
                  order.status === 'Delivered'
                    ? { label: 'Delivered on', value: order.deliveredOn ?? '—' }
                    : { label: 'Estimated delivery', value: order.expectedDelivery ?? '16 Aug 2026' },
                ]}
              />
              <div className="mt-5">
                <Button variant="outline" size="sm">
                  <Truck className="size-4" />
                  Track Shipment
                </Button>
              </div>
            </Panel>
          )}

          {/* Items */}
          <Panel title="Order items" padded={false}>
            <ul className="divide-y">
              {order.items.map((item) => (
                <li key={item.sku} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <ProductThumb glyph={item.glyph} tone={item.tone} className="aspect-square size-14 shrink-0 rounded-sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-ink-900 dark:text-white">{item.name}</p>
                    <p className="mt-0.5 text-[12px] text-ink-500 tabular">
                      {item.variant} · {item.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold tabular text-ink-900 dark:text-white">{money(item.price)}</p>
                    <p className="text-[12px] text-ink-500 tabular">× {item.qty}</p>
                  </div>
                  <p className="w-[92px] text-right text-[14px] font-bold tabular text-ink-950 dark:text-white">
                    {money(item.price * item.qty)}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Return response */}
          {order.returnCase && (
            <Panel title="Your response to the return" description="Add a comment or evidence. SafalMarketHub makes the final decision.">
              <Textarea
                value={returnResponse}
                onChange={(e) => setReturnResponse(e.target.value)}
                placeholder="Describe what you found, packaging condition, or attach serial number evidence."
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={!returnResponse.trim()}
                  onClick={() => {
                    setReturnResponse('')
                    toast.success('Response submitted to SafalMarketHub')
                  }}
                >
                  Submit response
                </Button>
                <Button variant="outline" size="sm">
                  Attach evidence
                </Button>
              </div>
              <div className="mt-5 border-t pt-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Return progress</p>
                <ol className="mt-3 flex flex-wrap items-center gap-2">
                  {['Requested', 'Under Review', 'Approved', 'Pickup Scheduled', 'Returned', 'Refund Processed'].map((s, i) => (
                    <li key={s} className="flex items-center gap-2">
                      {i > 0 && <span aria-hidden className="text-ink-300">→</span>}
                      <StatusBadge status={s} />
                    </li>
                  ))}
                </ol>
              </div>
            </Panel>
          )}
        </div>

        <div className="grid content-start gap-4">
          {/* Seller-specific financials */}
          <Panel title="Your earnings from this order">
            <MoneyRows
              rows={[
                { label: 'Product value', value: money(order.productValue) },
                { label: 'Shipping', value: order.shipping ? money(order.shipping) : 'Free' },
                { label: 'Platform commission', value: `− ${money(order.commission)}`, tone: 'negative' },
                { label: 'Other applicable charges', value: order.otherCharges ? `− ${money(order.otherCharges)}` : '—', tone: 'negative' },
                { label: 'Expected settlement', value: money(order.settlement), tone: 'total' },
              ]}
            />
            <p className="mt-4 border-t pt-3.5 text-[12px] text-ink-500">
              {order.settlementDate
                ? `Expected settlement date ${order.settlementDate}.`
                : 'Settlement becomes eligible after delivery and the return window.'}
            </p>
          </Panel>

          <Panel title="Customer">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-ink-500">
                <User className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-ink-900 dark:text-white">{order.customer}</p>
                <p className="mt-0.5 text-[12px] text-ink-500 tabular">{order.phoneMasked}</p>
              </div>
            </div>
            <p className="mt-4 flex gap-2.5 border-t pt-4 text-[13px] leading-relaxed text-ink-700 dark:text-ink-200">
              <MapPin className="mt-0.5 size-4 shrink-0 text-ink-400" />
              {order.address}
            </p>
            <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-ink-500">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
              Contact details are partially masked. Full details are shared with the courier only.
            </p>
          </Panel>

          <Panel title="Payment">
            <DefinitionList
              columns={1}
              items={[
                { label: 'Payment status', value: <StatusBadge status={order.payment === 'Paid' ? 'Successful' : order.payment} /> },
                { label: 'Collected by', value: 'SafalMarketHub · settled to you' },
                { label: 'Customer order', value: <span className="tabular">{order.parentOrder}</span> },
              ]}
            />
          </Panel>

          <Panel title="Pickup address">
            <p className="text-[13px] leading-relaxed text-ink-700 dark:text-ink-200">
              Main Warehouse · Unit 402, Sunrise Business Park, Andheri East, Mumbai 400069
            </p>
            <Button variant="ghost" size="sm" className="mt-3" asChild>
              <AdminLink to="/seller/profile" search={{ tab: 'pickup' }}>
                Change pickup address
              </AdminLink>
            </Button>
          </Panel>

          <Panel title="Order timeline">
            <Timeline steps={timeline} />
          </Panel>

          {order.status === 'New' && (
            <Alert variant="info">
              <TriangleAlert />
              <AlertDescription>
                Accept within 24 hours to keep your fulfilment score healthy. Unaccepted orders may be auto-cancelled.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <ActionDialog
        config={config}
        open={open}
        onOpenChange={setOpen}
        onConfirm={() => setStatus('Cancelled')}
      />
    </>
  )
}

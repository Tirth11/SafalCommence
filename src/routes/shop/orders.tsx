import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
  Ban,
  BadgeCheck,
  Check,
  CircleAlert,
  Copy,
  MapPin,
  Package,
  Printer,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
  Undo2,
} from 'lucide-react'
import { toast } from 'sonner'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { DefinitionList, EmptyState, PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { ProductThumb } from '@/components/commerce/product-thumb'
import { PriceDetails, SellerLine } from '@/components/shop/shop-bits'
import { AccountLayout, Field } from '@/routes/shop/account'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  CANCEL_REASONS,
  CUSTOMER_ORDERS,
  CUSTOMER_RETURNS,
  getOrder,
  ORDER_TABS,
  RETURN_LIFECYCLE,
  RETURN_REASONS,
  trackingSteps,
  type CustomerOrder,
} from '@/data/shop'
import { cn, inr } from '@/lib/utils'

/* ----------------------------------------------------------- orders list --- */
export function MyOrdersPage() {
  const search = useAdminSearch()
  const tab = (search.tab ?? 'All') as (typeof ORDER_TABS)[number]

  const orders =
    tab === 'All'
      ? CUSTOMER_ORDERS
      : tab === 'Returns'
        ? CUSTOMER_ORDERS.filter((o) => CUSTOMER_RETURNS.some((r) => r.order === o.id))
        : tab === 'Shipped'
          ? CUSTOMER_ORDERS.filter((o) => ['Shipped', 'Out for Delivery'].includes(o.status))
          : CUSTOMER_ORDERS.filter((o) => o.status === tab)

  return (
    <AccountLayout>
      <PageHeader title="My Orders" description="Track deliveries, cancel eligible orders and start returns." />

      <div className="mb-4 overflow-x-auto no-scrollbar">
        <div className="flex min-w-max gap-1 rounded-lg border bg-card p-1 shadow-xs">
          {ORDER_TABS.map((t) => (
            <AdminLink
              key={t}
              to="/account/orders"
              search={t === 'All' ? undefined : { tab: t }}
              className={cn(
                'rounded-sm px-3.5 py-2 text-[13px] font-semibold transition-colors',
                tab === t
                  ? 'bg-brand-600 text-white'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-secondary'
              )}
            >
              {t}
            </AdminLink>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <Panel padded={false}>
          <EmptyState
            icon={Package}
            title="No orders yet"
            body="When you place an order, it will appear here."
            action={
              <Button asChild>
                <AdminLink to="/shop/all">Explore Products</AdminLink>
              </Button>
            }
          />
        </Panel>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </AccountLayout>
  )
}

function OrderCard({ order }: { order: CustomerOrder }) {
  return (
    <article className="overflow-hidden rounded-lg border bg-card shadow-xs">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b bg-muted/40 px-5 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-400">Order</p>
            <p className="text-[13px] font-semibold tabular text-ink-900 dark:text-white">{order.id}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-400">Placed on</p>
            <p className="text-[13px] text-ink-700 dark:text-ink-200">{order.placedOn}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-400">Total</p>
            <p className="text-[13px] font-semibold tabular text-ink-900 dark:text-white">{inr(order.total)}</p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </header>

      {order.shipments.map((shipment) => (
        <div key={shipment.id} className="border-b last:border-0">
          {order.shipments.length > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/20 px-5 py-2">
              <SellerLine seller={shipment.seller} />
              <span className="flex items-center gap-2 text-[11px] text-ink-500">
                <StatusBadge status={shipment.status} />
                {shipment.estimate}
              </span>
            </div>
          )}
          <ul className="divide-y">
            {shipment.items.map((item) => (
              <li key={item.productId} className="flex gap-4 px-5 py-4">
                <AdminLink to={`/product/${item.productId}`} className="shrink-0">
                  <ProductThumb glyph={item.glyph} tone={item.tone} className="aspect-square size-16 rounded-sm" />
                </AdminLink>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-ink-900 dark:text-white">{item.name}</p>
                  <p className="mt-0.5 text-[12px] text-ink-500">
                    {item.variant} · Qty {item.qty}
                  </p>
                  {order.shipments.length === 1 && <p className="mt-1 text-[12px] text-ink-500">{shipment.estimate}</p>}
                  {order.shipments.length > 1 && <SellerLine seller={shipment.seller} className="mt-1.5" />}
                </div>
                <p className="shrink-0 text-[14px] font-semibold tabular">{inr(item.price * item.qty)}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <footer className="flex flex-wrap items-center gap-2 border-t px-5 py-3">
        <Button variant="outline" size="sm" asChild>
          <AdminLink to={`/account/orders/${order.id}`}>View Details</AdminLink>
        </Button>
        {['Shipped', 'Out for Delivery', 'Packed', 'Processing'].includes(order.status) && (
          <Button size="sm" asChild>
            <AdminLink to={`/account/orders/${order.id}`}>
              <Truck className="size-4" />
              Track Order
            </AdminLink>
          </Button>
        )}
        {order.status === 'Delivered' && (
          <Button variant="outline" size="sm" asChild>
            <AdminLink to={`/account/orders/${order.id}`} search={{ action: 'return' }}>
              <Undo2 className="size-4" />
              Return Product
            </AdminLink>
          </Button>
        )}
      </footer>
    </article>
  )
}

/* ---------------------------------------------------------- order detail --- */
export function OrderDetailPage() {
  const { orderId } = useParams({ strict: false }) as { orderId?: string }
  const search = useAdminSearch()
  const navigate = useNavigate()
  const { config, open, setOpen, ask } = useActionDialog()

  const base = orderId ? getOrder(orderId) : undefined
  const [status, setStatus] = useState(base?.status)
  const [returnDraft, setReturnDraft] = useState({ reason: '', notes: '' })
  const [returnSubmitted, setReturnSubmitted] = useState<string | null>(null)

  if (!base) {
    return (
      <AccountLayout>
        <Panel padded={false}>
          <EmptyState
            title="Order not found"
            body="We couldn't find this order on your account."
            action={
              <Button variant="outline" size="sm" asChild>
                <AdminLink to="/account/orders">Back to my orders</AdminLink>
              </Button>
            }
          />
        </Panel>
      </AccountLayout>
    )
  }

  const order = { ...base, status: status ?? base.status }
  const cancelled = order.status === 'Cancelled'
  const returnView = search.action === 'return'
  const existingReturn = CUSTOMER_RETURNS.find((r) => r.order === order.id)

  /* ------------------------------------------------------- return request -- */
  if (returnView) {
    const shipment = order.shipments.find((s) => s.status === 'Delivered') ?? order.shipments[0]
    const item = shipment.items[0]

    if (returnSubmitted) {
      return (
        <AccountLayout>
          <Panel padded={false}>
            <EmptyState
              icon={BadgeCheck}
              title="Return request submitted"
              body={`Return ID ${returnSubmitted} · Status: Under Review. We'll notify you when your return request is updated.`}
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Button asChild>
                    <AdminLink to="/account/returns">Track Return</AdminLink>
                  </Button>
                  <Button variant="outline" asChild>
                    <AdminLink to="/account/orders">Back to Orders</AdminLink>
                  </Button>
                </div>
              }
            />
          </Panel>
        </AccountLayout>
      )
    }

    return (
      <AccountLayout>
        <PageHeader
          title="Why are you returning this product?"
          description={`Order ${order.id} · ${item.name}`}
          breadcrumb={[
            { label: 'My Orders', to: '/account/orders' },
            { label: order.id, to: `/account/orders/${order.id}` },
            { label: 'Return', to: `/account/orders/${order.id}` },
          ]}
        />

        <Panel>
          <div className="flex gap-4 border-b pb-5">
            <ProductThumb glyph={item.glyph} tone={item.tone} className="aspect-square size-16 shrink-0 rounded-sm" />
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-ink-900 dark:text-white">{item.name}</p>
              <p className="mt-0.5 text-[12px] text-ink-500">
                {item.variant} · Qty {item.qty} · {inr(item.price)}
              </p>
              <SellerLine seller={shipment.seller} className="mt-1.5" />
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <Field label="Reason for return" required>
              <Select value={returnDraft.reason} onValueChange={(v) => setReturnDraft({ ...returnDraft, reason: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {RETURN_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Description" hint="Tell us what's wrong. Photos help us approve faster.">
              <Textarea
                rows={4}
                value={returnDraft.notes}
                onChange={(e) => setReturnDraft({ ...returnDraft, notes: e.target.value })}
                placeholder="Describe the issue with the product"
              />
            </Field>
            <div>
              <Button variant="outline" size="sm">
                Add photos or video
              </Button>
              <p className="mt-2 text-[12px] text-ink-500">JPG, PNG or MP4 · up to 10 MB each</p>
            </div>
          </div>

          <Alert variant="info" className="mt-5">
            <CircleAlert />
            <AlertDescription>
              This product is eligible for return until {shipment.returnableUntil ?? '19 Aug 2026'}. Refunds are issued to
              your original payment method after quality check.
            </AlertDescription>
          </Alert>

          <div className="mt-6 flex flex-wrap gap-3 border-t pt-5">
            <Button
              disabled={!returnDraft.reason}
              onClick={() => {
                setReturnSubmitted('RET-10023')
                toast.success('Your return request has been submitted.')
              }}
            >
              Submit Return Request
            </Button>
            <Button variant="outline" asChild>
              <AdminLink to={`/account/orders/${order.id}`}>Cancel</AdminLink>
            </Button>
          </div>
        </Panel>
      </AccountLayout>
    )
  }

  /* ------------------------------------------------------------ order view -- */
  return (
    <AccountLayout>
      <PageHeader
        title={`Order ${order.id}`}
        description={`Placed on ${order.placedOn} · ${order.shipments.length} ${order.shipments.length === 1 ? 'delivery' : 'deliveries'}`}
        breadcrumb={[
          { label: 'My Orders', to: '/account/orders' },
          { label: order.id, to: `/account/orders/${order.id}` },
        ]}
        actions={
          <>
            <StatusBadge status={order.status} />
            <Button variant="outline" size="sm" onClick={() => toast.success('Invoice downloaded')}>
              <Printer className="size-4" />
              Invoice
            </Button>
            {order.cancellable && !cancelled && (
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/8"
                onClick={() =>
                  ask({
                    title: 'Cancel this order?',
                    description: `${order.id} · ${inr(order.total)}. If you have paid, your refund will be initiated according to the applicable refund policy.`,
                    confirmLabel: 'Confirm Cancellation',
                    destructive: true,
                    reasons: CANCEL_REASONS,
                    successMessage: 'Your order has been cancelled.',
                  })
                }
              >
                <Ban className="size-4" />
                Cancel Order
              </Button>
            )}
          </>
        }
      />

      {cancelled && (
        <Alert variant="default" className="mb-4">
          <Ban />
          <AlertTitle>Order cancelled</AlertTitle>
          <AlertDescription>
            {order.cancelReason ? `Reason: ${order.cancelReason}. ` : ''}
            {order.paymentStatus === 'Refunded'
              ? `A refund of ${inr(order.total)} has been issued to your original payment method.`
              : 'Your refund will be initiated according to the applicable refund policy.'}
          </AlertDescription>
        </Alert>
      )}

      {!order.cancellable && !cancelled && ['Shipped', 'Out for Delivery'].includes(order.status) && (
        <Alert variant="info" className="mb-4">
          <Truck />
          <AlertDescription>
            This order can no longer be cancelled because it has already been shipped. You may request a return after
            delivery if the product is eligible.
          </AlertDescription>
        </Alert>
      )}

      {existingReturn && (
        <Alert variant="warning" className="mb-4">
          <Undo2 />
          <AlertTitle>Return in progress · {existingReturn.id}</AlertTitle>
          <AlertDescription>
            {existingReturn.product} — currently {existingReturn.status.toLowerCase()}.{' '}
            <AdminLink to="/account/returns" className="font-semibold underline">
              Track return
            </AdminLink>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4">
          {order.shipments.map((shipment, index) => {
            const steps = trackingSteps(shipment.status)
            return (
              <Panel
                key={shipment.id}
                title={
                  <span className="flex flex-wrap items-center gap-2.5">
                    {order.shipments.length > 1 ? `Delivery ${index + 1} of ${order.shipments.length}` : 'Your delivery'}
                    <StatusBadge status={shipment.status} />
                  </span>
                }
                description={shipment.estimate}
                padded={false}
              >
                <div className="border-b bg-muted/30 px-5 py-2.5">
                  <SellerLine seller={shipment.seller} />
                </div>

                <ul className="divide-y">
                  {shipment.items.map((item) => (
                    <li key={item.productId} className="flex gap-4 px-5 py-4">
                      <AdminLink to={`/product/${item.productId}`} className="shrink-0">
                        <ProductThumb glyph={item.glyph} tone={item.tone} className="aspect-square size-16 rounded-sm" />
                      </AdminLink>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-semibold text-ink-900 dark:text-white">{item.name}</p>
                        <p className="mt-0.5 text-[12px] text-ink-500">
                          {item.variant} · Qty {item.qty}
                        </p>
                        {shipment.status === 'Delivered' && (
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" className="h-8" asChild>
                              <AdminLink to={`/account/orders/${order.id}`} search={{ action: 'return' }}>
                                <Undo2 className="size-3.5" />
                                Return Product
                              </AdminLink>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              onClick={() =>
                                ask({
                                  title: 'Rate & review',
                                  description: `Share your experience with ${item.name}. Only customers who received the product can review it.`,
                                  confirmLabel: 'Submit Review',
                                  reasons: ['5 — Excellent', '4 — Good', '3 — Average', '2 — Poor', '1 — Very poor'],
                                  reasonLabel: 'Rating',
                                  requireNote: true,
                                  successMessage: 'Thanks for your review',
                                })
                              }
                            >
                              <Star className="size-3.5" />
                              Rate & Review
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="shrink-0 text-[14px] font-semibold tabular">{inr(item.price * item.qty)}</p>
                    </li>
                  ))}
                </ul>

                {/* Tracking timeline */}
                {!['Cancelled'].includes(shipment.status) && (
                  <div className="border-t px-5 py-5">
                    <ol className="grid gap-0">
                      {steps.map((step, i) => (
                        <li key={step.label} className="relative flex gap-4 pb-5 last:pb-0">
                          {i < steps.length - 1 && (
                            <span
                              aria-hidden
                              className={cn('absolute left-[9px] top-5 h-full w-px', step.done ? 'bg-teal-500/40' : 'bg-border')}
                            />
                          )}
                          <span
                            className={cn(
                              'relative z-10 mt-0.5 grid size-[19px] shrink-0 place-items-center rounded-full border-2',
                              step.done && 'border-teal-500 bg-teal-500 text-white',
                              step.current && 'border-brand-600 bg-brand-600 text-white',
                              !step.done && !step.current && 'border-ink-300 bg-background'
                            )}
                          >
                            {step.done && <Check className="size-3" strokeWidth={3.5} />}
                            {step.current && <span className="size-1.5 rounded-full bg-white" />}
                          </span>
                          <div>
                            <p
                              className={cn(
                                'text-[13px]',
                                step.current
                                  ? 'font-bold text-brand-700 dark:text-brand-200'
                                  : step.done
                                    ? 'font-semibold text-ink-900 dark:text-white'
                                    : 'text-ink-400'
                              )}
                            >
                              {step.label}
                            </p>
                            {step.current && <p className="mt-0.5 text-[12px] text-ink-500">{shipment.estimate}</p>}
                          </div>
                        </li>
                      ))}
                    </ol>

                    {shipment.tracking && (
                      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-sm border bg-muted/40 px-4 py-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-400">Courier</p>
                          <p className="text-[13px] font-semibold text-ink-900 dark:text-white">{shipment.courier}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-400">Tracking number</p>
                          <p className="flex items-center gap-2 text-[13px] font-semibold tabular text-ink-900 dark:text-white">
                            {shipment.tracking}
                            <button
                              type="button"
                              aria-label="Copy tracking number"
                              onClick={() => toast.success('Tracking number copied')}
                              className="text-ink-400 hover:text-ink-800 dark:hover:text-white"
                            >
                              <Copy className="size-3.5" />
                            </button>
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto h-8 bg-background">
                          <Truck className="size-3.5" />
                          Track Shipment
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Panel>
            )
          })}
        </div>

        <div className="grid content-start gap-4">
          <Panel title="Delivery address">
            <p className="text-[14px] font-semibold text-ink-900 dark:text-white">{order.address.name}</p>
            <p className="mt-1 flex gap-2 text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">
              <MapPin className="mt-0.5 size-4 shrink-0 text-ink-400" />
              <span>
                {order.address.line1}
                {order.address.line2 ? `, ${order.address.line2}` : ''}, {order.address.city}, {order.address.state}{' '}
                {order.address.pin}
              </span>
            </p>
            <p className="mt-1.5 text-[12px] text-ink-500 tabular">{order.address.phone}</p>
          </Panel>

          <Panel title="Payment summary">
            <PriceDetails
              subtotal={order.subtotal}
              discount={order.discount}
              shipping={order.shipping}
              tax={order.tax}
              total={order.total}
            />
            <div className="mt-4 border-t pt-4">
              <DefinitionList
                columns={1}
                items={[
                  { label: 'Payment method', value: order.paymentMethod },
                  { label: 'Payment status', value: <StatusBadge status={order.paymentStatus === 'Paid' ? 'Successful' : order.paymentStatus} /> },
                ]}
              />
            </div>
          </Panel>

          <Panel title="Need help?">
            <p className="text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">
              Something wrong with this order? Raise a request and we'll look into it with the seller.
            </p>
            <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
              <AdminLink to="/account/support" search={{ view: 'new', order: order.id, topic: 'My Order' }}>
                Contact Support
              </AdminLink>
            </Button>
          </Panel>

          <p className="flex items-start gap-2 text-[11px] leading-relaxed text-ink-500">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            Your contact details are shared with the courier only for this delivery.
          </p>
        </div>
      </div>

      <ActionDialog
        config={config}
        open={open}
        onOpenChange={setOpen}
        onConfirm={() => {
          if (config?.confirmLabel === 'Confirm Cancellation') {
            setStatus('Cancelled')
            navigate(adminLinkProps({ to: `/account/orders/${order.id}` }))
          }
        }}
      />
    </AccountLayout>
  )
}

/* ------------------------------------------------------ returns & refunds -- */
export function ReturnsPage() {
  return (
    <AccountLayout>
      <PageHeader title="Returns & Refunds" description="Every return you've raised, and where the money is." />

      {CUSTOMER_RETURNS.length === 0 ? (
        <Panel padded={false}>
          <EmptyState
            icon={RotateCcw}
            title="No return requests"
            body="Your return requests will appear here."
            action={
              <Button variant="outline" asChild>
                <AdminLink to="/account/orders">View my orders</AdminLink>
              </Button>
            }
          />
        </Panel>
      ) : (
        <div className="grid gap-4">
          {CUSTOMER_RETURNS.map((request) => {
            const stageIndex = RETURN_LIFECYCLE.indexOf(request.status)
            const rejected = request.status === 'Rejected'
            return (
              <Panel
                key={request.id}
                title={
                  <span className="flex flex-wrap items-center gap-2.5">
                    <span className="tabular">{request.id}</span>
                    <StatusBadge status={request.status} />
                  </span>
                }
                description={`Order ${request.order} · requested ${request.requestedOn}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-ink-900 dark:text-white">{request.product}</p>
                    <p className="mt-0.5 text-[12px] text-ink-500">{request.variant}</p>
                    <p className="mt-2 text-[13px] text-ink-600 dark:text-ink-300">
                      <span className="font-semibold">Reason:</span> {request.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-400">Refund amount</p>
                    <p className="text-[19px] font-bold tabular text-ink-950 dark:text-white">{inr(request.amount)}</p>
                    <p className="mt-0.5 text-[11px] text-ink-500">to {request.refundTo}</p>
                  </div>
                </div>

                {rejected ? (
                  <Alert variant="destructive" className="mt-5">
                    <CircleAlert />
                    <AlertTitle>Return request rejected</AlertTitle>
                    <AlertDescription>{request.rejectionReason}</AlertDescription>
                  </Alert>
                ) : (
                  <ol className="mt-5 flex flex-wrap items-center gap-2 border-t pt-5">
                    {RETURN_LIFECYCLE.map((stage, i) => (
                      <li key={stage} className="flex items-center gap-2">
                        {i > 0 && <span aria-hidden className="text-ink-300">→</span>}
                        <span
                          className={cn(
                            'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                            i < stageIndex && 'border-teal-100 bg-teal-50 text-teal-600 dark:border-teal-600/40 dark:bg-teal-600/15 dark:text-teal-100',
                            i === stageIndex && 'border-brand-600 bg-brand-600 text-white',
                            i > stageIndex && 'border-ink-200 text-ink-400 dark:border-ink-700'
                          )}
                        >
                          {stage}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}

                {request.status === 'Refunded' && (
                  <div className="mt-5 rounded-lg border border-teal-100 bg-teal-50 p-4 dark:border-teal-600/40 dark:bg-teal-600/10">
                    <p className="flex items-center gap-2 text-[14px] font-semibold text-teal-600 dark:text-teal-100">
                      <BadgeCheck className="size-5" />
                      Refund completed
                    </p>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-teal-600/70 dark:text-teal-100/70">Amount</dt>
                        <dd className="text-[13px] font-bold tabular text-teal-700 dark:text-teal-100">{inr(request.amount)}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-teal-600/70 dark:text-teal-100/70">Reference</dt>
                        <dd className="text-[13px] font-bold tabular text-teal-700 dark:text-teal-100">{request.refundId}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-teal-600/70 dark:text-teal-100/70">Refunded on</dt>
                        <dd className="text-[13px] font-bold text-teal-700 dark:text-teal-100">{request.refundedOn}</dd>
                      </div>
                    </dl>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
                  <Button variant="outline" size="sm" asChild>
                    <AdminLink to={`/account/orders/${request.order}`}>View order</AdminLink>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <AdminLink to="/account/support" search={{ view: 'new', order: request.order, topic: 'Return / Refund' }}>
                      Contact support
                    </AdminLink>
                  </Button>
                </div>
              </Panel>
            )
          })}
        </div>
      )}
    </AccountLayout>
  )
}

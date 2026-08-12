import { useParams } from '@tanstack/react-router'
import { Ban, ShieldCheck, Truck, Undo2 } from 'lucide-react'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { AdminLink } from '@/components/admin/admin-link'
import { DefinitionList, EmptyState, MoneyRows, PageHeader, Panel, Timeline } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ADMIN_ORDERS, ORDER_TIMELINE } from '@/data/admin'
import { money } from '@/lib/utils'

const CANCEL_REASONS = [
  'Seller unable to fulfil',
  'Product unavailable',
  'Buyer request',
  'Payment issue',
  'Fraud suspicion',
  'Delivery issue',
  'Administrative reason',
]

export function AdminOrderDetailPage() {
  const { orderId } = useParams({ strict: false }) as { orderId?: string }
  const { config, open, setOpen, ask } = useActionDialog()

  const order = ADMIN_ORDERS.find((o) => o.id === orderId)

  if (!order) {
    return (
      <Panel padded={false}>
        <EmptyState
          title="Order not found"
          body="This order reference does not exist."
          action={
            <Button variant="outline" size="sm" asChild>
              <AdminLink to="/admin/orders">Back to orders</AdminLink>
            </Button>
          }
        />
      </Panel>
    )
  }

  const commission = order.subOrders.reduce((sum, s) => sum + s.commission, 0)
  const receivable = order.subOrders.reduce((sum, s) => sum + s.receivable, 0)
  const cancellable = !['Delivered', 'Cancelled', 'Returned'].includes(order.fulfilment)

  return (
    <>
      <PageHeader
        title={`Order ${order.id}`}
        description={`${order.buyer} · ${order.date} · ${order.subOrders.length} seller sub-order${order.subOrders.length > 1 ? 's' : ''}`}
        breadcrumb={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'Orders', to: '/admin/orders' },
          { label: order.id, to: `/admin/orders/${order.id}` },
        ]}
        actions={
          <>
            <StatusBadge status={order.payment} />
            <StatusBadge status={order.fulfilment} />
            {order.payment === 'Successful' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  ask({
                    title: 'Initiate refund',
                    description: `You are about to refund ${money(order.value)} to ${order.buyer}. Commission and seller receivable are reversed automatically. Continue?`,
                    confirmLabel: 'Approve Refund',
                    reasons: ['Order cancelled', 'Return approved', 'Service failure', 'Goodwill adjustment'],
                    requireNote: true,
                    successMessage: 'Refund initiated',
                  })
                }
              >
                <Undo2 className="size-4" />
                Initiate Refund
              </Button>
            )}
            {cancellable && (
              <Button
                size="sm"
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/8"
                onClick={() =>
                  ask({
                    title: `Cancel order ${order.id}?`,
                    description:
                      'Eligible items are cancelled, inventory is restored, a refund is initiated where payment succeeded, and commission plus seller receivable are adjusted. Buyer and sellers are notified.',
                    confirmLabel: 'Cancel Order',
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
            )}
          </>
        }
      />

      {order.payment === 'Failed' && (
        <Alert variant="destructive" className="mb-4">
          <Ban />
          <AlertTitle>Payment failed for this order</AlertTitle>
          <AlertDescription>
            The order was cancelled automatically. Failed payments can only be reconciled from verified gateway data —
            never marked successful by hand.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="grid gap-4">
          {/* Sub-orders */}
          {order.subOrders.map((sub) => (
            <Panel
              key={sub.id}
              title={
                <span className="flex flex-wrap items-center gap-2.5">
                  <span className="tabular">{sub.id}</span>
                  <StatusBadge status={sub.fulfilment} />
                </span>
              }
              description={`Seller: ${sub.seller}`}
              actions={
                <Button variant="ghost" size="sm" asChild>
                  <AdminLink to={`/admin/sellers/${sub.sellerId}`}>Open seller</AdminLink>
                </Button>
              }
              padded={false}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sub.items.map((item) => (
                    <TableRow key={item.sku}>
                      <TableCell className="font-semibold text-ink-900 dark:text-white">{item.name}</TableCell>
                      <TableCell className="tabular text-ink-500">{item.sku}</TableCell>
                      <TableCell className="text-right tabular">{item.qty}</TableCell>
                      <TableCell className="text-right tabular">{money(item.price)}</TableCell>
                      <TableCell className="text-right font-semibold tabular">{money(item.price * item.qty)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="grid gap-x-8 gap-y-3 border-t bg-muted/40 px-5 py-3.5 sm:grid-cols-3">
                <MiniStat label="Sub-order value" value={money(sub.value)} />
                <MiniStat label="Platform commission" value={`− ${money(sub.commission)}`} />
                <MiniStat label="Seller receivable" value={money(sub.receivable)} strong />
              </div>
              {sub.awb && (
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t px-5 py-3 text-[12px] text-ink-500">
                  <span className="flex items-center gap-1.5">
                    <Truck className="size-3.5" />
                    {sub.courier}
                  </span>
                  <span className="tabular">AWB {sub.awb}</span>
                  <Button variant="ghost" size="sm" className="ml-auto h-7">
                    Track shipment
                  </Button>
                </div>
              )}
            </Panel>
          ))}

          <Panel title="Delivery address">
            <p className="text-[14px] leading-relaxed text-ink-700 dark:text-ink-200">{order.address}</p>
            <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-ink-500">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
              Buyer contact details are available to the assigned courier only, and access is logged.
            </p>
          </Panel>
        </div>

        <div className="grid content-start gap-4">
          <Panel title="Order summary">
            <DefinitionList
              columns={1}
              items={[
                { label: 'Order number', value: <span className="tabular">{order.id}</span> },
                { label: 'Order date', value: order.date },
                {
                  label: 'Buyer',
                  value: (
                    <AdminLink to="/admin/buyers" className="text-brand-600 hover:underline dark:text-brand-300">
                      {order.buyer}
                    </AdminLink>
                  ),
                  hint: order.buyerId,
                },
                { label: 'Items', value: String(order.itemCount) },
                { label: 'Payment status', value: <StatusBadge status={order.payment} /> },
              ]}
            />
          </Panel>

          <Panel title="Financial breakdown">
            <MoneyRows
              rows={[
                { label: 'Gross value', value: money(order.value) },
                { label: 'Tax included', value: money(order.tax), hint: 'GST' },
                { label: 'Shipping', value: order.shipping ? money(order.shipping) : 'Free' },
                { label: 'Platform commission', value: `− ${money(commission)}`, tone: 'negative' },
                { label: 'Total seller receivable', value: money(receivable), tone: 'total' },
              ]}
            />
          </Panel>

          <Panel title="Payment">
            <DefinitionList
              columns={1}
              items={[
                { label: 'Gateway', value: order.gateway },
                { label: 'Method', value: order.method },
                { label: 'Gateway reference', value: <span className="tabular">{order.gatewayRef}</span> },
                { label: 'Status', value: <StatusBadge status={order.payment} /> },
              ]}
            />
            <Button variant="ghost" size="sm" className="mt-4" asChild>
              <AdminLink to="/admin/payments">Open transaction</AdminLink>
            </Button>
          </Panel>

          <Panel title="Timeline">
            <Timeline steps={ORDER_TIMELINE} />
          </Panel>
        </div>
      </div>

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}

function MiniStat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">{label}</p>
      <p
        className={
          'mt-0.5 tabular ' +
          (strong ? 'text-[15px] font-bold text-ink-950 dark:text-white' : 'text-[13px] font-semibold text-ink-800 dark:text-ink-100')
        }
      >
        {value}
      </p>
    </div>
  )
}

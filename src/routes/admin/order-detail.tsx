import { useParams } from '@tanstack/react-router'
import { Ban, MapPin, MessageSquare, Truck, Undo2 } from 'lucide-react'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { AdminLink } from '@/components/admin/admin-link'
import { DefinitionList, EmptyState, MoneyRows, PageHeader, Panel, Timeline } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ADMIN_ORDERS, ORDER_TIMELINE } from '@/data/admin'
import { inr } from '@/lib/utils'

const CANCEL_REASONS = [
  'Seller unable to fulfil',
  'Product unavailable',
  'Buyer request',
  'Payment issue',
  'Fraud suspicion',
  'Delivery issue',
  'Administrative reason',
]

export function OrderDetailPage() {
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

  const gross = order.subOrders.reduce((sum, s) => sum + s.value, 0)
  const commission = order.subOrders.reduce((sum, s) => sum + s.commission, 0)
  const receivable = order.subOrders.reduce((sum, s) => sum + s.receivable, 0)
  const cancellable = !['Delivered', 'Cancelled', 'Returned'].includes(order.fulfilment)

  return (
    <>
      <PageHeader
        title={`Order ${order.id}`}
        description={`${order.buyer} · ${order.date} · ${order.subOrders.length} seller${order.subOrders.length > 1 ? 's' : ''}`}
        breadcrumb={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'Orders', to: '/admin/orders' },
          { label: order.id, to: `/admin/orders/${order.id}` },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <MessageSquare className="size-4" />
              Escalate
            </Button>
            {order.payment === 'Successful' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  ask({
                    title: 'Initiate refund',
                    description: `You are about to refund ${inr(order.value)} to ${order.buyer}. Commission and seller receivable are reversed automatically.`,
                    confirmLabel: 'Initiate Refund',
                    reasons: ['Order cancelled', 'Return approved', 'Service failure', 'Goodwill'],
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
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/8"
                onClick={() =>
                  ask({
                    title: `Cancel order ${order.id}?`,
                    description:
                      'Eligible items are cancelled, inventory is restored, a refund is initiated where payment succeeded, commission is reversed and both buyer and sellers are notified.',
                    confirmLabel: 'Cancel Order',
                    destructive: true,
                    reasons: CANCEL_REASONS,
                    requireNote: true,
                    successMessage: `Order ${order.id} cancelled`,
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

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="grid gap-4">
          <Panel title="Order summary">
            <DefinitionList
              columns={3}
              items={[
                { label: 'Order number', value: <span className="tabular">{order.id}</span> },
                { label: 'Order date', value: order.date },
                { label: 'Buyer', value: <AdminLink to="/admin/buyers" className="text-brand-600 hover:underline dark:text-brand-300">{order.buyer}</AdminLink>, hint: order.buyerId },
                { label: 'Order total', value: <span className="tabular">{inr(order.value)}</span> },
                { label: 'Payment status', value: <StatusBadge status={order.payment} /> },
                { label: 'Fulfilment status', value: <StatusBadge status={order.fulfilment} /> },
              ]}
            />
          </Panel>

          {/* Sub-orders — one card per seller */}
          {order.subOrders.map((so) => (
            <Panel
              key={so.id}
              title={
                <span className="flex flex-wrap items-center gap-2.5">
                  <span className="tabular">{so.id}</span>
                  <StatusBadge status={so.fulfilment} />
                </span>
              }
              description={`Seller: ${so.seller}`}
              padded={false}
              actions={
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <AdminLink to={`/admin/sellers/${so.sellerId}`}>Open seller</AdminLink>
                  </Button>
                  {so.awb && (
                    <Button variant="outline" size="sm">
                      <Truck className="size-4" />
                      Track
                    </Button>
                  )}
                </div>
              }
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {so.items.map((item) => (
                    <TableRow key={item.sku}>
                      <TableCell className="font-semibold text-ink-900 dark:text-white">{item.name}</TableCell>
                      <TableCell className="tabular text-ink-500">{item.sku}</TableCell>
                      <TableCell className="text-right tabular">{item.qty}</TableCell>
                      <TableCell className="text-right tabular">{inr(item.price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="grid gap-x-8 gap-y-3 border-t bg-muted/40 px-5 py-3.5 sm:grid-cols-2 lg:grid-cols-4">
                <MiniField label="Sub-order value" value={inr(so.value)} />
                <MiniField label="Commission" value={inr(so.commission)} />
                <MiniField label="Seller receivable" value={inr(so.receivable)} strong />
                <MiniField label="Shipment" value={so.awb ? `${so.courier} · ${so.awb}` : 'Not dispatched'} />
              </div>
            </Panel>
          ))}
        </div>

        <div className="grid content-start gap-4">
          <Panel title="Financial breakdown">
            <MoneyRows
              rows={[
                { label: 'Gross value', value: inr(gross) },
                { label: 'Tax included', value: inr(order.tax) },
                { label: 'Shipping', value: order.shipping ? inr(order.shipping) : 'Free' },
                { label: 'Platform commission', value: `− ${inr(commission)}`, tone: 'negative' },
                { label: 'Seller receivable', value: inr(receivable), tone: 'total' },
              ]}
            />
          </Panel>

          <Panel title="Payment">
            <DefinitionList
              columns={1}
              items={[
                { label: 'Gateway', value: order.gateway },
                { label: 'Method', value: order.method },
                { label: 'Gateway reference', value: <span className="tabular text-[13px]">{order.gatewayRef}</span> },
                { label: 'Status', value: <StatusBadge status={order.payment} /> },
              ]}
            />
            <p className="mt-4 border-t pt-3.5 text-[11px] leading-relaxed text-ink-500">
              Card numbers, CVV and gateway credentials are never stored or displayed in the admin portal.
            </p>
          </Panel>

          <Panel title="Delivery address">
            <p className="flex gap-2.5 text-[13px] leading-relaxed text-ink-700 dark:text-ink-200">
              <MapPin className="mt-0.5 size-4 shrink-0 text-ink-400" />
              {order.address}
            </p>
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

function MiniField({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">{label}</p>
      <p className={'mt-0.5 text-[13px] tabular ' + (strong ? 'font-bold text-ink-950 dark:text-white' : 'font-medium text-ink-700 dark:text-ink-200')}>
        {value}
      </p>
    </div>
  )
}

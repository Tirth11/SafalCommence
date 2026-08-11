import { useNavigate, useParams } from '@tanstack/react-router'
import { Ban, Check, CircleAlert, Eye, FileCheck, Landmark, Pencil, RotateCcw, ShieldAlert, TriangleAlert, X } from 'lucide-react'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { DefinitionList, EmptyState, PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ADMIN_ORDERS, ADMIN_PRODUCTS, SELLERS, SETTLEMENTS, TRANSACTIONS } from '@/data/admin'
import { inr } from '@/lib/utils'

const CHANGE_REASONS = [
  'GST document unclear',
  'PAN mismatch',
  'Address proof required',
  'Bank account mismatch',
  'Business information incomplete',
]

const REJECT_REASONS = [
  'Documents could not be verified',
  'Business not eligible for the marketplace',
  'Duplicate seller application',
  'Restricted product category',
  'Failed compliance screening',
]

const SUSPEND_REASONS = [
  'Policy violation',
  'Suspicious transaction activity',
  'Repeated customer complaints',
  'Counterfeit product complaint',
  'Fraud investigation',
  'KYC expired or invalid',
]

const HOLD_REASONS = ['Return investigation', 'Chargeback', 'Bank verification issue', 'Fraud check', 'Compliance review']

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'business', label: 'Business Details' },
  { value: 'kyc', label: 'KYC' },
  { value: 'banking', label: 'Banking' },
  { value: 'products', label: 'Products' },
  { value: 'orders', label: 'Orders' },
  { value: 'payments', label: 'Payments' },
  { value: 'settlements', label: 'Settlements' },
  { value: 'activity', label: 'Activity' },
]

export function SellerDetailPage() {
  const { sellerId } = useParams({ strict: false }) as { sellerId?: string }
  const search = useAdminSearch()
  const navigate = useNavigate()
  const { config, open, setOpen, ask } = useActionDialog()

  const seller = SELLERS.find((s) => s.id === sellerId)

  if (!seller) {
    return (
      <Panel padded={false}>
        <EmptyState
          title="Seller not found"
          body="This seller reference does not exist, or you followed a stale link."
          action={
            <Button variant="outline" size="sm" asChild>
              <AdminLink to="/admin/sellers">Back to sellers</AdminLink>
            </Button>
          }
        />
      </Panel>
    )
  }

  const pendingDecision = seller.status === 'Pending Review'
  const products = ADMIN_PRODUCTS.filter((p) => p.sellerId === seller.id)
  const subOrders = ADMIN_ORDERS.flatMap((o) =>
    o.subOrders.filter((so) => so.sellerId === seller.id).map((so) => ({ ...so, parent: o }))
  )
  const settlements = SETTLEMENTS.filter((s) => s.sellerId === seller.id)

  const tab = search.tab ?? 'overview'
  function setTab(value: string) {
    navigate(adminLinkProps({ to: `/admin/sellers/${seller!.id}`, search: { tab: value } }))
  }

  return (
    <>
      <PageHeader
        title={seller.storeName}
        description={`${seller.legalName} · ${seller.businessType} · registered ${seller.registered}`}
        breadcrumb={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'Sellers', to: '/admin/sellers' },
          { label: seller.id, to: `/admin/sellers/${seller.id}` },
        ]}
        actions={
          <>
            {pendingDecision ? (
              <>
                <Button
                  size="sm"
                  onClick={() =>
                    ask({
                      title: 'Approve seller',
                      description: `${seller.storeName} will move from Pending Review to Active and can begin listing products. The seller is notified by email.`,
                      confirmLabel: 'Approve Seller',
                      successMessage: `${seller.storeName} approved`,
                    })
                  }
                >
                  <Check className="size-4" />
                  Approve Seller
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    ask({
                      title: 'Request changes',
                      description: `${seller.storeName} stays in Pending Review and is asked to correct the items you select. They can resubmit without starting again.`,
                      confirmLabel: 'Request Changes',
                      reasons: CHANGE_REASONS,
                      reasonLabel: 'What needs correcting',
                      requireNote: true,
                      successMessage: 'Changes requested',
                    })
                  }
                >
                  <Pencil className="size-4" />
                  Request Changes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/8"
                  onClick={() =>
                    ask({
                      title: 'Reject seller application',
                      description: `${seller.storeName}'s application will be closed. This cannot be undone — the business must apply again.`,
                      confirmLabel: 'Reject Application',
                      destructive: true,
                      reasons: REJECT_REASONS,
                      requireNote: true,
                      successMessage: 'Application rejected',
                    })
                  }
                >
                  <X className="size-4" />
                  Reject
                </Button>
              </>
            ) : seller.status === 'Suspended' ? (
              <Button
                size="sm"
                onClick={() =>
                  ask({
                    title: 'Reactivate seller',
                    description: `${seller.storeName} returns to Active and can accept new orders immediately.`,
                    confirmLabel: 'Reactivate Seller',
                    noteOnly: true,
                    requireNote: true,
                    successMessage: `${seller.storeName} reactivated`,
                  })
                }
              >
                <RotateCcw className="size-4" />
                Reactivate Seller
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    ask({
                      title: 'Place settlement on hold',
                      description: `Payouts to ${seller.storeName} will be blocked. The seller can keep trading and existing orders are unaffected.`,
                      confirmLabel: 'Hold Payout',
                      reasons: HOLD_REASONS,
                      requireNote: true,
                      successMessage: 'Payout placed on hold',
                    })
                  }
                >
                  <Landmark className="size-4" />
                  Hold Payout
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/8"
                  onClick={() =>
                    ask({
                      title: `Suspend ${seller.storeName}?`,
                      description:
                        'New products cannot be published and marketplace offers become unavailable. Historical orders stay accessible and active orders remain visible for admin handling.',
                      confirmLabel: 'Suspend Seller',
                      destructive: true,
                      reasons: SUSPEND_REASONS,
                      requireNote: true,
                      successMessage: `${seller.storeName} suspended`,
                    })
                  }
                >
                  <Ban className="size-4" />
                  Suspend Seller
                </Button>
              </>
            )}
          </>
        }
      />

      {/* Status strip */}
      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border bg-card px-5 py-4 shadow-xs">
        <Field label="Seller status" value={<StatusBadge status={seller.status} />} />
        <Field label="KYC" value={<StatusBadge status={seller.kyc} />} />
        <Field label="Products" value={<span className="tabular">{seller.products}</span>} />
        <Field label="Orders" value={<span className="tabular">{seller.orders}</span>} />
        <Field label="Total sales" value={<span className="tabular">{seller.sales ? inr(seller.sales) : '—'}</span>} />
        <Field label="Category" value={seller.category} />
      </div>

      {seller.statusReason && (
        <Alert variant={seller.status === 'Suspended' ? 'destructive' : 'warning'} className="mb-4">
          <TriangleAlert />
          <AlertTitle>{seller.status === 'Payout Hold' ? 'Payout on hold' : `Seller ${seller.status.toLowerCase()}`}</AlertTitle>
          <AlertDescription>{seller.statusReason}</AlertDescription>
        </Alert>
      )}

      {pendingDecision && (
        <Alert variant="info" className="mb-4">
          <CircleAlert />
          <AlertTitle>Waiting on your review</AlertTitle>
          <AlertDescription>
            Check business details, KYC documents, bank account and the first product before deciding. Submitted{' '}
            {seller.submittedOn}.
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
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Panel title="Seller overview">
              <DefinitionList
                items={[
                  { label: 'Seller ID', value: seller.id },
                  { label: 'Store name', value: seller.storeName },
                  { label: 'Legal name', value: seller.legalName },
                  { label: 'Business type', value: seller.businessType },
                  { label: 'Registration date', value: seller.registered },
                  { label: 'Status', value: <StatusBadge status={seller.status} /> },
                  { label: 'Owner', value: seller.owner },
                  { label: 'Primary contact', value: seller.email, hint: seller.phone },
                ]}
              />
            </Panel>
            <Panel title="Onboarding progress">
              <ol className="grid gap-2.5">
                {[
                  { label: 'Business details', done: seller.status !== 'Registered' },
                  { label: 'KYC documents', done: ['Submitted', 'Under Review', 'Verified'].includes(seller.kyc) },
                  { label: 'Bank account', done: seller.bank.holder !== '—' },
                  { label: 'Pickup address', done: seller.status !== 'Registered' && seller.status !== 'Onboarding' },
                  { label: 'First product', done: seller.products > 0 },
                ].map((step) => (
                  <li key={step.label} className="flex items-center gap-2.5 rounded-sm border px-3.5 py-2.5">
                    <span
                      className={
                        'grid size-5 shrink-0 place-items-center rounded-full ' +
                        (step.done ? 'bg-teal-500 text-white' : 'border border-ink-300')
                      }
                    >
                      {step.done && <Check className="size-3" strokeWidth={3.5} />}
                    </span>
                    <span className={'text-[13px] ' + (step.done ? 'font-medium text-ink-800 dark:text-ink-100' : 'text-ink-500')}>
                      {step.label}
                    </span>
                  </li>
                ))}
              </ol>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="business">
          <Panel title="Business details">
            <DefinitionList
              columns={3}
              items={[
                { label: 'GSTIN', value: <span className="tabular">{seller.gstin}</span> },
                { label: 'PAN', value: <span className="tabular">{seller.pan}</span> },
                { label: 'Business type', value: seller.businessType },
                { label: 'Registered address', value: seller.address },
                { label: 'City', value: seller.city },
                { label: 'State', value: seller.state },
                { label: 'PIN code', value: <span className="tabular">{seller.pin}</span> },
                { label: 'Primary category', value: seller.category },
                { label: 'Contact', value: seller.email, hint: seller.phone },
              ]}
            />
          </Panel>
        </TabsContent>

        <TabsContent value="kyc">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <Panel title="Submitted documents" description="Open each document and mark it verified or flag an issue." padded={false}>
              {seller.documents.length === 0 ? (
                <EmptyState
                  title="No documents submitted"
                  body="This seller has not yet uploaded verification documents."
                  icon={FileCheck}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document type</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seller.documents.map((doc) => (
                      <TableRow key={doc.type}>
                        <TableCell className="font-semibold text-ink-900 dark:text-white">{doc.type}</TableCell>
                        <TableCell className="text-ink-500">{doc.uploaded}</TableCell>
                        <TableCell>
                          <StatusBadge status={doc.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-1.5">
                            <Button variant="ghost" size="sm" className="h-8">
                              <Eye className="size-4" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="h-8">
                              Verified
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-destructive/30 text-destructive hover:bg-destructive/8"
                              onClick={() =>
                                ask({
                                  title: `Flag ${doc.type}`,
                                  description: 'The seller is asked to re-upload this document. KYC stays in review.',
                                  confirmLabel: 'Flag issue',
                                  reasons: CHANGE_REASONS,
                                  requireNote: true,
                                  successMessage: 'Issue recorded',
                                })
                              }
                            >
                              Issue
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Panel>

            <div className="grid gap-4">
              <Panel title="KYC decision">
                <DefinitionList
                  columns={1}
                  items={[
                    { label: 'Current status', value: <StatusBadge status={seller.kyc} /> },
                    { label: 'Submitted on', value: seller.submittedOn ?? '—' },
                    { label: 'GSTIN', value: <span className="tabular">{seller.gstin}</span> },
                    { label: 'PAN', value: <span className="tabular">{seller.pan}</span> },
                  ]}
                />
                <div className="mt-5 grid gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      ask({
                        title: 'Approve KYC',
                        description: `Verification for ${seller.storeName} will be marked Verified. Seller approval can then proceed.`,
                        confirmLabel: 'Approve KYC',
                        successMessage: 'KYC approved',
                      })
                    }
                  >
                    <Check className="size-4" />
                    Approve KYC
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      ask({
                        title: 'Request KYC changes',
                        description: 'The seller is notified and can re-upload the flagged documents.',
                        confirmLabel: 'Request Changes',
                        reasons: CHANGE_REASONS,
                        requireNote: true,
                        successMessage: 'Changes requested',
                      })
                    }
                  >
                    Request Changes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-destructive/30 text-destructive hover:bg-destructive/8"
                    onClick={() =>
                      ask({
                        title: 'Reject KYC',
                        description: `Verification for ${seller.storeName} will be rejected and the application closed.`,
                        confirmLabel: 'Reject KYC',
                        destructive: true,
                        reasons: REJECT_REASONS,
                        requireNote: true,
                        successMessage: 'KYC rejected',
                      })
                    }
                  >
                    Reject KYC
                  </Button>
                </div>
              </Panel>
              <Alert variant="default">
                <ShieldAlert />
                <AlertDescription>
                  Documents are served through short-lived signed links and are never exposed publicly.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="banking">
          <Panel title="Settlement account" description="Account numbers are masked — full values are never shown in the portal.">
            <DefinitionList
              items={[
                { label: 'Account holder', value: seller.bank.holder },
                { label: 'Bank', value: seller.bank.bank },
                { label: 'Account number', value: <span className="tabular">XXXX{seller.bank.last4}</span> },
                { label: 'IFSC', value: <span className="tabular">{seller.bank.ifsc}</span> },
                {
                  label: 'Verification',
                  value: <StatusBadge status={seller.bank.verified ? 'Verified' : 'Pending'} />,
                  hint: seller.bank.verified ? 'Penny-drop confirmed' : 'Penny-drop pending',
                },
              ]}
            />
          </Panel>
        </TabsContent>

        <TabsContent value="products">
          <Panel title={`Products (${products.length})`} padded={false}>
            {products.length === 0 ? (
              <EmptyState title="No products yet" body="This seller has not listed any products." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <AdminLink to={`/admin/products/${p.id}`} className="font-semibold text-ink-900 hover:text-brand-700 dark:text-white">
                          {p.name}
                        </AdminLink>
                        <span className="block text-[11px] text-ink-500 tabular">{p.id}</span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={p.approval} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={p.state} />
                      </TableCell>
                      <TableCell className="text-right tabular">{inr(p.price)}</TableCell>
                      <TableCell className="text-right tabular">{p.stock}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="orders">
          <Panel title={`Seller orders (${subOrders.length})`} padded={false}>
            {subOrders.length === 0 ? (
              <EmptyState title="No orders yet" body="This seller has not received any orders." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sub-order</TableHead>
                    <TableHead>Parent order</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Fulfilment</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Receivable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subOrders.map((so) => (
                    <TableRow key={so.id}>
                      <TableCell className="font-semibold tabular text-ink-900 dark:text-white">{so.id}</TableCell>
                      <TableCell>
                        <AdminLink to={`/admin/orders/${so.parent.id}`} className="tabular text-brand-600 hover:underline dark:text-brand-300">
                          {so.parent.id}
                        </AdminLink>
                      </TableCell>
                      <TableCell>{so.parent.buyer}</TableCell>
                      <TableCell>
                        <StatusBadge status={so.fulfilment} />
                      </TableCell>
                      <TableCell className="text-right tabular">{inr(so.value)}</TableCell>
                      <TableCell className="text-right tabular">{inr(so.receivable)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="payments">
          <Panel title="Transactions linked to this seller" padded={false}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TRANSACTIONS.slice(0, 4).map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-semibold tabular text-ink-900 dark:text-white">{t.id}</TableCell>
                    <TableCell className="tabular">{t.order}</TableCell>
                    <TableCell>{t.method}</TableCell>
                    <TableCell>
                      <StatusBadge status={t.status} />
                    </TableCell>
                    <TableCell className="text-right tabular">{inr(t.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="settlements">
          <Panel title="Settlement history" padded={false}>
            {settlements.length === 0 ? (
              <EmptyState title="No settlements yet" body="Settlements appear once delivered orders clear the return window." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Settlement</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead className="text-right">Net payable</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settlements.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <AdminLink to={`/admin/settlements/${s.id}`} className="font-semibold tabular text-brand-600 hover:underline dark:text-brand-300">
                          {s.id}
                        </AdminLink>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-ink-500">{s.period}</TableCell>
                      <TableCell className="text-right tabular">{inr(s.gross)}</TableCell>
                      <TableCell className="text-right tabular">{inr(s.commission)}</TableCell>
                      <TableCell className="text-right font-semibold tabular text-ink-900 dark:text-white">{inr(s.net)}</TableCell>
                      <TableCell>
                        <StatusBadge status={s.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="activity">
          <Panel title="Administrative activity" description="Actions performed by the SafalHub team against this seller account." padded={false}>
            <ul className="divide-y">
              {[
                { action: 'KYC documents received', by: 'System', at: seller.submittedOn ?? seller.registered },
                { action: 'Seller account created', by: 'System', at: seller.registered },
              ].map((entry) => (
                <li key={entry.action} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                  <div>
                    <p className="text-[13px] font-semibold text-ink-900 dark:text-white">{entry.action}</p>
                    <p className="text-[11px] text-ink-500">by {entry.by}</p>
                  </div>
                  <p className="text-[12px] text-ink-500">{entry.at}</p>
                </li>
              ))}
            </ul>
            <div className="border-t px-5 py-3">
              <Button variant="ghost" size="sm" asChild>
                <AdminLink to="/admin/audit-logs">Open full audit trail</AdminLink>
              </Button>
            </div>
          </Panel>
        </TabsContent>
      </Tabs>

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">{label}</p>
      <div className="mt-1 text-[13px] font-semibold text-ink-900 dark:text-white">{value}</div>
    </div>
  )
}

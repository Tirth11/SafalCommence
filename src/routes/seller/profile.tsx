import { useNavigate } from '@tanstack/react-router'
import { BadgeCheck, Landmark, MapPin, Store, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { DefinitionList, PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { LogoMark } from '@/components/brand/logo'
import { FormActions, FormSection } from '@/components/seller/seller-bits'
import { SellerStatusBanner } from '@/components/seller/status-banner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { BUSINESS_TYPES, INDIAN_STATES, SELLER_BUSINESS } from '@/data/seller'
import { Field, SelectField } from '@/routes/seller/setup'
import { useSellerStore } from '@/store/seller-store'

const TABS = [
  { value: 'store', label: 'Store Information' },
  { value: 'legal', label: 'Legal Details' },
  { value: 'address', label: 'Business Address' },
  { value: 'pickup', label: 'Pickup Address' },
  { value: 'bank', label: 'Bank Settings' },
  { value: 'verification', label: 'Verification' },
  { value: 'public', label: 'Public Profile' },
]

export function SellerProfilePage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const { kyc, storeName } = useSellerStore()
  const { config, open, setOpen, ask } = useActionDialog()

  const tab = search.tab ?? 'store'
  function setTab(value: string) {
    navigate(adminLinkProps({ to: '/seller/profile', search: { tab: value } }))
  }

  const b = SELLER_BUSINESS

  return (
    <>
      <PageHeader
        title="Business profile"
        description="Your store details, legal information, addresses and settlement account."
        breadcrumb={[{ label: 'Dashboard', to: '/seller' }, { label: 'Business Profile', to: '/seller/profile' }]}
        actions={<StatusBadge status={kyc === 'Not Submitted' ? 'Not Submitted' : kyc} />}
      />

      <SellerStatusBanner className="mb-5" />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-5">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="store">
          <Panel title="Store information" description="What customers see about your store on SafalMarketHub.">
            <div className="flex flex-wrap items-center gap-5 border-b pb-6">
              <LogoMark className="size-16 rounded-lg" />
              <div>
                <p className="text-[13px] font-semibold text-ink-900 dark:text-white">Store logo</p>
                <p className="mt-0.5 text-[12px] text-ink-500">Square PNG or JPG, at least 400×400 px.</p>
                <div className="mt-2.5 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.success('Logo updated')}>
                    Upload logo
                  </Button>
                  <Button variant="ghost" size="sm">
                    Remove
                  </Button>
                </div>
              </div>
            </div>

            <FormSection title="Store details">
              <Field label="Store Name" required hint="Changing this updates how customers see your store.">
                <Input defaultValue={b.storeName} />
              </Field>
              <Field label="Primary Category" required>
                <SelectField options={['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Others']} value={b.category} />
              </Field>
              <Field label="Store Description" className="sm:col-span-2">
                <Textarea rows={4} defaultValue={b.description} />
              </Field>
            </FormSection>

            <FormActions
              primary={<Button onClick={() => toast.success('Business information updated successfully.')}>Save changes</Button>}
              secondary={<Button variant="outline">Cancel</Button>}
            />
          </Panel>
        </TabsContent>

        <TabsContent value="legal">
          <Panel title="Legal details" description="Verified fields require re-verification if changed.">
            <Alert variant="info" className="mb-5">
              <BadgeCheck />
              <AlertTitle>These details are verified</AlertTitle>
              <AlertDescription>
                Editing your legal name, PAN or GSTIN sends your account back for verification. Your store keeps selling
                while we re-check.
              </AlertDescription>
            </Alert>

            <FormSection title="Registration">
              <Field label="Legal Business Name" required>
                <Input defaultValue={b.legalName} />
              </Field>
              <Field label="Business Type" required>
                <SelectField options={BUSINESS_TYPES} value={b.businessType} />
              </Field>
              <Field label="PAN" required>
                <Input defaultValue={b.pan} />
              </Field>
              <Field label="GSTIN">
                <Input defaultValue={b.gstin} />
              </Field>
            </FormSection>

            <FormSection title="Contact">
              <Field label="Contact Person" required>
                <Input defaultValue={b.contactPerson} />
              </Field>
              <Field label="Business Email" required>
                <Input type="email" defaultValue={b.email} />
              </Field>
              <Field label="Phone Number" required>
                <Input defaultValue={b.phone} />
              </Field>
            </FormSection>

            <FormActions
              primary={
                <Button
                  onClick={() =>
                    ask({
                      title: 'Update legal details?',
                      description:
                        'Changing verified information sends your account for re-verification. You can keep selling while it is reviewed.',
                      confirmLabel: 'Update & Re-verify',
                      requireNote: true,
                      successMessage: 'Sent for re-verification',
                    })
                  }
                >
                  Save changes
                </Button>
              }
            />
          </Panel>
        </TabsContent>

        <TabsContent value="address">
          <Panel title="Business address" description="The registered address of your business.">
            <FormSection title="Address">
              <Field label="Address Line 1" required className="sm:col-span-2">
                <Input defaultValue={b.address.line1} />
              </Field>
              <Field label="Address Line 2">
                <Input defaultValue={b.address.line2} />
              </Field>
              <Field label="Landmark">
                <Input defaultValue={b.address.landmark} />
              </Field>
              <Field label="City" required>
                <Input defaultValue={b.address.city} />
              </Field>
              <Field label="State" required>
                <SelectField options={INDIAN_STATES} value={b.address.state} />
              </Field>
              <Field label="PIN Code" required>
                <Input defaultValue={b.address.pin} />
              </Field>
              <Field label="Country" required>
                <SelectField options={['India']} value="India" />
              </Field>
            </FormSection>
            <FormActions primary={<Button onClick={() => toast.success('Business information updated successfully.')}>Save changes</Button>} />
          </Panel>
        </TabsContent>

        <TabsContent value="pickup">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Panel title="Primary pickup address" description="Orders are collected from this location.">
              <FormSection title="Pickup location">
                <Field label="Pickup Location Name" required>
                  <Input defaultValue={b.pickup.name} />
                </Field>
                <Field label="Contact Person" required>
                  <Input defaultValue={b.pickup.contact} />
                </Field>
                <Field label="Phone Number" required>
                  <Input defaultValue={b.pickup.phone} />
                </Field>
                <Field label="Address Line 1" required className="sm:col-span-2">
                  <Input defaultValue={b.pickup.line1} />
                </Field>
                <Field label="Address Line 2">
                  <Input defaultValue={b.pickup.line2} />
                </Field>
                <Field label="City" required>
                  <Input defaultValue={b.pickup.city} />
                </Field>
                <Field label="State" required>
                  <SelectField options={INDIAN_STATES} value={b.pickup.state} />
                </Field>
                <Field label="PIN Code" required>
                  <Input defaultValue={b.pickup.pin} />
                </Field>
              </FormSection>
              <FormActions primary={<Button onClick={() => toast.success('Pickup address updated')}>Save changes</Button>} />
            </Panel>
            <Panel title="How pickup works">
              <ul className="grid gap-3">
                {[
                  { icon: MapPin, text: 'Couriers collect from this address for every order you ship through SafalMarketHub logistics.' },
                  { icon: Store, text: 'Phase 1 supports one primary pickup location — additional locations come later.' },
                  { icon: TriangleAlert, text: 'Keep the contact number reachable during pickup hours to avoid missed pickups.' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">
                    <item.icon className="mt-0.5 size-4 shrink-0 text-ink-400" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="bank">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <Panel title="Settlement account" description="Where SafalMarketHub sends your earnings.">
              <DefinitionList
                items={[
                  { label: 'Account holder', value: b.bank.holder },
                  { label: 'Bank', value: b.bank.bank },
                  { label: 'Account number', value: <span className="tabular">{b.bank.masked}</span> },
                  { label: 'IFSC', value: <span className="tabular">{b.bank.ifsc}</span> },
                  { label: 'Account type', value: b.bank.type },
                  { label: 'Verification', value: <StatusBadge status="Verified" /> },
                ]}
              />
              <div className="mt-6 border-t pt-5">
                <Button
                  variant="outline"
                  onClick={() =>
                    ask({
                      title: 'Change bank account',
                      description:
                        'Future settlements will be sent to your new verified bank account. Settlements already in progress continue to the current account.',
                      confirmLabel: 'Continue',
                      extraFields: [
                        { key: 'holder', label: 'Account holder name', placeholder: 'As printed on bank records', required: true },
                        { key: 'account', label: 'Account number', placeholder: 'Enter account number', required: true },
                        { key: 'ifsc', label: 'IFSC code', placeholder: 'HDFC0000123', required: true },
                      ],
                      successMessage: 'Bank account submitted for verification',
                    })
                  }
                >
                  <Landmark className="size-4" />
                  Change Bank Account
                </Button>
              </div>
            </Panel>
            <Alert variant="warning">
              <TriangleAlert />
              <AlertTitle>Changing your account pauses payouts briefly</AlertTitle>
              <AlertDescription>
                A new account is verified with a penny-drop check before the next settlement is released. Keep the old
                account open until the first payment lands.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>

        <TabsContent value="verification">
          <Panel title="Verification" description="Documents submitted for seller verification." padded={false}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
              <div>
                <p className="text-[13px] font-semibold text-ink-900 dark:text-white">KYC status</p>
                <p className="mt-0.5 text-[12px] text-ink-500">
                  {kyc === 'Approved' ? 'Your business is verified.' : 'Verification is in progress or needs attention.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={kyc === 'Not Submitted' ? 'Not Submitted' : kyc} />
                <Button variant="outline" size="sm" asChild>
                  <AdminLink to="/seller/setup" search={{ step: 'kyc' }}>
                    Manage documents
                  </AdminLink>
                </Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {b.documents.map((d) => (
                  <TableRow key={d.type}>
                    <TableCell className="font-semibold text-ink-900 dark:text-white">{d.type}</TableCell>
                    <TableCell className="text-ink-600 dark:text-ink-300">{d.file}</TableCell>
                    <TableCell className="text-ink-500">{d.uploaded}</TableCell>
                    <TableCell>
                      <StatusBadge status={d.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="public">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <Panel title="What buyers see" description="Your marketplace seller profile.">
              <div className="rounded-lg border p-5">
                <div className="flex items-center gap-4">
                  <LogoMark className="size-14 rounded-lg" />
                  <div className="min-w-0">
                    <p className="text-[17px] font-semibold text-ink-950 dark:text-white">{storeName}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-ink-500">
                      <span>Seller since {b.sellerSince}</span>
                      <span aria-hidden>·</span>
                      <span>
                        {b.address.city}, {b.address.state}
                      </span>
                    </p>
                    <StatusBadge status="Verified" className="mt-2" />
                  </div>
                </div>
                <p className="mt-4 text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">{b.description}</p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-[12px] text-ink-500">
                  <span>
                    <span className="font-bold text-ink-900 dark:text-white">7</span> products listed
                  </span>
                  <span>
                    <span className="font-bold text-ink-900 dark:text-white">4.6</span> average rating
                  </span>
                </div>
              </div>
            </Panel>
            <Panel title="Not shown to buyers">
              <ul className="grid gap-2.5 text-[13px] text-ink-600 dark:text-ink-300">
                {['Legal business name and PAN', 'GSTIN', 'Bank account details', 'Pickup address', 'Contact phone number'].map(
                  (item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden className="text-ink-300">
                        •
                      </span>
                      {item}
                    </li>
                  )
                )}
              </ul>
              <p className="mt-4 border-t pt-4 text-[12px] text-ink-500">
                Phase 1 keeps the buyer-facing profile deliberately simple — no custom storefront or branding controls.
              </p>
            </Panel>
          </div>
        </TabsContent>
      </Tabs>

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}

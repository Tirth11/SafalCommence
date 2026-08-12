import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, BadgeCheck, Check, CircleAlert, Hourglass, Landmark, Lock, PartyPopper, Rocket, ShieldCheck, Store } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { DocumentUploadCard, FormActions, FormSection, OnboardingChecklist, Stepper } from '@/components/seller/seller-bits'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { BUSINESS_TYPES, INDIAN_STATES, PRODUCT_CATEGORIES, SELLER_BUSINESS } from '@/data/seller'
import { useAccountStore } from '@/store/account-store'
import { ONBOARDING_STEPS, useOnboardingProgress, useSellerStore } from '@/store/seller-store'

const STEPS = [
  { key: 'business', label: 'Business Details' },
  { key: 'kyc', label: 'Verification' },
  { key: 'bank', label: 'Bank Details' },
  { key: 'pickup', label: 'Pickup Address' },
  { key: 'product', label: 'First Product' },
  { key: 'review', label: 'Submit' },
]

export function SellerSetupPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const { completed, completeStep, setStatus } = useSellerStore()
  const { percent, done, total, isComplete } = useOnboardingProgress()
  const accountEmail = useAccountStore((s) => s.user?.email)
  const memberships = useAccountStore((s) => s.memberships)
  const createOrganization = useAccountStore((s) => s.createOrganization)
  const updateOrganization = useAccountStore((s) => s.updateOrganization)
  const resetSteps = useSellerStore((s) => s.resetSteps)

  /**
   * An account with no seller organisation is starting from zero, whatever the
   * demo seller state happens to hold — so clear the checklist on arrival.
   */
  const isNewSeller = memberships.length === 0
  useEffect(() => {
    if (isNewSeller && done > 0) resetSteps()
  }, [isNewSeller, done, resetSteps])

  const step = search.step ?? (isNewSeller || done === 0 ? 'welcome' : 'business')

  function go(next: string) {
    navigate(adminLinkProps({ to: '/seller/setup', search: next === 'welcome' ? {} : { step: next } }))
  }

  /* ------------------------------------------------------------- welcome -- */
  if (step === 'welcome') {
    return (
      <div className="mx-auto max-w-[720px]">
        <div className="rounded-lg border bg-card p-6 text-center shadow-xs sm:p-10">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-200">
            <Store className="size-8" />
          </span>
          <h1 className="mt-6 text-2xl sm:text-[30px]">Start selling on SafalMarketHub</h1>
          {/* Seller access is added to the account the user already has — no second registration */}
          <p className="mx-auto mt-3 max-w-[470px] text-[15px] text-ink-600 dark:text-ink-300">
            {accountEmail
              ? `Use your existing SafalMarketHub account (${accountEmail}) to set up your business. Your shopping account, orders and addresses stay exactly as they are.`
              : "Let's set up your business so you can start selling."}
          </p>

          <div className="mt-8 rounded-lg border bg-muted/50 p-5 text-left">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[13px] font-semibold text-ink-800 dark:text-ink-100">Setup progress</p>
              <span className="text-[15px] font-bold tabular text-brand-600 dark:text-brand-300">{percent}% Complete</span>
            </div>
            <Progress value={percent} className="mt-3" aria-label="Setup progress" />
            <ol className="mt-5 grid gap-2 sm:grid-cols-2">
              {ONBOARDING_STEPS.map((s, i) => (
                <li key={s.key} className="flex items-center gap-2.5 text-[13px]">
                  <span
                    className={
                      'grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ' +
                      (completed[s.key] ? 'bg-teal-500 text-white' : 'border border-ink-300 text-ink-500')
                    }
                  >
                    {completed[s.key] ? <Check className="size-3" strokeWidth={3.5} /> : i + 1}
                  </span>
                  <span className={completed[s.key] ? 'font-medium text-ink-700 dark:text-ink-200' : 'text-ink-600 dark:text-ink-300'}>
                    {s.label}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => go('business')}>
              Start Setup
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" asChild>
              <AdminLink to="/seller">I'll do this later</AdminLink>
            </Button>
          </div>
          <p className="mt-5 flex items-center justify-center gap-2 text-[12px] text-ink-500">
            <Lock className="size-3.5" />
            Your buyer account stays intact — selling activates once setup is approved.
          </p>
        </div>
      </div>
    )
  }

  /* ---------------------------------------------------------- setup steps -- */
  return (
    <>
      <PageHeader
        title="Seller setup"
        description={`${done} of ${total} steps completed. You can save progress and continue anytime.`}
        breadcrumb={[{ label: 'Dashboard', to: '/seller' }, { label: 'Setup', to: '/seller/setup' }]}
        actions={<StatusBadge status={isComplete ? 'Submitted' : 'Onboarding'} />}
      />

      <div className="mb-5 rounded-lg border bg-card px-4 py-3 shadow-xs">
        <Stepper steps={STEPS} current={step} onSelect={go} />
      </div>

      {step === 'business' && (
        <BusinessDetailsStep
          onDone={(storeName) => {
            // Seller access = a new organisation on this account, not a new login.
            if (memberships.length === 0) createOrganization(storeName || 'My business')
            completeStep('business')
            go('kyc')
          }}
        />
      )}
      {step === 'kyc' && <KycStep onDone={() => { completeStep('kyc'); go('bank') }} />}
      {step === 'bank' && <BankStep onDone={() => { completeStep('bank'); go('pickup') }} />}
      {step === 'pickup' && <PickupStep onDone={() => { completeStep('pickup'); go('product') }} />}
      {step === 'product' && <FirstProductStep onDone={() => { completeStep('product'); go('review') }} />}
      {step === 'review' && (
        <ReviewStep
          onSubmit={() => {
            completeStep('submitted')
            setStatus('Pending Review')
            const org = memberships[memberships.length - 1]
            if (org) updateOrganization(org.id, { status: 'Pending Review' })
            go('done')
          }}
        />
      )}
      {step === 'done' && <SetupComplete />}
    </>
  )
}

/* ------------------------------------------------------- 1. business ------ */
function BusinessDetailsStep({ onDone }: { onDone: (storeName: string) => void }) {
  const [noGst, setNoGst] = useState(false)
  const [saving, setSaving] = useState(false)
  const [storeName, setStoreName] = useState(SELLER_BUSINESS.storeName)

  async function save() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 700))
    setSaving(false)
    toast.success('Business information updated successfully.')
    onDone(storeName)
  }

  return (
    <Panel title="Tell us about your business" description="This information will be used to create and verify your SafalMarketHub seller profile.">
      <FormSection title="Store information">
        <Field label="Store Name" hint="This is the name customers may see on SafalMarketHub." required>
          <Input placeholder="ABC Electronics" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </Field>
        <Field label="Legal Business Name" required>
          <Input placeholder="ABC Electronics Private Limited" defaultValue={SELLER_BUSINESS.legalName} />
        </Field>
        <Field label="Business Type" required>
          <SelectField options={BUSINESS_TYPES} value={SELLER_BUSINESS.businessType} />
        </Field>
        <Field label="Primary Product Category" required>
          <SelectField options={PRODUCT_CATEGORIES} value="Electronics" />
        </Field>
        <Field label="GSTIN" hint={noGst ? 'Not required — GST exemption declared.' : '15-character GST identification number.'}>
          <Input placeholder="27AABCA1234M1Z5" defaultValue={SELLER_BUSINESS.gstin} disabled={noGst} />
        </Field>
        <Field label="PAN" required>
          <Input placeholder="AABCA1234M" defaultValue={SELLER_BUSINESS.pan} />
        </Field>
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-start gap-2.5">
            <Checkbox checked={noGst} onCheckedChange={(c) => setNoGst(Boolean(c))} className="mt-0.5" />
            <span className="text-[13px] text-ink-700 dark:text-ink-300">I am not currently registered for GST</span>
          </label>
        </div>
      </FormSection>

      <FormSection title="Business address" description="The registered address of your business.">
        <Field label="Address Line 1" required className="sm:col-span-2">
          <Input placeholder="Unit 402, Sunrise Business Park" defaultValue={SELLER_BUSINESS.address.line1} />
        </Field>
        <Field label="Address Line 2">
          <Input placeholder="Andheri East" defaultValue={SELLER_BUSINESS.address.line2} />
        </Field>
        <Field label="Landmark">
          <Input placeholder="Near Metro Station" defaultValue={SELLER_BUSINESS.address.landmark} />
        </Field>
        <Field label="City" required>
          <Input placeholder="Mumbai" defaultValue={SELLER_BUSINESS.address.city} />
        </Field>
        <Field label="State" required>
          <SelectField options={INDIAN_STATES} value={SELLER_BUSINESS.address.state} />
        </Field>
        <Field label="PIN Code" required>
          <Input placeholder="400069" inputMode="numeric" defaultValue={SELLER_BUSINESS.address.pin} />
        </Field>
        <Field label="Country" required>
          <SelectField options={['India']} value="India" />
        </Field>
      </FormSection>

      <FormSection title="Contact" description="We use these details for order and account communication.">
        <Field label="Contact Person" required>
          <Input placeholder="Rahul Mehta" defaultValue={SELLER_BUSINESS.contactPerson} />
        </Field>
        <Field label="Phone Number" required>
          <Input placeholder="+91 98200 41122" defaultValue={SELLER_BUSINESS.phone} />
        </Field>
        <Field label="Business Email" required>
          <Input type="email" placeholder="you@business.com" defaultValue={SELLER_BUSINESS.email} />
        </Field>
      </FormSection>

      <FormActions
        primary={
          <Button onClick={save} loading={saving} loadingLabel="Saving...">
            Save &amp; Continue
          </Button>
        }
        secondary={
          <Button variant="outline" onClick={() => toast.success('Saved as draft')}>
            Save as Draft
          </Button>
        }
      />
    </Panel>
  )
}

/* ------------------------------------------------------------- 2. KYC ----- */
function KycStep({ onDone }: { onDone: () => void }) {
  const { kyc, statusReason, setKyc } = useSellerStore()
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    setSubmitting(false)
    setKyc('Under Review')
    toast.success('Documents submitted', {
      description: 'You can continue setting up your products while verification is in progress.',
    })
    onDone()
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <Panel title="Verify your business" description="Upload the required documents so SafalMarketHub can verify your seller account.">
        <div className="grid gap-3">
          <DocumentUploadCard title="PAN Card" hint="Business or proprietor PAN." initialState={kyc === 'Approved' ? 'Verified' : 'Not Uploaded'} initialFile="pan-card.pdf" />
          <DocumentUploadCard
            title="GST Certificate"
            hint="Skip only if you declared GST exemption in business details."
            initialState={kyc === 'Changes Required' ? 'Issue Found' : kyc === 'Approved' ? 'Verified' : 'Not Uploaded'}
            initialFile="gst-certificate.pdf"
            comment={statusReason}
          />
          <DocumentUploadCard
            title="Business Registration Proof"
            hint="Certificate of Incorporation, Partnership Certificate or Shop Registration."
            initialState={kyc === 'Approved' ? 'Verified' : 'Not Uploaded'}
            initialFile="incorporation.pdf"
          />
          <DocumentUploadCard title="Address Proof" hint="Utility bill or lease agreement for the business address." initialState={kyc === 'Approved' ? 'Verified' : 'Not Uploaded'} initialFile="electricity-bill.jpg" />
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-2.5 border-t pt-5">
          <Checkbox checked={confirmed} onCheckedChange={(c) => setConfirmed(Boolean(c))} className="mt-0.5" />
          <span className="text-[13px] text-ink-700 dark:text-ink-300">I confirm that the information submitted is accurate.</span>
        </label>

        <FormActions
          primary={
            <Button onClick={submit} disabled={!confirmed} loading={submitting} loadingLabel="Submitting...">
              Submit for Verification
            </Button>
          }
          secondary={
            <Button variant="outline" onClick={onDone}>
              Skip for now
            </Button>
          }
          hint="Verification runs in parallel — you can keep setting up."
        />
      </Panel>

      <div className="grid content-start gap-4">
        <Panel title="Verification status">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-ink-600 dark:text-ink-300">Current status</span>
            <StatusBadge status={kyc === 'Not Submitted' ? 'Not Submitted' : kyc} />
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">
            {kyc === 'Under Review' && "We're reviewing your business documents. This usually takes 1–2 working days."}
            {kyc === 'Approved' && 'Your business is verified. No further action is needed.'}
            {kyc === 'Changes Required' && (statusReason ?? 'One or more documents need to be re-uploaded.')}
            {kyc === 'Rejected' && 'Your verification was rejected. Contact support for the next steps.'}
            {kyc === 'Not Submitted' && 'Upload the documents above and submit them for verification.'}
          </p>
          {kyc === 'Changes Required' && (
            <Alert variant="warning" className="mt-4">
              <CircleAlert />
              <AlertTitle>Update needed</AlertTitle>
              <AlertDescription>Replace the flagged document above and submit again.</AlertDescription>
            </Alert>
          )}
          {kyc === 'Rejected' && (
            <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
              <AdminLink to="/seller/support">Contact support</AdminLink>
            </Button>
          )}
        </Panel>

        <Alert variant="default">
          <ShieldCheck />
          <AlertDescription>
            Documents are stored securely and are only used for seller verification and compliance.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ 3. bank ----- */
function BankStep({ onDone }: { onDone: () => void }) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [accountNumber, setAccountNumber] = useState('')
  const [confirmNumber, setConfirmNumber] = useState('')
  const mismatch = confirmNumber.length > 0 && accountNumber !== confirmNumber

  async function save() {
    if (mismatch || !accountNumber) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    toast.success('Bank account saved')
  }

  return (
    <Panel title="Where should we send your earnings?" description="Add the bank account where you want to receive SafalMarketHub settlements.">
      {saved ? (
        <div className="rounded-lg border border-teal-100 bg-teal-50 p-5 dark:border-teal-600/40 dark:bg-teal-600/10">
          <p className="flex items-center gap-2 text-[14px] font-semibold text-teal-600 dark:text-teal-100">
            <BadgeCheck className="size-5" />
            Bank account saved
          </p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <MiniDef label="Account holder" value="ABC Electronics Private Limited" />
            <MiniDef label="Bank" value="HDFC Bank" />
            <MiniDef label="Account number" value={`XXXX XXXX ${accountNumber.slice(-4) || '4521'}`} />
            <MiniDef label="IFSC" value="HDFC0000123" />
          </dl>
        </div>
      ) : (
        <FormSection title="Settlement account">
          <Field label="Account Holder Name" required className="sm:col-span-2">
            <Input placeholder="As printed on your bank records" />
          </Field>
          <Field label="Bank Name" required>
            <Input placeholder="HDFC Bank" />
          </Field>
          <Field label="Account Type">
            <SelectField options={['Current', 'Savings']} value="Current" />
          </Field>
          <Field label="Account Number" required>
            <Input inputMode="numeric" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Enter account number" />
          </Field>
          <Field label="Confirm Account Number" required error={mismatch ? 'Account numbers do not match.' : undefined}>
            <Input
              inputMode="numeric"
              value={confirmNumber}
              onChange={(e) => setConfirmNumber(e.target.value)}
              placeholder="Re-enter account number"
              aria-invalid={mismatch || undefined}
            />
          </Field>
          <Field label="IFSC Code" required>
            <Input placeholder="HDFC0000123" />
          </Field>
        </FormSection>
      )}

      <p className="mt-5 flex items-start gap-2 rounded-sm border bg-muted/60 px-3.5 py-3 text-[12px] leading-relaxed text-ink-500">
        <Lock className="mt-0.5 size-4 shrink-0" />
        Your banking information is securely stored and used only for settlements. We mask the account number everywhere in
        the portal after saving.
      </p>

      <FormActions
        primary={
          saved ? (
            <Button onClick={onDone}>
              Continue
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={save} loading={saving} loadingLabel="Saving...">
              Save Bank Account
            </Button>
          )
        }
        secondary={
          !saved && (
            <Button variant="outline" onClick={onDone}>
              Skip for now
            </Button>
          )
        }
      />
    </Panel>
  )
}

/* ---------------------------------------------------------- 4. pickup ----- */
function PickupStep({ onDone }: { onDone: () => void }) {
  const [sameAsBusiness, setSameAsBusiness] = useState(true)
  const [saving, setSaving] = useState(false)
  const a = SELLER_BUSINESS.address

  async function save() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 700))
    setSaving(false)
    toast.success('Pickup address saved')
    onDone()
  }

  return (
    <Panel title="Add your pickup address" description="Orders will be collected from this location for delivery to customers.">
      <label className="flex cursor-pointer items-start gap-2.5 rounded-sm border bg-muted/40 px-3.5 py-3">
        <Checkbox checked={sameAsBusiness} onCheckedChange={(c) => setSameAsBusiness(Boolean(c))} className="mt-0.5" />
        <span className="text-[13px] text-ink-700 dark:text-ink-300">Same as business address</span>
      </label>

      <FormSection title="Pickup location">
        <Field label="Pickup Location Name" required>
          <Input placeholder="Main Warehouse" defaultValue="Main Warehouse" />
        </Field>
        <Field label="Contact Person" required>
          <Input placeholder="Suresh Kadam" defaultValue={SELLER_BUSINESS.pickup.contact} />
        </Field>
        <Field label="Phone Number" required>
          <Input placeholder="+91 98200 41133" defaultValue={SELLER_BUSINESS.pickup.phone} />
        </Field>
        <Field label="Address Line 1" required className="sm:col-span-2">
          <Input defaultValue={sameAsBusiness ? a.line1 : ''} disabled={sameAsBusiness} />
        </Field>
        <Field label="Address Line 2">
          <Input defaultValue={sameAsBusiness ? a.line2 : ''} disabled={sameAsBusiness} />
        </Field>
        <Field label="Landmark">
          <Input defaultValue={sameAsBusiness ? a.landmark : ''} disabled={sameAsBusiness} />
        </Field>
        <Field label="City" required>
          <Input defaultValue={sameAsBusiness ? a.city : ''} disabled={sameAsBusiness} />
        </Field>
        <Field label="State" required>
          <SelectField options={INDIAN_STATES} value={a.state} disabled={sameAsBusiness} />
        </Field>
        <Field label="PIN Code" required>
          <Input inputMode="numeric" defaultValue={sameAsBusiness ? a.pin : ''} disabled={sameAsBusiness} />
        </Field>
      </FormSection>

      <p className="mt-4 text-[12px] text-ink-500">
        Phase 1 supports one primary pickup location. Additional locations can be added later.
      </p>

      <FormActions
        primary={
          <Button onClick={save} loading={saving} loadingLabel="Saving...">
            Save Pickup Address
          </Button>
        }
        secondary={
          <Button variant="outline" onClick={onDone}>
            Skip for now
          </Button>
        }
      />
    </Panel>
  )
}

/* --------------------------------------------------- 5. first product ----- */
function FirstProductStep({ onDone }: { onDone: () => void }) {
  return (
    <Panel padded={false}>
      <div className="flex flex-col items-center px-6 py-14 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-200">
          <Rocket className="size-8" />
        </span>
        <h2 className="mt-6 text-xl sm:text-2xl">Add your first product</h2>
        <p className="mx-auto mt-3 max-w-[460px] text-[14px] leading-relaxed text-ink-600 dark:text-ink-300">
          You're almost ready to start selling. Add the first product you'd like to list on SafalMarketHub.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <AdminLink to="/seller/products/new">Add Product</AdminLink>
          </Button>
          <Button size="lg" variant="outline" onClick={onDone}>
            Mark as done for now
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="mt-4" asChild>
          <AdminLink to="/seller">Go to Dashboard</AdminLink>
        </Button>
      </div>
    </Panel>
  )
}

/* ------------------------------------------------------- 6. review/submit -- */
function ReviewStep({ onSubmit }: { onSubmit: () => void }) {
  const { completed, kyc } = useSellerStore()
  const [submitting, setSubmitting] = useState(false)
  const pending = ONBOARDING_STEPS.filter((s) => s.key !== 'submitted' && !completed[s.key])

  async function submit() {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 900))
    setSubmitting(false)
    onSubmit()
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Panel title="Review your setup" description="Check each section before submitting your seller profile for approval.">
        <ul className="divide-y">
          {ONBOARDING_STEPS.filter((s) => s.key !== 'submitted').map((s) => (
            <li key={s.key} className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0">
              <div className="flex items-center gap-3">
                <span
                  className={
                    'grid size-6 shrink-0 place-items-center rounded-full ' +
                    (completed[s.key] ? 'bg-teal-500 text-white' : 'border border-ink-300')
                  }
                >
                  {completed[s.key] && <Check className="size-3.5" strokeWidth={3.5} />}
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-ink-900 dark:text-white">{s.label}</p>
                  <p className="text-[12px] text-ink-500">{completed[s.key] ? 'Completed' : 'Not completed yet'}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <AdminLink to="/seller/setup" search={{ step: s.step }}>
                  {completed[s.key] ? 'Edit' : 'Complete'}
                </AdminLink>
              </Button>
            </li>
          ))}
        </ul>

        {pending.length > 0 && (
          <Alert variant="warning" className="mt-5">
            <CircleAlert />
            <AlertTitle>{pending.length} step{pending.length > 1 ? 's' : ''} still open</AlertTitle>
            <AlertDescription>Complete them to submit your profile for approval.</AlertDescription>
          </Alert>
        )}

        <FormActions
          primary={
            <Button onClick={submit} disabled={pending.length > 0} loading={submitting} loadingLabel="Submitting...">
              Submit for Approval
            </Button>
          }
          secondary={
            <Button variant="outline" asChild>
              <AdminLink to="/seller">Save and exit</AdminLink>
            </Button>
          }
        />
      </Panel>

      <div className="grid content-start gap-4">
        <Panel title="What happens next">
          <ol className="grid gap-3.5">
            {[
              { icon: Hourglass, label: 'SafalMarketHub reviews your profile', body: 'Business details, documents, bank account and your first product.' },
              { icon: CircleAlert, label: 'Changes may be requested', body: "If something needs fixing you'll see it here with the reason." },
              { icon: BadgeCheck, label: 'Account approved', body: 'Approved products go live and customers can start buying.' },
              { icon: Landmark, label: 'Settlements begin', body: 'Earnings are settled after the return window closes.' },
            ].map((s) => (
              <li key={s.label} className="flex gap-3">
                <s.icon className="mt-0.5 size-4 shrink-0 text-brand-600 dark:text-brand-300" />
                <div>
                  <p className="text-[13px] font-semibold text-ink-900 dark:text-white">{s.label}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-ink-500">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="Verification">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-ink-600 dark:text-ink-300">KYC status</span>
            <StatusBadge status={kyc === 'Not Submitted' ? 'Not Submitted' : kyc} />
          </div>
        </Panel>
      </div>
    </div>
  )
}

function SetupComplete() {
  return (
    <div className="mx-auto max-w-[640px]">
      <div className="rounded-lg border bg-card p-6 text-center shadow-xs sm:p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-teal-500 text-white">
          <Check className="size-9" strokeWidth={3} />
        </span>
        <h1 className="mt-6 text-2xl sm:text-[28px]">Setup complete!</h1>
        <p className="mx-auto mt-3 max-w-[420px] text-[15px] text-ink-600 dark:text-ink-300">
          Your seller profile has been submitted to SafalMarketHub for approval.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <AdminLink to="/seller">Go to Dashboard</AdminLink>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <AdminLink to="/seller/products/new">Add More Products</AdminLink>
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Shown after admin approval — reachable from the dashboard banner. */
export function SellerApprovedPage() {
  return (
    <div className="mx-auto max-w-[640px]">
      <div className="rounded-lg border bg-card p-6 text-center shadow-xs sm:p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-600 text-white">
          <PartyPopper className="size-8" />
        </span>
        <h1 className="mt-6 text-2xl sm:text-[30px]">You're ready to sell!</h1>
        <p className="mx-auto mt-3 max-w-[440px] text-[15px] text-ink-600 dark:text-ink-300">
          Your SafalMarketHub seller account is now active. Approved products can now be purchased by customers.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <AdminLink to="/seller">Go to Dashboard</AdminLink>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <AdminLink to="/seller/products/new">Add More Products</AdminLink>
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- helpers ---- */
export function Field({
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-[7px]">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div id={`${id}-control`}>{children}</div>
      {error ? (
        <p className="mt-[7px] text-[12px] font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="mt-[7px] text-[12px] text-ink-500">{hint}</p>
      ) : null}
    </div>
  )
}

export function SelectField({ options, value, disabled }: { options: string[]; value?: string; disabled?: boolean }) {
  return (
    <Select defaultValue={value} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function TextareaField(props: React.ComponentProps<typeof Textarea>) {
  return <Textarea {...props} />
}

function MiniDef({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">{label}</dt>
      <dd className="mt-0.5 text-[13px] font-semibold text-ink-900 dark:text-white">{value}</dd>
    </div>
  )
}

export { OnboardingChecklist }

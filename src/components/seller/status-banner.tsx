import { BadgeCheck, Ban, CircleAlert, Hourglass, Landmark, TriangleAlert } from 'lucide-react'

import { AdminLink } from '@/components/admin/admin-link'
import { Button } from '@/components/ui/button'
import { useSellerStore } from '@/store/seller-store'
import { cn } from '@/lib/utils'

/**
 * Account status is never implicit — every seller screen carries
 * status + explanation + next action (spec §75, §84).
 */
export function SellerStatusBanner({ className }: { className?: string }) {
  const { status, kyc, statusReason } = useSellerStore()

  const config = (() => {
    if (status === 'Suspended')
      return {
        tone: 'danger' as const,
        icon: Ban,
        title: 'Your selling account has been suspended',
        body: statusReason ?? 'New orders cannot be received while your account is suspended.',
        cta: { label: 'View details', to: '/seller/support' },
      }
    if (status === 'Payout Hold')
      return {
        tone: 'warning' as const,
        icon: Landmark,
        title: 'Settlements are temporarily on hold',
        body: statusReason ?? 'Your store is active and orders continue as normal, but payouts are paused.',
        cta: { label: 'Contact support', to: '/seller/support' },
      }
    if (kyc === 'Changes Required')
      return {
        tone: 'warning' as const,
        icon: TriangleAlert,
        title: 'Action required: update your verification documents',
        body: statusReason ?? 'One or more documents could not be verified.',
        cta: { label: 'Update documents', to: '/seller/setup', search: { step: 'kyc' } },
      }
    if (kyc === 'Rejected')
      return {
        tone: 'danger' as const,
        icon: Ban,
        title: 'Business verification was rejected',
        body: statusReason ?? 'Contact support to understand the next steps for your application.',
        cta: { label: 'Contact support', to: '/seller/support' },
      }
    if (status === 'Pending Review')
      return {
        tone: 'info' as const,
        icon: Hourglass,
        title: 'Your seller profile is with SafalMarketHub for approval',
        body: 'You can keep adding products while we review. Selling starts once your account is approved.',
        cta: { label: 'View setup', to: '/seller/setup' },
      }
    if (status === 'Onboarding')
      return {
        tone: 'info' as const,
        icon: CircleAlert,
        title: 'Complete your seller setup to start selling',
        body: 'Selling stays disabled until the required setup steps are submitted for approval.',
        cta: { label: 'Continue setup', to: '/seller/setup' },
      }
    if (kyc === 'Under Review')
      return {
        tone: 'info' as const,
        icon: Hourglass,
        title: 'Your verification is under review',
        body: "We're reviewing your business documents. You can continue adding products in the meantime.",
        cta: { label: 'View status', to: '/seller/setup', search: { step: 'kyc' } },
      }
    return {
      tone: 'success' as const,
      icon: BadgeCheck,
      title: 'Your store is active',
      body: 'Approved products are available to customers on SafalMarketHub.',
      cta: undefined,
    }
  })()

  // An active, fully-verified seller doesn't need a banner on every screen.
  if (config.tone === 'success') return null

  const tones = {
    info: 'border-brand-100 bg-brand-50 text-brand-800 dark:border-brand-800 dark:bg-brand-950/70 dark:text-brand-100',
    warning: 'border-gold-100 bg-gold-50 text-gold-600 dark:border-gold-600/40 dark:bg-gold-600/12 dark:text-gold-400',
    danger: 'border-destructive/25 bg-destructive/8 text-destructive',
    success: '',
  }

  return (
    <div className={cn('flex flex-wrap items-start gap-3 rounded-lg border px-4 py-3.5', tones[config.tone], className)}>
      <config.icon className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold">{config.title}</p>
        <p className="mt-0.5 text-[13px] leading-relaxed opacity-90">{config.body}</p>
      </div>
      {config.cta && (
        <Button size="sm" variant="outline" className="shrink-0 bg-background" asChild>
          <AdminLink to={config.cta.to} search={config.cta.search}>
            {config.cta.label}
          </AdminLink>
        </Button>
      )}
    </div>
  )
}

/** Compact status pill used in the header and on the mobile dashboard. */
export function SellerStatusPill({ className }: { className?: string }) {
  const { status, kyc } = useSellerStore()
  const label =
    status === 'Active' && kyc === 'Approved'
      ? 'Seller Active'
      : status === 'Active'
        ? `Active · KYC ${kyc}`
        : status === 'Payout Hold'
          ? 'Payout Hold'
          : status === 'Suspended'
            ? 'Suspended'
            : status === 'Pending Review'
              ? 'Pending Approval'
              : 'Setup Incomplete'

  const tone =
    status === 'Suspended'
      ? 'border-destructive/25 bg-destructive/10 text-destructive'
      : status === 'Payout Hold' || kyc === 'Changes Required'
        ? 'border-gold-100 bg-gold-50 text-gold-600 dark:border-gold-600/40 dark:bg-gold-600/15 dark:text-gold-400'
        : status === 'Active'
          ? 'border-teal-100 bg-teal-50 text-teal-600 dark:border-teal-600/40 dark:bg-teal-600/15 dark:text-teal-100'
          : 'border-brand-100 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200'

  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
        tone,
        className
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current opacity-70" />
      {label}
    </span>
  )
}

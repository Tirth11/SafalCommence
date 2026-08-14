import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'info' | 'progress' | 'success' | 'warning' | 'danger' | 'muted'

const TONES: Record<Tone, string> = {
  neutral: 'border-ink-200 bg-ink-50 text-ink-700 dark:border-ink-700 dark:bg-secondary dark:text-ink-200',
  info: 'border-brand-100 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200',
  progress: 'border-brand-200 bg-brand-100/60 text-brand-800 dark:border-brand-700 dark:bg-brand-900/60 dark:text-brand-100',
  success: 'border-teal-100 bg-teal-50 text-teal-600 dark:border-teal-600/40 dark:bg-teal-600/15 dark:text-teal-100',
  warning: 'border-gold-100 bg-gold-50 text-gold-600 dark:border-gold-600/40 dark:bg-gold-600/15 dark:text-gold-400',
  danger: 'border-destructive/20 bg-destructive/8 text-destructive',
  muted: 'border-ink-200 bg-transparent text-ink-500 dark:border-ink-700',
}

/**
 * Single source of truth for every lifecycle label in the admin portal.
 * Keeping the map here means "Pending Review" reads identically in the seller
 * list, the KYC queue and the audit log.
 */
const STATUS_TONE: Record<string, Tone> = {
  // Seller
  Registered: 'neutral',
  Onboarding: 'info',
  'Pending Review': 'warning',
  Active: 'success',
  Suspended: 'danger',
  'Payout Hold': 'warning',
  Closed: 'muted',
  // KYC / documents
  'Not Submitted': 'muted',
  Submitted: 'info',
  'Under Review': 'progress',
  Verified: 'success',
  'Changes Required': 'warning',
  Rejected: 'danger',
  Pending: 'warning',
  'Issue Found': 'danger',
  // Product
  'In Review': 'progress',
  Approved: 'success',
  Inactive: 'muted',
  Disabled: 'danger',
  'Out of Stock': 'warning',
  Draft: 'neutral',
  // Order fulfilment
  Confirmed: 'info',
  Processing: 'progress',
  Packed: 'progress',
  Shipped: 'info',
  Delivered: 'success',
  Cancelled: 'danger',
  Returned: 'warning',
  // Payment
  Initiated: 'neutral',
  Successful: 'success',
  Failed: 'danger',
  'Partially Refunded': 'warning',
  Refunded: 'neutral',
  // Refund / return
  Requested: 'info',
  'Refund Initiated': 'progress',
  'Pickup Scheduled': 'progress',
  'Product Received': 'progress',
  'Quality Check': 'progress',
  'Return Requested': 'info',
  // Settlement
  Eligible: 'info',
  Paid: 'success',
  'On Hold': 'danger',
  // Support
  Open: 'info',
  'In Progress': 'progress',
  'Waiting for Customer': 'warning',
  'Waiting for Seller': 'warning',
  Resolved: 'success',
  // Admin users
  Invited: 'info',
  Deactivated: 'muted',
  // Commission
  Scheduled: 'info',
  Expired: 'muted',
  // Storefront & marketing
  Published: 'success',
  Paused: 'warning',
  'Not Started': 'muted',
  Recovered: 'success',
  'Reminder Sent': 'info',
  Included: 'success',
  'Pending DNS': 'warning',
  // Control center / intelligence
  Good: 'success',
  Completed: 'success',
  Prepared: 'progress',
  'Restock Risk': 'warning',
  'Slow Moving': 'warning',
  'Oversell Risk': 'danger',
  Imported: 'success',
  'Partially Imported': 'warning',
  // Priority
  Low: 'muted',
  Medium: 'info',
  High: 'warning',
  Urgent: 'danger',
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = STATUS_TONE[status] ?? 'neutral'
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
        TONES[tone],
        className
      )}
    >
      <span
        className={cn(
          'size-1.5 shrink-0 rounded-full',
          tone === 'success' && 'bg-teal-500',
          tone === 'danger' && 'bg-destructive',
          tone === 'warning' && 'bg-gold-500',
          (tone === 'info' || tone === 'progress') && 'bg-brand-500',
          (tone === 'neutral' || tone === 'muted') && 'bg-ink-400'
        )}
      />
      {status}
    </span>
  )
}

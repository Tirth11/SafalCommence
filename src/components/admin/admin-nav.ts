import {
  BadgeIndianRupee,
  Banknote,
  Bot,
  Boxes,
  Brain,
  ClipboardList,
  CreditCard,
  FileText,
  Image,
  LayoutDashboard,
  LifeBuoy,
  Mic,
  Package,
  ScrollText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  UploadCloud,
  Users,
} from 'lucide-react'

/**
 * Left navigation for the Super Admin portal.
 * `children` are status-scoped views of the same list screen — they deep-link
 * via a `status` search param rather than separate routes.
 */
export type NavChild = { label: string; to: string; search?: Record<string, string>; badge?: number }
export type NavItem = {
  label: string
  to: string
  icon: typeof LayoutDashboard
  badge?: number
  children?: NavChild[]
  /** Not available to Operations Admin */
  superOnly?: boolean
}

export const ADMIN_NAV: { section?: string; items: NavItem[] }[] = [
  {
    items: [{ label: 'Dashboard', to: '/admin', icon: LayoutDashboard }],
  },
  {
    section: 'Control Center',
    items: [
      {
        label: 'Control Center',
        to: '/admin/control-center',
        icon: Bot,
        badge: 12,
        children: [
          { label: 'Overview', to: '/admin/control-center', search: { tab: 'overview' } },
          { label: 'Customer Shopping AI', to: '/admin/control-center', search: { tab: 'ai' }, badge: 12 },
          { label: 'Seller Assistant', to: '/admin/control-center', search: { tab: 'ai' } },
          { label: 'AI Actions', to: '/admin/control-center', search: { tab: 'ai' } },
          { label: 'Image Search', to: '/admin/control-center', search: { tab: 'ai' } },
          { label: 'Voice Assistant', to: '/admin/control-center', search: { tab: 'ai' } },
          { label: 'Seller Intelligence', to: '/admin/control-center', search: { tab: 'intelligence' } },
          { label: 'Offers & Promotions', to: '/admin/offers' },
          { label: 'Customer Voice', to: '/admin/control-center', search: { tab: 'voice' } },
          { label: 'Bulk Uploads', to: '/admin/control-center', search: { tab: 'uploads' } },
        ],
      },
    ],
  },
  {
    section: 'Marketplace',
    items: [
      {
        label: 'Sellers',
        to: '/admin/sellers',
        icon: Store,
        badge: 24,
        children: [
          { label: 'All Sellers', to: '/admin/sellers' },
          { label: 'Pending Approval', to: '/admin/sellers', search: { status: 'Pending Review' }, badge: 24 },
          { label: 'Active Sellers', to: '/admin/sellers', search: { status: 'Active' } },
          { label: 'Suspended Sellers', to: '/admin/sellers', search: { status: 'Suspended' } },
          { label: 'Payout Hold', to: '/admin/sellers', search: { status: 'Payout Hold' } },
          { label: 'KYC Queue', to: '/admin/kyc' },
        ],
      },
      { label: 'Buyers', to: '/admin/buyers', icon: Users },
      {
        label: 'Products',
        to: '/admin/products',
        icon: Package,
        badge: 52,
        children: [
          { label: 'All Products', to: '/admin/products' },
          { label: 'Pending Approval', to: '/admin/products', search: { status: 'In Review' }, badge: 52 },
          { label: 'Categories', to: '/admin/catalogue', search: { tab: 'categories' } },
          { label: 'Brands', to: '/admin/catalogue', search: { tab: 'brands' } },
        ],
      },
      {
        label: 'Offers & Promotions',
        to: '/admin/offers',
        icon: Tag,
        badge: 1,
        children: [
          { label: 'Platform Offers', to: '/admin/offers' },
          { label: 'Seller Offers', to: '/admin/offers', search: { tab: 'seller' } },
          { label: 'Needs Approval', to: '/admin/offers', search: { tab: 'approvals' }, badge: 1 },
          { label: 'Create Offer', to: '/admin/offers/new' },
        ],
      },
      {
        label: 'Orders',
        to: '/admin/orders',
        icon: ShoppingBag,
        children: [
          { label: 'All Orders', to: '/admin/orders' },
          { label: 'Processing', to: '/admin/orders', search: { status: 'Processing' } },
          { label: 'Shipped', to: '/admin/orders', search: { status: 'Shipped' } },
          { label: 'Delivered', to: '/admin/orders', search: { status: 'Delivered' } },
          { label: 'Cancelled', to: '/admin/orders', search: { status: 'Cancelled' } },
          { label: 'Returns', to: '/admin/returns' },
        ],
      },
    ],
  },
  {
    section: 'Finance',
    items: [
      {
        label: 'Payments',
        to: '/admin/payments',
        icon: CreditCard,
        children: [
          { label: 'All Transactions', to: '/admin/payments' },
          { label: 'Successful', to: '/admin/payments', search: { status: 'Successful' } },
          { label: 'Pending', to: '/admin/payments', search: { status: 'Pending' } },
          { label: 'Failed', to: '/admin/payments', search: { status: 'Failed' }, badge: 6 },
          { label: 'Refunds', to: '/admin/refunds', badge: 18 },
        ],
      },
      {
        label: 'Settlements',
        to: '/admin/settlements',
        icon: Banknote,
        children: [
          { label: 'Pending', to: '/admin/settlements', search: { status: 'Pending' } },
          { label: 'Eligible', to: '/admin/settlements', search: { status: 'Eligible' } },
          { label: 'Processing', to: '/admin/settlements', search: { status: 'Processing' } },
          { label: 'Paid', to: '/admin/settlements', search: { status: 'Paid' } },
          { label: 'On Hold', to: '/admin/settlements', search: { status: 'On Hold' } },
        ],
      },
      { label: 'Commission', to: '/admin/commission', icon: BadgeIndianRupee, superOnly: true },
    ],
  },
  {
    section: 'Operations',
    items: [
      { label: 'Support', to: '/admin/support', icon: LifeBuoy, badge: 3 },
      { label: 'Reports', to: '/admin/reports', icon: FileText },
      { label: 'Audit Logs', to: '/admin/audit-logs', icon: ScrollText },
    ],
  },
  {
    section: 'Administration',
    items: [
      { label: 'Admin Users', to: '/admin/admin-users', icon: ShieldCheck, superOnly: true },
      { label: 'Platform Settings', to: '/admin/settings', icon: Settings, superOnly: true },
    ],
  },
]

/** Icons reused by the pending-actions widget and notification bell. */
export const KIND_ICON = {
  seller: Store,
  product: Package,
  refund: BadgeIndianRupee,
  settlement: Banknote,
  payment: CreditCard,
  return: Boxes,
  order: ClipboardList,
  ai: Brain,
  image: Image,
  voice: Mic,
  offer: Tag,
  upload: UploadCloud,
} as const

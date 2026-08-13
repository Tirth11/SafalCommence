import {
  Banknote,
  Boxes,
  Building2,
  CreditCard,
  Globe,
  House,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Wallet,
} from 'lucide-react'

export type SellerNavChild = { label: string; to: string; search?: Record<string, string>; badge?: number }
export type SellerNavItem = {
  label: string
  to: string
  icon: typeof LayoutDashboard
  badge?: number
  children?: SellerNavChild[]
}

export const SELLER_NAV: SellerNavItem[] = [
  { label: 'Dashboard', to: '/seller', icon: LayoutDashboard },
  {
    label: 'Products',
    to: '/seller/products',
    icon: Package,
    children: [
      { label: 'All Products', to: '/seller/products' },
      { label: 'Add Product', to: '/seller/products/new' },
      { label: 'Inventory', to: '/seller/inventory' },
    ],
  },
  {
    label: 'Orders',
    to: '/seller/orders',
    icon: ShoppingBag,
    badge: 2,
    children: [
      { label: 'All Orders', to: '/seller/orders' },
      { label: 'New', to: '/seller/orders', search: { tab: 'New' }, badge: 2 },
      { label: 'Processing', to: '/seller/orders', search: { tab: 'Processing' } },
      { label: 'Shipped', to: '/seller/orders', search: { tab: 'Shipped' } },
      { label: 'Returned', to: '/seller/orders', search: { tab: 'Returned' } },
    ],
  },
  {
    label: 'Payments',
    to: '/seller/transactions',
    icon: Wallet,
    children: [
      { label: 'Transactions', to: '/seller/transactions' },
      { label: 'Settlements', to: '/seller/settlements' },
    ],
  },
  {
    label: 'Online Store',
    to: '/seller/online-store',
    icon: Globe,
    children: [
      { label: 'Overview', to: '/seller/online-store' },
      { label: 'Setup', to: '/seller/online-store/setup' },
      { label: 'Customise', to: '/seller/online-store', search: { tab: 'customize' } },
      { label: 'Homepage', to: '/seller/online-store', search: { tab: 'homepage' } },
      { label: 'Collections', to: '/seller/online-store', search: { tab: 'collections' } },
      { label: 'Products', to: '/seller/online-store', search: { tab: 'products' } },
      { label: 'Analytics', to: '/seller/online-store', search: { tab: 'analytics' } },
      { label: 'Domains', to: '/seller/online-store', search: { tab: 'domains' } },
    ],
  },
  {
    label: 'Marketing',
    to: '/seller/marketing',
    icon: Megaphone,
    children: [
      { label: 'Coupons', to: '/seller/marketing' },
      { label: 'Free Shipping', to: '/seller/marketing', search: { tab: 'shipping' } },
      { label: 'Announcement Bar', to: '/seller/marketing', search: { tab: 'announcement' } },
      { label: 'Abandoned Carts', to: '/seller/marketing', search: { tab: 'carts' } },
    ],
  },
  { label: 'Plan & Billing', to: '/seller/plan', icon: CreditCard },
  { label: 'Business Profile', to: '/seller/profile', icon: Building2 },
  { label: 'Support', to: '/seller/support', icon: LifeBuoy },
  { label: 'Settings', to: '/seller/settings', icon: Settings },
]

/** Mobile bottom navigation — the five actions sellers reach for on a phone. */
export const SELLER_MOBILE_NAV = [
  { label: 'Home', to: '/seller', icon: House },
  { label: 'Products', to: '/seller/products', icon: Package },
  { label: 'Orders', to: '/seller/orders', icon: ShoppingBag, badge: 2 },
  { label: 'Payments', to: '/seller/settlements', icon: Banknote },
  { label: 'More', to: '/seller/profile', icon: Settings },
]

export const SELLER_QUICK_ACTIONS = [
  { label: 'Add product', to: '/seller/products/new', icon: Plus },
  { label: 'Update inventory', to: '/seller/inventory', icon: Boxes },
]

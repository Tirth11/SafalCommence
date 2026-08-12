import {
  Banknote,
  Boxes,
  Building2,
  CreditCard,
  Globe,
  House,
  LayoutDashboard,
  LifeBuoy,
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
      { label: 'Customise', to: '/seller/online-store', search: { tab: 'customize' } },
      { label: 'Products', to: '/seller/online-store', search: { tab: 'products' } },
      { label: 'Domains', to: '/seller/online-store', search: { tab: 'domains' } },
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

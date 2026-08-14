import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'

import { AdminShell } from '@/components/admin/admin-shell'
import { SellerShell } from '@/components/seller/seller-shell'
import { Toaster } from '@/components/ui/sonner'

/* Storefront */
import { LandingPage } from '@/routes/landing'
import { LoginPage } from '@/routes/login'
import { RegisterPage } from '@/routes/register'

/* Super Admin portal */
import { AdminLoginPage } from '@/routes/admin/admin-login'
import { AdminDashboardPage } from '@/routes/admin/admin-dashboard'
import { AdminControlCenterPage } from '@/routes/admin/control-center'
import { SellersPage } from '@/routes/admin/sellers'
import { SellerDetailPage } from '@/routes/admin/seller-detail'
import { ProductsPage } from '@/routes/admin/products'
import { ProductReviewPage } from '@/routes/admin/product-review'
import { OrdersPage } from '@/routes/admin/orders'
import { AdminOrderDetailPage } from '@/routes/admin/order-detail'
import {
  AdminCommissionPage,
  AdminPaymentsPage,
  AdminRefundsPage,
  AdminReturnsPage,
  AdminSettlementDetailPage,
  AdminSettlementsPage,
} from '@/routes/admin/finance'
import {
  AdminAuditLogsPage,
  AdminBuyersPage,
  AdminCataloguePage,
  AdminReportsPage,
  AdminSettingsPage,
  AdminSupportPage,
  AdminUsersPage,
} from '@/routes/admin/operations'

/* Customer / buyer portal */
import { ShopShell } from '@/components/shop/shop-shell'
import { ShopCategoriesPage, ShopHomePage } from '@/routes/shop/home'
import { ShopListingPage } from '@/routes/shop/listing'
import { ProductDetailPage } from '@/routes/shop/product'
import { CartPage } from '@/routes/shop/cart'
import { CheckoutPage } from '@/routes/shop/checkout'
import {
  AccountDashboardPage,
  AddressesPage,
  NotificationsPage as CustomerNotificationsPage,
  ProfilePage,
  SupportPage as CustomerSupportPage,
  WishlistPage,
} from '@/routes/shop/account'
import { MyOrdersPage, OrderDetailPage, ReturnsPage } from '@/routes/shop/orders'

/* Seller portal */
import { SellerSetupPage, SellerApprovedPage } from '@/routes/seller/setup'
import { SellerDashboardPage } from '@/routes/seller/dashboard'
import { SellerProductsPage } from '@/routes/seller/products'
import { SellerProductFormPage } from '@/routes/seller/product-form'
import { SellerInventoryPage } from '@/routes/seller/inventory'
import { SellerOrdersPage } from '@/routes/seller/orders'
import { SellerOrderDetailPage } from '@/routes/seller/order-detail'
import { SellerSettlementDetailPage, SellerSettlementsPage, SellerTransactionsPage } from '@/routes/seller/earnings'
import { SellerProfilePage } from '@/routes/seller/profile'
import { SellerPlanPage } from '@/routes/seller/plan'
import { SellerOnlineStorePage } from '@/routes/seller/online-store'
import { SellerStoreSetupPage } from '@/routes/seller/store-setup'
import { SellerProductImportPage } from '@/routes/seller/product-import'
import { SellerPromotionFormPage, SellerPromotionsPage } from '@/routes/seller/promotions'
import { AdminOfferDetailPage, AdminOffersPage } from '@/routes/admin/offers'
import { AdminOfferFormPage } from '@/routes/admin/offer-form'
import { SellerMarketingPage } from '@/routes/seller/marketing'
import { AboutPage, ContactPage, HelpPage, LegalPage, PricingPage } from '@/routes/pages'
import { MyOffersPage } from '@/routes/shop/offers'
import { ShoppingSettingsPage } from '@/routes/shop/shopping-settings'
import { SellerNotificationsPage, SellerSettingsPage, SellerSupportPage } from '@/routes/seller/support'
import { SellerStatePreview } from '@/components/seller/seller-state-preview'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster />
    </>
  ),
})

/* ------------------------------------------------------------- storefront -- */
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: LandingPage })
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: LoginPage })
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/register', component: RegisterPage })

/* Everything the header and footer link to — no dead ends in the chrome. */
const infoRoutes = [
  createRoute({ getParentRoute: () => rootRoute, path: '/pricing', component: PricingPage }),
  createRoute({ getParentRoute: () => rootRoute, path: '/contact', component: ContactPage }),
  createRoute({ getParentRoute: () => rootRoute, path: '/help', component: HelpPage }),
  createRoute({ getParentRoute: () => rootRoute, path: '/about', component: AboutPage }),
  createRoute({ getParentRoute: () => rootRoute, path: '/privacy', component: () => <LegalPage kind="privacy" /> }),
  createRoute({ getParentRoute: () => rootRoute, path: '/terms', component: () => <LegalPage kind="terms" /> }),
  createRoute({ getParentRoute: () => rootRoute, path: '/returns', component: () => <LegalPage kind="returns" /> }),
]

/* ---------------------------------------------------------- admin portal --- */
const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/login',
  component: AdminLoginPage,
})

/** Layout route: everything below renders inside the admin shell. */
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin-layout',
  component: () => (
    <AdminShell>
      <Outlet />
    </AdminShell>
  ),
})

const adminRoutes = [
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin', component: AdminDashboardPage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/control-center', component: AdminControlCenterPage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/offers', component: AdminOffersPage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/offers/new', component: AdminOfferFormPage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/offers/$offerId', component: AdminOfferDetailPage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/sellers', component: () => <SellersPage /> }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/sellers/$sellerId', component: SellerDetailPage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/kyc', component: () => <SellersPage mode="kyc" /> }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/buyers', component: AdminBuyersPage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/products', component: ProductsPage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/products/$productId', component: ProductReviewPage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/catalogue', component: AdminCataloguePage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/orders', component: OrdersPage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/orders/$orderId', component: AdminOrderDetailPage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/payments', component: AdminPaymentsPage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/refunds', component: AdminRefundsPage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/returns', component: AdminReturnsPage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/settlements', component: AdminSettlementsPage }),
  createRoute({
    getParentRoute: () => adminLayoutRoute,
    path: '/admin/settlements/$settlementId',
    component: AdminSettlementDetailPage,
  }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/commission', component: AdminCommissionPage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/support', component: AdminSupportPage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/reports', component: AdminReportsPage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/audit-logs', component: AdminAuditLogsPage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/admin-users', component: AdminUsersPage }),
  createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/settings', component: AdminSettingsPage }),
]

/* ------------------------------------------------------- customer portal --- */
const shopLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'shop-layout',
  component: () => (
    <ShopShell>
      <Outlet />
    </ShopShell>
  ),
})

const shopRoutes = [
  createRoute({ getParentRoute: () => shopLayoutRoute, path: '/shop', component: ShopHomePage }),
  createRoute({ getParentRoute: () => shopLayoutRoute, path: '/shop/all', component: ShopListingPage }),
  createRoute({ getParentRoute: () => shopLayoutRoute, path: '/shop/categories', component: ShopCategoriesPage }),
  createRoute({ getParentRoute: () => shopLayoutRoute, path: '/product/$productId', component: ProductDetailPage }),
  createRoute({ getParentRoute: () => shopLayoutRoute, path: '/cart', component: CartPage }),
  createRoute({ getParentRoute: () => shopLayoutRoute, path: '/checkout', component: CheckoutPage }),
  createRoute({ getParentRoute: () => shopLayoutRoute, path: '/account', component: AccountDashboardPage }),
  createRoute({ getParentRoute: () => shopLayoutRoute, path: '/account/orders', component: MyOrdersPage }),
  createRoute({ getParentRoute: () => shopLayoutRoute, path: '/account/orders/$orderId', component: OrderDetailPage }),
  createRoute({ getParentRoute: () => shopLayoutRoute, path: '/account/returns', component: ReturnsPage }),
  createRoute({ getParentRoute: () => shopLayoutRoute, path: '/account/addresses', component: AddressesPage }),
  createRoute({ getParentRoute: () => shopLayoutRoute, path: '/account/wishlist', component: WishlistPage }),
  createRoute({ getParentRoute: () => shopLayoutRoute, path: '/account/offers', component: MyOffersPage }),
  createRoute({ getParentRoute: () => shopLayoutRoute, path: '/account/shopping', component: ShoppingSettingsPage }),
  createRoute({ getParentRoute: () => shopLayoutRoute, path: '/account/profile', component: ProfilePage }),
  createRoute({ getParentRoute: () => shopLayoutRoute, path: '/account/notifications', component: CustomerNotificationsPage }),
  createRoute({ getParentRoute: () => shopLayoutRoute, path: '/account/support', component: CustomerSupportPage }),
]

/* --------------------------------------------------------- seller portal --- */
const sellerLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'seller-layout',
  component: () => (
    <SellerShell>
      <Outlet />
      <SellerStatePreview />
    </SellerShell>
  ),
})

const sellerRoutes = [
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller', component: SellerDashboardPage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/setup', component: SellerSetupPage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/onboarding', component: SellerSetupPage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/approved', component: SellerApprovedPage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/products', component: SellerProductsPage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/products/$productId', component: SellerProductFormPage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/products/import', component: SellerProductImportPage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/promotions', component: SellerPromotionsPage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/promotions/new', component: SellerPromotionFormPage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/inventory', component: SellerInventoryPage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/orders', component: SellerOrdersPage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/orders/$orderId', component: SellerOrderDetailPage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/transactions', component: SellerTransactionsPage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/settlements', component: SellerSettlementsPage }),
  createRoute({
    getParentRoute: () => sellerLayoutRoute,
    path: '/seller/settlements/$settlementId',
    component: SellerSettlementDetailPage,
  }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/plan', component: SellerPlanPage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/online-store', component: SellerOnlineStorePage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/online-store/setup', component: SellerStoreSetupPage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/marketing', component: SellerMarketingPage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/profile', component: SellerProfilePage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/notifications', component: SellerNotificationsPage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/support', component: SellerSupportPage }),
  createRoute({ getParentRoute: () => sellerLayoutRoute, path: '/seller/settings', component: SellerSettingsPage }),
]

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  ...infoRoutes,
  adminLoginRoute,
  adminLayoutRoute.addChildren(adminRoutes),
  sellerLayoutRoute.addChildren(sellerRoutes),
  shopLayoutRoute.addChildren(shopRoutes),
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'

import { AdminShell } from '@/components/admin/admin-shell'
import { Toaster } from '@/components/ui/sonner'
import { LandingPage } from '@/routes/landing'
import { LoginPage } from '@/routes/login'
import { RegisterPage } from '@/routes/register'
import { SellerOnboardingPage } from '@/routes/seller-onboarding'
import { AdminDashboardPage } from '@/routes/admin/admin-dashboard'
import { AdminLoginPage } from '@/routes/admin/admin-login'
import { AdminUsersPage } from '@/routes/admin/admin-users'
import { AuditLogsPage } from '@/routes/admin/audit-logs'
import { BuyersPage } from '@/routes/admin/buyers'
import { CataloguePage } from '@/routes/admin/catalogue'
import { CommissionPage } from '@/routes/admin/commission'
import { OrderDetailPage } from '@/routes/admin/order-detail'
import { OrdersPage } from '@/routes/admin/orders'
import { PaymentsPage } from '@/routes/admin/payments'
import { ProductReviewPage } from '@/routes/admin/product-review'
import { ProductsPage } from '@/routes/admin/products'
import { RefundsPage, ReturnsPage } from '@/routes/admin/refunds'
import { ReportsPage } from '@/routes/admin/reports'
import { SellerDetailPage } from '@/routes/admin/seller-detail'
import { SellersPage } from '@/routes/admin/sellers'
import { SettingsPage } from '@/routes/admin/settings'
import { SettlementDetailPage, SettlementsPage } from '@/routes/admin/settlements'
import { SupportPage } from '@/routes/admin/support'

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
const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/seller/onboarding',
  component: SellerOnboardingPage,
})

/* ------------------------------------------------------------ admin portal - */
/** Sign-in sits outside the shell — no sidebar until authenticated. */
const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/login',
  component: AdminLoginPage,
})

/** Layout route: every other /admin/* screen renders inside the shell. */
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'adminShell',
  component: () => (
    <AdminShell>
      <Outlet />
    </AdminShell>
  ),
})

const parent = () => adminLayoutRoute

const adminDashboardRoute = createRoute({ getParentRoute: parent, path: '/admin', component: AdminDashboardPage })
const adminSellersRoute = createRoute({ getParentRoute: parent, path: '/admin/sellers', component: () => <SellersPage /> })
const adminSellerDetailRoute = createRoute({ getParentRoute: parent, path: '/admin/sellers/$sellerId', component: SellerDetailPage })
const adminKycRoute = createRoute({ getParentRoute: parent, path: '/admin/kyc', component: () => <SellersPage mode="kyc" /> })
const adminBuyersRoute = createRoute({ getParentRoute: parent, path: '/admin/buyers', component: BuyersPage })
const adminProductsRoute = createRoute({ getParentRoute: parent, path: '/admin/products', component: ProductsPage })
const adminProductReviewRoute = createRoute({ getParentRoute: parent, path: '/admin/products/$productId', component: ProductReviewPage })
const adminCatalogueRoute = createRoute({ getParentRoute: parent, path: '/admin/catalogue', component: CataloguePage })
const adminOrdersRoute = createRoute({ getParentRoute: parent, path: '/admin/orders', component: OrdersPage })
const adminOrderDetailRoute = createRoute({ getParentRoute: parent, path: '/admin/orders/$orderId', component: OrderDetailPage })
const adminReturnsRoute = createRoute({ getParentRoute: parent, path: '/admin/returns', component: ReturnsPage })
const adminPaymentsRoute = createRoute({ getParentRoute: parent, path: '/admin/payments', component: PaymentsPage })
const adminRefundsRoute = createRoute({ getParentRoute: parent, path: '/admin/refunds', component: RefundsPage })
const adminSettlementsRoute = createRoute({ getParentRoute: parent, path: '/admin/settlements', component: SettlementsPage })
const adminSettlementDetailRoute = createRoute({ getParentRoute: parent, path: '/admin/settlements/$settlementId', component: SettlementDetailPage })
const adminCommissionRoute = createRoute({ getParentRoute: parent, path: '/admin/commission', component: CommissionPage })
const adminSupportRoute = createRoute({ getParentRoute: parent, path: '/admin/support', component: SupportPage })
const adminReportsRoute = createRoute({ getParentRoute: parent, path: '/admin/reports', component: ReportsPage })
const adminAuditRoute = createRoute({ getParentRoute: parent, path: '/admin/audit-logs', component: AuditLogsPage })
const adminUsersRoute = createRoute({ getParentRoute: parent, path: '/admin/admin-users', component: AdminUsersPage })
const adminSettingsRoute = createRoute({ getParentRoute: parent, path: '/admin/settings', component: SettingsPage })

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  onboardingRoute,
  adminLoginRoute,
  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminSellersRoute,
    adminSellerDetailRoute,
    adminKycRoute,
    adminBuyersRoute,
    adminProductsRoute,
    adminProductReviewRoute,
    adminCatalogueRoute,
    adminOrdersRoute,
    adminOrderDetailRoute,
    adminReturnsRoute,
    adminPaymentsRoute,
    adminRefundsRoute,
    adminSettlementsRoute,
    adminSettlementDetailRoute,
    adminCommissionRoute,
    adminSupportRoute,
    adminReportsRoute,
    adminAuditRoute,
    adminUsersRoute,
    adminSettingsRoute,
  ]),
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

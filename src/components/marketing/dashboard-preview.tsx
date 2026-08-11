import { lazy, Suspense } from 'react'

import { Section, SectionHead } from '@/components/marketing/section'

/** Charting library is the heaviest dependency on this page — load it on demand. */
const SellerDashboardMock = lazy(() =>
  import('@/components/mock/seller-dashboard').then((m) => ({ default: m.SellerDashboardMock }))
)

export function DashboardPreview() {
  return (
    <Section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_35%,black,transparent)]"
      />
      <div className="container-wide relative">
        <SectionHead
          center
          eyebrow="Seller dashboard"
          title="Run your business from one place"
          sub="Products, orders, inventory, payments and settlements — organised into a single, calm workspace."
        />
        <div className="mt-14 pb-6">
          <Suspense
            fallback={
              <div className="h-[520px] animate-pulse rounded-xl border bg-card shadow-xl" aria-label="Loading dashboard preview" />
            }
          >
            <SellerDashboardMock />
          </Suspense>
        </div>
      </div>
    </Section>
  )
}

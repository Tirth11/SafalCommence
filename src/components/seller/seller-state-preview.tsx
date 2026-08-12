import { StatePreview } from '@/components/dev/state-preview'
import { useSellerStore, type Scenario } from '@/store/seller-store'

/**
 * Design-review helper: switch the seller account between every Phase 1 state
 * so reviewers can see onboarding, approval, suspension and payout-hold
 * without a backend. Development only.
 */
export function SellerStatePreview() {
  const applyScenario = useSellerStore((s) => s.applyScenario)

  const scenarios: { label: string; scenario: Scenario }[] = [
    { label: 'New seller · 0% setup', scenario: 'new' },
    { label: 'Mid onboarding · KYC in review', scenario: 'midOnboarding' },
    { label: 'Submitted · pending approval', scenario: 'pendingReview' },
    { label: 'Active seller', scenario: 'active' },
    { label: 'KYC changes required', scenario: 'changesRequired' },
    { label: 'Suspended', scenario: 'suspended' },
    { label: 'Payout hold', scenario: 'payoutHold' },
  ]

  return (
    <StatePreview
      label="Seller states"
      items={scenarios.map((s) => ({ label: s.label, onSelect: () => applyScenario(s.scenario) }))}
      note="Changes the account status, KYC state and onboarding progress across every seller screen."
    />
  )
}

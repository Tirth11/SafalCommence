import { create } from 'zustand'

/* ==========================================================================
   Seller session state.
   Drives onboarding progress, the account status banner and what the
   dashboard shows. Swap the setters for API mutations later — components
   only read from this store.
   ========================================================================== */

export type SellerAccountStatus = 'Onboarding' | 'Pending Review' | 'Active' | 'Suspended' | 'Payout Hold'
export type SellerKycStatus = 'Not Submitted' | 'Under Review' | 'Approved' | 'Changes Required' | 'Rejected'

export const ONBOARDING_STEPS = [
  { key: 'business', label: 'Business Details', to: '/seller/setup', step: 'business' },
  { key: 'kyc', label: 'Business Verification', to: '/seller/setup', step: 'kyc' },
  { key: 'bank', label: 'Bank Details', to: '/seller/setup', step: 'bank' },
  { key: 'pickup', label: 'Pickup Address', to: '/seller/setup', step: 'pickup' },
  { key: 'product', label: 'Add First Product', to: '/seller/setup', step: 'product' },
  { key: 'submitted', label: 'Submit for Approval', to: '/seller/setup', step: 'review' },
] as const

export type StepKey = (typeof ONBOARDING_STEPS)[number]['key']

type SellerState = {
  storeName: string
  ownerName: string
  email: string
  status: SellerAccountStatus
  kyc: SellerKycStatus
  /** Reason shown in the status banner for Changes Required / Suspended / Payout Hold. */
  statusReason?: string
  completed: Record<StepKey, boolean>

  completeStep: (key: StepKey) => void
  resetSteps: () => void
  setStatus: (status: SellerAccountStatus, reason?: string) => void
  setKyc: (kyc: SellerKycStatus, reason?: string) => void
  /** Jump the whole account to a known state — used by the dev state preview. */
  applyScenario: (scenario: Scenario) => void
}

export type Scenario = 'new' | 'midOnboarding' | 'pendingReview' | 'active' | 'changesRequired' | 'suspended' | 'payoutHold'

const NONE: Record<StepKey, boolean> = {
  business: false,
  kyc: false,
  bank: false,
  pickup: false,
  product: false,
  submitted: false,
}

const ALL: Record<StepKey, boolean> = {
  business: true,
  kyc: true,
  bank: true,
  pickup: true,
  product: true,
  submitted: true,
}

export const useSellerStore = create<SellerState>((set) => ({
  storeName: 'ABC Electronics',
  ownerName: 'Rahul Mehta',
  email: 'rahul@abcelectronics.in',
  status: 'Active',
  kyc: 'Approved',
  completed: ALL,

  completeStep: (key) => set((s) => ({ completed: { ...s.completed, [key]: true } })),
  resetSteps: () => set({ completed: NONE }),
  setStatus: (status, reason) => set({ status, statusReason: reason }),
  setKyc: (kyc, reason) => set({ kyc, statusReason: reason }),

  applyScenario: (scenario) =>
    set(() => {
      switch (scenario) {
        case 'new':
          return { completed: NONE, status: 'Onboarding', kyc: 'Not Submitted', statusReason: undefined }
        case 'midOnboarding':
          return {
            completed: { ...NONE, business: true, kyc: true },
            status: 'Onboarding',
            kyc: 'Under Review',
            statusReason: undefined,
          }
        case 'pendingReview':
          return { completed: ALL, status: 'Pending Review', kyc: 'Under Review', statusReason: undefined }
        case 'active':
          return { completed: ALL, status: 'Active', kyc: 'Approved', statusReason: undefined }
        case 'changesRequired':
          return {
            completed: { ...ALL, submitted: false },
            status: 'Onboarding',
            kyc: 'Changes Required',
            statusReason: 'Your GST certificate is unclear. Please upload a clearer copy.',
          }
        case 'suspended':
          return {
            completed: ALL,
            status: 'Suspended',
            kyc: 'Approved',
            statusReason: 'Repeated customer complaints about product authenticity are under investigation.',
          }
        case 'payoutHold':
          return {
            completed: ALL,
            status: 'Payout Hold',
            kyc: 'Approved',
            statusReason: 'An open return case is being reviewed. Settlements resume once it closes.',
          }
      }
    }),
}))

/** Derived helpers */
export function useOnboardingProgress() {
  const completed = useSellerStore((s) => s.completed)
  const done = ONBOARDING_STEPS.filter((step) => completed[step.key]).length
  return {
    done,
    total: ONBOARDING_STEPS.length,
    percent: Math.round((done / ONBOARDING_STEPS.length) * 100),
    isComplete: done === ONBOARDING_STEPS.length,
    nextStep: ONBOARDING_STEPS.find((step) => !completed[step.key]),
  }
}

/** Selling is disabled until the account is approved. */
export function useCanSell() {
  const status = useSellerStore((s) => s.status)
  return status === 'Active' || status === 'Payout Hold'
}

import { z } from 'zod'

/** Kept intentionally simple and explicit — copy is reviewed content, not derived. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const emailField = z
  .string()
  .trim()
  .min(1, 'Please enter your email address.')
  .refine((v) => EMAIL_RE.test(v), 'Enter a valid email address.')

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Please enter your password.'),
  remember: z.boolean(),
})
export type LoginValues = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({ email: emailField })
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

/** Password policy — surfaced live in the registration form as a checklist. */
export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { id: 'number', label: 'One number', test: (v: string) => /\d/.test(v) },
  { id: 'special', label: 'One special character', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'Please enter your first name.'),
    lastName: z.string().trim().min(1, 'Please enter your last name.'),
    email: emailField,
    password: z
      .string()
      .min(1, 'Please create a password.')
      .refine((v) => PASSWORD_RULES.every((r) => r.test(v)), 'Password does not meet the requirements below.'),
    confirmPassword: z.string().min(1, 'Please re-enter your password.'),
    terms: z.boolean().refine((v) => v === true, 'Please accept the Terms & Conditions to continue.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })
export type RegisterValues = z.infer<typeof registerSchema>

/**
 * Stand-in for the auth API until the backend lands.
 *
 * One account, multiple capabilities. The response says who the user is and
 * which seller organisations they belong to; the UI decides where to land from
 * that, never from a portal picker:
 *
 *   rahul@gmail.com          → buyer + seller (ABC Electronics) → seller portal
 *   demo@safalmarkethub.com  → buyer only                       → marketplace
 *   admin@safalmarkethub.com → SafalMarketHub staff             → admin portal
 *   unverified@example.com   → unverified account
 *   suspended@example.com    → suspended account
 *   anything else            → invalid credentials
 */
export type LoginOutcome = 'success' | 'invalid' | 'unverified' | 'suspended'
export type AccountPortal = '/' | '/shop' | '/seller' | '/admin'

export type SignInResult = {
  outcome: LoginOutcome
  /** Where a successful sign-in should land. */
  portal: AccountPortal
  /** Used in the "Taking you to …" toast. */
  portalLabel: string
  account: SignInAccount | null
}

export type SignInAccount = {
  portal: AccountPortal
  portalLabel: string
  user: { id: string; firstName: string; lastName: string; email: string }
  /** Seller organisations this user belongs to. Empty = buyer only. */
  organizations: { id: string; name: string; role: 'Owner' | 'Admin' }[]
  staff?: boolean
}

const ACCOUNTS: Record<string, SignInAccount> = {
  'rahul@gmail.com': {
    portal: '/seller',
    portalLabel: 'your seller dashboard',
    user: { id: 'USR-1', firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@gmail.com' },
    organizations: [{ id: 'ORG-1', name: 'ABC Electronics', role: 'Owner' }],
  },
  'demo@safalmarkethub.com': {
    portal: '/',
    portalLabel: 'your shopping home',
    user: { id: 'USR-2', firstName: 'Rohit', lastName: 'Sharma', email: 'demo@safalmarkethub.com' },
    organizations: [],
  },
  'admin@safalmarkethub.com': {
    portal: '/admin',
    portalLabel: 'the admin dashboard',
    user: { id: 'ADM-1', firstName: 'Tirth', lastName: 'Thaker', email: 'admin@safalmarkethub.com' },
    organizations: [],
    staff: true,
  },
}

export function mockSignIn({ email }: { email: string }): Promise<SignInResult> {
  const key = email.trim().toLowerCase()
  const account = ACCOUNTS[key]

  const outcome: LoginOutcome =
    key === 'unverified@example.com'
      ? 'unverified'
      : key === 'suspended@example.com'
        ? 'suspended'
        : account
          ? 'success'
          : 'invalid'

  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          outcome,
          portal: account?.portal ?? '/',
          portalLabel: account?.portalLabel ?? 'the marketplace',
          account: account ?? null,
        }),
      900
    )
  )
}

export const LOGIN_ERRORS: Record<Exclude<LoginOutcome, 'success'>, string> = {
  invalid: 'The email address or password you entered is incorrect.',
  unverified: 'Please verify your email address before signing in.',
  suspended: 'Your account is currently unavailable. Please contact support.',
}

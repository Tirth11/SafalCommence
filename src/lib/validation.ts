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
 * Email address selects the response so every state is reviewable:
 *   unverified@example.com → unverified account
 *   suspended@example.com  → suspended account
 *   demo@safalhub.com      → success
 *   anything else          → invalid credentials
 */
export type LoginOutcome = 'success' | 'invalid' | 'unverified' | 'suspended'

export function mockSignIn({ email }: { email: string }): Promise<LoginOutcome> {
  const key = email.trim().toLowerCase()
  const outcome: LoginOutcome =
    key === 'unverified@example.com'
      ? 'unverified'
      : key === 'suspended@example.com'
        ? 'suspended'
        : key === 'demo@safalhub.com'
          ? 'success'
          : 'invalid'
  return new Promise((resolve) => setTimeout(() => resolve(outcome), 900))
}

export const LOGIN_ERRORS: Record<Exclude<LoginOutcome, 'success'>, string> = {
  invalid: 'The email address or password you entered is incorrect.',
  unverified: 'Please verify your email address before signing in.',
  suspended: 'Your account is currently unavailable. Please contact support.',
}

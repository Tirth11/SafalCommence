import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CircleAlert, Lock, MailCheck, ScrollText, ShieldCheck, Users } from 'lucide-react'
import { z } from 'zod'

import { PasswordInput } from '@/components/auth/auth-bits'
import { Logo } from '@/components/brand/logo'
import { StatePreview } from '@/components/dev/state-preview'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { emailField } from '@/lib/validation'

const adminLoginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Please enter your password.'),
})
type AdminLoginValues = z.infer<typeof adminLoginSchema>

const forgotSchema = z.object({ email: emailField })

const ERRORS = {
  invalid: 'The email address or password is incorrect.',
  inactive: 'Your account is currently inactive. Please contact the system administrator.',
}

/**
 * Admin sign-in is deliberately a separate, plainer surface from the storefront
 * login: no social sign-in, no "create account" path, no seller cross-sell.
 */
export function AdminLoginPage() {
  const [view, setView] = useState<'signin' | 'forgot' | 'sent'>('signin')

  return (
    <div className="flex min-h-dvh flex-col bg-ink-950 lg:flex-row">
      {/* Left: internal-tool framing */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:p-14">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-160 from-brand-800/50 via-transparent to-transparent" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 size-[460px] rounded-full bg-brand-600/20 blur-3xl" />

        <div className="relative">
          <Logo onInk sub="Super Admin" to="/admin" />
        </div>

        <div className="relative">
          <h2 className="max-w-[420px] text-4xl text-white">Marketplace control panel</h2>
          <p className="mt-4 max-w-[400px] text-[15px] leading-relaxed text-ink-300">
            Sellers, catalogue, orders, payments and settlements — operated from one place, with every action traceable.
          </p>
          <ul className="mt-9 grid max-w-[420px] gap-2.5">
            {[
              { icon: Users, text: 'Seller onboarding, KYC and approvals' },
              { icon: ShieldCheck, text: 'Product moderation and policy control' },
              { icon: ScrollText, text: 'Immutable audit trail for every decision' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 rounded-sm border border-white/10 bg-white/6 px-4 py-3">
                <Icon className="size-[17px] shrink-0 text-brand-300" />
                <span className="text-[13px] text-ink-200">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-ink-500">© 2026 SafalHub · Internal use only</p>
      </div>

      {/* Right: form */}
      <main className="flex flex-1 items-center justify-center bg-background px-5 py-12 sm:px-8">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 lg:hidden">
            <Logo size="lg" sub="Super Admin" to="/admin" />
          </div>

          {view === 'signin' && <SignInForm onForgot={() => setView('forgot')} />}
          {view === 'forgot' && <ForgotForm onBack={() => setView('signin')} onSent={() => setView('sent')} />}
          {view === 'sent' && <SentPanel onBack={() => setView('signin')} />}

          <p className="mt-10 flex items-center gap-2 rounded-sm border bg-muted/60 px-3.5 py-3 text-[12px] leading-relaxed text-ink-500">
            <Lock className="size-4 shrink-0" />
            Access is restricted to authorised SafalHub staff. Sessions expire after 30 minutes of inactivity.
          </p>

          <div className="mt-6 text-center">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="size-4" />
                Back to storefront
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <StatePreview
        label="Admin login states"
        items={[
          { label: 'Sign in', onSelect: () => setView('signin') },
          { label: 'Forgot password', onSelect: () => setView('forgot') },
          { label: 'Reset link sent', onSelect: () => setView('sent') },
        ]}
        note="admin@safalhub.com signs in. inactive@safalhub.com returns the inactive-account error. Anything else returns incorrect credentials."
      />
    </div>
  )
}

function SignInForm({ onForgot }: { onForgot: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const navigate = useNavigate()

  const form = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: AdminLoginValues) {
    setServerError(null)
    await new Promise((r) => setTimeout(r, 800))
    const key = values.email.trim().toLowerCase()
    if (key === 'admin@safalhub.com') {
      navigate({ to: '/admin' })
      return
    }
    setServerError(key === 'inactive@safalhub.com' ? ERRORS.inactive : ERRORS.invalid)
  }

  return (
    <>
      <h1 className="text-2xl sm:text-[28px]">Sign in to Admin Portal</h1>
      <p className="mt-2 text-[15px] text-ink-600 dark:text-ink-300">Use your SafalHub staff account.</p>

      {serverError && (
        <Alert variant="destructive" className="mt-6">
          <CircleAlert />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="mt-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="you@safalhub.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  action={
                    <button type="button" onClick={onForgot} className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300">
                      Forgot password?
                    </button>
                  }
                >
                  Password
                </FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="current-password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" loading={form.formState.isSubmitting} loadingLabel="Signing in...">
            Sign In
          </Button>
        </form>
      </Form>
    </>
  )
}

function ForgotForm({ onBack, onSent }: { onBack: () => void; onSent: () => void }) {
  const form = useForm<z.infer<typeof forgotSchema>>({ resolver: zodResolver(forgotSchema), defaultValues: { email: '' } })

  return (
    <>
      <h1 className="text-2xl sm:text-[28px]">Reset your password</h1>
      <p className="mt-2 text-[15px] text-ink-600 dark:text-ink-300">
        Enter your staff email address and we'll send reset instructions.
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async () => {
            await new Promise((r) => setTimeout(r, 700))
            onSent()
          })}
          noValidate
          className="mt-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@safalhub.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" loading={form.formState.isSubmitting} loadingLabel="Sending...">
            Send Reset Link
          </Button>
        </form>
      </Form>
      <button
        type="button"
        onClick={onBack}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Back to Sign In
      </button>
    </>
  )
}

function SentPanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-600/15 dark:text-teal-100">
        <MailCheck className="size-8" />
      </span>
      <h1 className="mt-6 text-2xl">Check your email</h1>
      <p className="mx-auto mt-3 max-w-[340px] text-[15px] text-ink-600 dark:text-ink-300">
        If the address belongs to an active staff account, reset instructions are on the way.
      </p>
      <Button variant="outline" className="mt-8 w-full" onClick={onBack}>
        <ArrowLeft className="size-4" />
        Back to Sign In
      </Button>
    </div>
  )
}

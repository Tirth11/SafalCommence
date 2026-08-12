import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, ArrowLeft, MailCheck } from 'lucide-react'
import { toast } from 'sonner'

import { AuthBrandPanel } from '@/components/auth/auth-brand-panel'
import { AuthFormHeading, GoogleButton, OrDivider, PasswordInput } from '@/components/auth/auth-bits'
import { Logo } from '@/components/brand/logo'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatePreview } from '@/components/dev/state-preview'
import { useAccountStore } from '@/store/account-store'
import {
  forgotPasswordSchema,
  LOGIN_ERRORS,
  loginSchema,
  mockSignIn,
  type ForgotPasswordValues,
  type LoginValues,
} from '@/lib/validation'

type View = 'signin' | 'forgot' | 'sent'

export function LoginPage() {
  const [view, setView] = useState<View>('signin')
  const [resetEmail, setResetEmail] = useState('')
  return (
    <div className="flex min-h-dvh">
      <AuthBrandPanel />

      <main className="flex flex-1 flex-col">
        {/* Mobile brand bar */}
        <div className="flex items-center justify-between border-b px-5 py-4 lg:hidden">
          <Logo size="sm" />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/register">Create Account</Link>
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 sm:py-14">
          <div className="w-full max-w-[420px]">
            <div className="mb-8 hidden lg:block">
              <Logo size="lg" />
            </div>

            {view === 'signin' && <SignInForm onForgot={() => setView('forgot')} />}
            {view === 'forgot' && (
              <ForgotPasswordForm
                onBack={() => setView('signin')}
                onSent={(email) => {
                  setResetEmail(email)
                  setView('sent')
                }}
              />
            )}
            {view === 'sent' && <ResetLinkSent email={resetEmail} onBack={() => setView('signin')} />}
          </div>
        </div>
      </main>

      <StatePreview
        label="Login states"
        items={[
          { label: 'Sign in', onSelect: () => setView('signin') },
          { label: 'Forgot password', onSelect: () => setView('forgot') },
          { label: 'Reset link sent', onSelect: () => { setResetEmail('rahul@example.com'); setView('sent') } },
        ]}
        note="One account, many capabilities. rahul@gmail.com is buyer + seller (ABC Electronics) → seller portal. demo@safalmarkethub.com is buyer only → marketplace. admin@safalmarkethub.com is staff → admin portal. unverified@example.com and suspended@example.com show those errors."
      />
    </div>
  )
}

/* ------------------------------------------------------------------ sign in */
function SignInForm({ onForgot }: { onForgot: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const navigate = useNavigate()
  const signIn = useAccountStore((s) => s.signIn)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: { email: '', password: '', remember: true },
  })

  async function onSubmit(values: LoginValues) {
    setServerError(null)

    // No portal picker: the account's capabilities decide where it lands.
    const { outcome, portal, portalLabel, account } = await mockSignIn(values)
    if (outcome === 'success' && account) {
      // One identity carrying both buyer access and any seller memberships.
      signIn(
        account.user,
        account.organizations.map((org) => ({ ...org, status: 'Active' as const }))
      )
      toast.success('Signed in', { description: `Taking you to ${portalLabel}…` })
      navigate({ to: portal })
      return
    }
    if (outcome !== 'success') setServerError(LOGIN_ERRORS[outcome])
  }

  return (
    <>
      <AuthFormHeading title="Sign in to your account" sub="Enter your details to continue." />

      {serverError && (
        <Alert variant="destructive" className="mb-5">
          <CircleAlert />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
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
                    <button
                      type="button"
                      onClick={onForgot}
                      className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
                    >
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

          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="mb-6 flex items-center gap-2.5">
                <FormControl>
                  <Checkbox id="remember" checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <Label htmlFor="remember" className="cursor-pointer font-medium text-ink-700 dark:text-ink-300">
                  Remember me
                </Label>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" loading={form.formState.isSubmitting} loadingLabel="Signing in...">
            Sign In
          </Button>
        </form>
      </Form>

      <OrDivider className="my-6" />
      <GoogleButton />

      <p className="mt-7 text-center text-sm text-ink-600 dark:text-ink-300">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
          Create Account
        </Link>
      </p>
    </>
  )
}

/* --------------------------------------------------------- forgot password */
function ForgotPasswordForm({ onBack, onSent }: { onBack: () => void; onSent: (email: string) => void }) {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: ForgotPasswordValues) {
    await new Promise((r) => setTimeout(r, 800))
    onSent(values.email)
  }

  return (
    <>
      <AuthFormHeading
        title="Forgot your password?"
        sub="Enter your registered email address and we'll send you instructions to reset your password."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="mt-1 w-full" loading={form.formState.isSubmitting} loadingLabel="Sending...">
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

/* ------------------------------------------------------------ success state */
function ResetLinkSent({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <div className="text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-600/15 dark:text-teal-100">
        <MailCheck className="size-8" />
      </span>
      <h1 className="mt-6 text-2xl">Check your email</h1>
      <p className="mx-auto mt-3 max-w-[360px] text-[15px] text-ink-600 dark:text-ink-300">
        We've sent password reset instructions to your registered email address.
      </p>
      {email && <p className="mt-2 text-sm font-semibold text-ink-900 dark:text-white">{email}</p>}

      <Button variant="outline" className="mt-8 w-full" onClick={onBack}>
        <ArrowLeft className="size-4" />
        Back to Sign In
      </Button>
      <p className="mt-5 text-xs text-ink-500">Didn't receive the email? Check your spam or junk folder.</p>
    </div>
  )
}

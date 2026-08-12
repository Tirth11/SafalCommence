import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, Mail, Pencil, RefreshCw, ShoppingBag, Store } from 'lucide-react'
import { toast } from 'sonner'

import { AuthBrandPanel } from '@/components/auth/auth-brand-panel'
import {
  AuthFormHeading,
  GoogleButton,
  OrDivider,
  PasswordChecklist,
  PasswordInput,
} from '@/components/auth/auth-bits'
import { Logo } from '@/components/brand/logo'
import { StatePreview } from '@/components/dev/state-preview'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAccountStore } from '@/store/account-store'
import { registerSchema, type RegisterValues } from '@/lib/validation'

type Step = 'form' | 'verify' | 'welcome'

export function RegisterPage() {
  const [step, setStep] = useState<Step>('form')
  const [email, setEmail] = useState('rahul@example.com')

  return (
    <div className="flex min-h-dvh">
      <AuthBrandPanel
        title="Start in minutes"
        body="One account to shop across the marketplace — and to run your business when you're ready to sell."
      />

      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b px-5 py-4 lg:hidden">
          <Logo size="sm" />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 sm:py-14">
          <div className={step === 'welcome' ? 'w-full max-w-[720px]' : 'w-full max-w-[460px]'}>
            <div className="mb-8 hidden lg:block">
              <Logo size="lg" />
            </div>

            {step === 'form' && (
              <RegisterForm
                onCreated={(value) => {
                  setEmail(value)
                  setStep('verify')
                }}
              />
            )}
            {step === 'verify' && (
              <VerifyEmail
                email={email}
                onChangeEmail={() => setStep('form')}
                onVerified={() => setStep('welcome')}
              />
            )}
            {step === 'welcome' && <WelcomeChoice email={email} />}
          </div>
        </div>
      </main>

      <StatePreview
        label="Registration states"
        items={[
          { label: '1 — Create account', onSelect: () => setStep('form') },
          { label: '2 — Verify email', onSelect: () => setStep('verify') },
          { label: '3 — Verified, choose path', onSelect: () => setStep('welcome') },
        ]}
        note="Business and KYC details are collected only after the user chooses Start Selling."
      />
    </div>
  )
}

/* ------------------------------------------------------------ 1. Create account */
function RegisterForm({ onCreated }: { onCreated: (email: string) => void }) {
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  })

  const password = form.watch('password')

  async function onSubmit(values: RegisterValues) {
    await new Promise((r) => setTimeout(r, 900))
    onCreated(values.email)
  }

  return (
    <>
      <AuthFormHeading
        title="Create your account"
        sub="Shop products or start your business journey with SafalMarketHub."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input autoComplete="given-name" placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input autoComplete="family-name" placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
              <FormItem className="mb-3">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" placeholder="Create a password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <PasswordChecklist value={password} />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="mt-5">
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" placeholder="Re-enter password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="mb-6 gap-2">
                <div className="flex items-start gap-2.5">
                  <FormControl>
                    <Checkbox id="terms" checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                  </FormControl>
                  <Label htmlFor="terms" className="cursor-pointer items-start font-medium leading-snug text-ink-700 dark:text-ink-300">
                    <span>
                      I agree to the{' '}
                      <a href="/#" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
                        Terms &amp; Conditions
                      </a>{' '}
                      and{' '}
                      <a href="/#" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </Label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" loading={form.formState.isSubmitting} loadingLabel="Creating account...">
            Create Account
          </Button>
        </form>
      </Form>

      <OrDivider className="my-6" />
      <GoogleButton label="Continue with Google" />

      <p className="mt-7 text-center text-sm text-ink-600 dark:text-ink-300">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
          Sign In
        </Link>
      </p>
    </>
  )
}

/* ------------------------------------------------------- 2. Verify your email */
function VerifyEmail({
  email,
  onChangeEmail,
  onVerified,
}: {
  email: string
  onChangeEmail: () => void
  onVerified: () => void
}) {
  const [resending, setResending] = useState(false)

  async function resend() {
    setResending(true)
    await new Promise((r) => setTimeout(r, 900))
    setResending(false)
    toast.success('Verification email sent', { description: email })
  }

  return (
    <div className="text-center">
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto grid size-16 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-200"
      >
        <Mail className="size-8" />
      </motion.span>

      <h1 className="mt-6 text-2xl sm:text-[28px]">Verify your email</h1>
      <p className="mx-auto mt-3 max-w-[380px] text-[15px] text-ink-600 dark:text-ink-300">
        We've sent a verification link to
      </p>
      <p className="mt-1.5 text-[15px] font-semibold text-ink-900 dark:text-white">{email}</p>
      <p className="mx-auto mt-3 max-w-[380px] text-[15px] text-ink-600 dark:text-ink-300">
        Click the link in the email to activate your account.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Button variant="outline" onClick={resend} loading={resending} loadingLabel="Sending...">
          <RefreshCw className="size-4" />
          Resend Email
        </Button>
        <Button variant="outline" onClick={onChangeEmail}>
          <Pencil className="size-4" />
          Change Email Address
        </Button>
      </div>

      <p className="mt-5 text-xs text-ink-500">Didn't receive the email? Check your spam or junk folder.</p>

      {/* Stands in for the user returning via the emailed link */}
      <button
        type="button"
        onClick={onVerified}
        className="mx-auto mt-8 inline-flex items-center gap-2 border-t pt-6 text-[13px] font-semibold text-brand-600 hover:underline dark:text-brand-300"
      >
        Simulate verified email link
        <ArrowRight className="size-3.5" />
      </button>
    </div>
  )
}

/* -------------------------------------------- 3. Verified — shop or sell next */
function WelcomeChoice({ email }: { email: string }) {
  const signIn = useAccountStore((s) => s.signIn)

  /** The account already exists at this point — both cards continue into it. */
  const enterAccount = () =>
    signIn({ id: 'USR-NEW', firstName: 'Rahul', lastName: 'Sharma', email }, [])

  return (
    <div>
      <div className="text-center">
        <motion.span
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16 }}
          className="mx-auto grid size-16 place-items-center rounded-full bg-teal-500 text-white"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.18, type: 'spring', stiffness: 300, damping: 14 }}
          >
            <Check className="size-9" strokeWidth={3} />
          </motion.span>
        </motion.span>

        <h1 className="mt-6 text-2xl sm:text-[30px]">You're all set!</h1>
        <p className="mx-auto mt-3 max-w-[440px] text-[15px] text-ink-600 dark:text-ink-300">
          Your SafalMarketHub account has been created successfully.
        </p>
        <p className="mt-8 text-sm font-semibold text-ink-800 dark:text-ink-200">What would you like to do first?</p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {/* Shop */}
        <div className="flex flex-col rounded-lg border bg-card p-6">
          <span className="grid size-12 place-items-center rounded-md bg-ink-100 text-ink-700 dark:bg-secondary dark:text-ink-200">
            <ShoppingBag className="size-6" />
          </span>
          <h2 className="mt-5 text-lg">Shop Products</h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            Explore products from sellers across SafalMarketHub.
          </p>
          <Button variant="outline" className="mt-6 w-full" asChild onClick={enterAccount}>
            <Link to="/shop">Start Shopping</Link>
          </Button>
        </div>

        {/* Sell — intentionally the more prominent card */}
        <div className="relative flex flex-col rounded-lg border-2 border-brand-600 bg-card p-6 shadow-lg">
          <span className="absolute -top-3 left-6 rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
            Recommended
          </span>
          <span className="grid size-12 place-items-center rounded-md bg-brand-600 text-white">
            <Store className="size-6" />
          </span>
          <h2 className="mt-5 text-lg">Start Selling</h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            Create your business profile, list products and start selling.
          </p>
          <Button className="mt-6 w-full" asChild onClick={enterAccount}>
            <Link to="/seller/setup">Set Up My Business</Link>
          </Button>
        </div>
      </div>

      <p className="mt-7 text-center text-sm text-ink-500">
        This is only what you'd like to do next — not an account type. One SafalMarketHub account covers both shopping
        and selling, and you can add selling whenever you're ready.
      </p>
      <div className="mt-4 flex justify-center">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </Button>
      </div>
    </div>
  )
}

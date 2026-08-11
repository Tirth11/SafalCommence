import { Link } from '@tanstack/react-router'

import { Section, SectionHead } from '@/components/marketing/section'
import { Button } from '@/components/ui/button'

const STEPS = [
  { n: '01', title: 'Create your account', body: 'Register using your email address.' },
  { n: '02', title: 'Set up your business', body: 'Enter your business details and complete verification.' },
  { n: '03', title: 'Add your products', body: 'Upload products, pricing and inventory.' },
  { n: '04', title: 'Start selling', body: 'Once approved, your products become available to customers.' },
]

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <div className="container-page">
        <SectionHead center title="Start selling in four simple steps" />

        {/* Horizontal stepper on desktop, vertical on mobile */}
        <ol className="relative mt-14 grid gap-8 md:grid-cols-4 md:gap-6">
          {/* connector line — desktop */}
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-6 hidden h-px bg-linear-to-r from-transparent via-ink-200 to-transparent md:block dark:via-border"
          />
          {STEPS.map((step, i) => (
            <li key={step.n} className="relative flex gap-5 md:block">
              {/* connector line — mobile */}
              {i < STEPS.length - 1 && (
                <span aria-hidden="true" className="absolute left-6 top-12 h-[calc(100%+2rem)] w-px bg-border md:hidden" />
              )}
              <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full border-2 border-brand-100 bg-background text-[15px] font-bold text-brand-600 tabular dark:border-brand-800 dark:text-brand-300">
                {step.n}
              </span>
              <div className="md:mt-5">
                <h3 className="text-[17px]">{step.title}</h3>
                <p className="mt-1.5 max-w-[240px] text-sm leading-relaxed text-ink-600 dark:text-ink-300">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex justify-center">
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link to="/register">Create Seller Account</Link>
          </Button>
        </div>
      </div>
    </Section>
  )
}

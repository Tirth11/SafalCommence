import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative grid w-full grid-cols-[auto_1fr] items-start gap-x-2.5 gap-y-1 rounded-sm border px-4 py-3.5 text-sm leading-snug [&>svg]:mt-px [&>svg]:size-[18px]',
  {
    variants: {
      variant: {
        default: 'border-border bg-muted text-ink-700 dark:text-foreground',
        destructive: 'border-destructive/25 bg-destructive/8 text-destructive [&_a]:text-destructive',
        info: 'border-brand-100 bg-brand-50 text-brand-800 dark:border-brand-800 dark:bg-brand-950/60 dark:text-brand-200',
        success: 'border-teal-100 bg-teal-50 text-teal-600 dark:border-teal-600/40 dark:bg-teal-600/12 dark:text-teal-100',
        warning: 'border-gold-100 bg-gold-50 text-gold-600 dark:bg-gold-600/12 dark:text-gold-400',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-title" className={cn('col-start-2 font-semibold', className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-description" className={cn('col-start-2 [&_a]:font-semibold [&_a]:underline', className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription }

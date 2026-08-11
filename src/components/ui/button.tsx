import * as React from 'react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { LoaderCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-sm border border-transparent font-semibold tracking-[-0.01em] outline-none transition-[background-color,border-color,color,box-shadow,transform] duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-55 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[18px]",
  {
    variants: {
      variant: {
        /** Primary — solid brand. One per view. */
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-brand-700 hover:shadow-md active:translate-y-px active:bg-brand-800 dark:hover:bg-brand-300',
        /** Secondary — outline */
        outline: 'border-input bg-background text-ink-900 hover:border-ink-400 hover:bg-ink-50 dark:text-foreground dark:hover:bg-secondary',
        /** Tertiary — text / link-ish */
        ghost: 'text-ink-700 hover:bg-ink-100 hover:text-ink-950 dark:text-foreground dark:hover:bg-secondary',
        link: 'h-auto p-0 font-semibold text-primary underline-offset-4 hover:underline',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-ink-200 dark:hover:bg-ink-800',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:brightness-95',
        /** On dark sections */
        onInk: 'bg-white text-ink-950 hover:bg-ink-100',
        onInkOutline: 'border-white/25 text-white hover:border-white/50 hover:bg-white/10',
      },
      size: {
        sm: 'h-10 px-4 text-sm',
        default: 'h-12 px-5.5 text-[15px] sm:text-[17px]',
        lg: 'h-14 px-7 text-[17px]',
        icon: 'size-10 rounded-sm px-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
    loadingLabel?: string
  }

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  loadingLabel,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      aria-busy={loading || undefined}
      {...(asChild ? {} : { disabled: loading || disabled })}
      {...props}
    >
      {loading ? (
        <>
          <LoaderCircle className="size-[18px] animate-spin" />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }

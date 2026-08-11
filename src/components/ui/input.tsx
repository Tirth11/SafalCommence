import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-[50px] w-full min-w-0 rounded-sm border border-input bg-background px-3.5 text-base text-ink-900 shadow-xs outline-none transition-[border-color,box-shadow] duration-150 dark:text-foreground',
        'placeholder:text-ink-400 selection:bg-brand-600 selection:text-white',
        'hover:border-ink-400',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20',
        'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20',
        'disabled:cursor-not-allowed disabled:bg-muted disabled:text-ink-400',
        'file:h-full file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className
      )}
      {...props}
    />
  )
}

export { Input }

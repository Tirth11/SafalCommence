import type * as React from 'react'
import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'min-h-[92px] w-full rounded-sm border border-input bg-background px-3.5 py-2.5 text-sm text-ink-900 shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-ink-400 hover:border-ink-400 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 aria-invalid:border-destructive disabled:bg-muted dark:text-foreground',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

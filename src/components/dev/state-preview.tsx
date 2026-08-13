import { useState } from 'react'
import { Layers, X } from 'lucide-react'

import { cn } from '@/lib/utils'

type Item = { label: string; onSelect: () => void }

/**
 * Design-review helper — lets reviewers jump between screen states without a
 * backend. Rendered only in development; strip it once real auth is wired.
 */
export function StatePreview({ label, items, note }: { label: string; items: Item[]; note?: string }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  if (!import.meta.env.DEV) return null

  return (
    <div
      className={cn(
        'state-preview fixed bottom-4 right-4 z-[120] transition-[right,opacity] print:hidden',
        // Steps clear of the seller assistant panel rather than being buried
        // under it; the panel is full width on small screens, so hide there.
        "[body[data-assistant-open='true']_&]:right-[444px]",
        "max-lg:[body[data-assistant-open='true']_&]:pointer-events-none max-lg:[body[data-assistant-open='true']_&]:opacity-0"
      )}
    >
      {open ? (
        <div className="w-[290px] rounded-md border bg-popover p-3.5 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-ink-400">{label}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close state preview"
              className="grid size-7 place-items-center rounded-sm text-ink-500 hover:bg-ink-100 dark:hover:bg-secondary"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-3 grid gap-1.5">
            {items.map((item, i) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setActive(i)
                  item.onSelect()
                }}
                className={cn(
                  'rounded-sm px-3 py-2 text-left text-[13px] font-medium transition-colors',
                  active === i
                    ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                    : 'text-ink-700 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-secondary'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          {note && <p className="mt-3 border-t pt-3 text-[11px] leading-relaxed text-ink-500">{note}</p>}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border bg-popover px-4 py-2.5 text-[13px] font-semibold text-ink-700 shadow-lg transition-colors hover:text-ink-950 dark:text-ink-300 dark:hover:text-white"
        >
          <Layers className="size-4" />
          {label}
        </button>
      )}
    </div>
  )
}

import { useSyncExternalStore } from 'react'

/* ==========================================================================
   A one-bit signal: is a right-hand side panel open?

   The dev state-preview pill sits bottom-right, exactly where the seller
   assistant opens. Rather than fight it with z-index — which only decides
   which one is unusable — the pill reads this and moves out of the way.

   Deliberately not CSS: an arbitrary Tailwind variant with nested brackets
   doesn't compile, and a raw rule loses to the utilities layer.
   ========================================================================== */

/** Width of the side panel, shared so the pill knows how far to step. */
export const SIDE_PANEL_WIDTH = 420

let open = false
const listeners = new Set<() => void>()

export function setSidePanelOpen(next: boolean) {
  if (open === next) return
  open = next
  listeners.forEach((listener) => listener())
}

export function useSidePanelOpen() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => open,
    () => false
  )
}

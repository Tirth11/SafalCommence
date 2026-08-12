import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Every amount in the product renders through this one function, so the
 * display currency is a single decision rather than 180 scattered ones.
 */
export function money(value: number, withDecimals = false) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  }).format(value)
}

export function discountPercent(mrp: number, price: number) {
  return Math.round(((mrp - price) / mrp) * 100)
}

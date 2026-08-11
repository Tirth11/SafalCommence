import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Indian-format currency, e.g. 2,45,800 → "₹2,45,800" */
export function inr(value: number, withDecimals = false) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  }).format(value)
}

export function discountPercent(mrp: number, price: number) {
  return Math.round(((mrp - price) / mrp) * 100)
}

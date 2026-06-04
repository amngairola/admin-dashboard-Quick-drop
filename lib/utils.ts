import { clsx, type ClassValue } from 'clsx'
import { format } from 'date-fns'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, decimals = 2) {
  return `₹${amount.toFixed(decimals)}`
}

export function formatJoinedDate(date: string) {
  return format(new Date(date), 'dd MMM yyyy')
}

export function formatBookingDate(date: string) {
  return format(new Date(date), 'dd MMM yyyy, HH:mm')
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

import { format, formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), 'dd MMM yyyy, HH:mm', { locale: idLocale })
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: idLocale })
}

export function calculateTotalPrice(pricePerHour: number, durationHours: number): number {
  return pricePerHour * durationHours
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'available':
      return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
    case 'rented':
      return 'bg-amber-500/15 text-amber-700 border-amber-500/30'
    case 'maintenance':
      return 'bg-red-500/15 text-red-700 border-red-500/30'
    case 'pending':
      return 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30'
    case 'active':
      return 'bg-blue-500/15 text-blue-700 border-blue-500/30'
    case 'completed':
      return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
    case 'cancelled':
      return 'bg-red-500/15 text-red-700 border-red-500/30'
    default:
      return 'bg-gray-500/15 text-gray-700 border-gray-500/30'
  }
}

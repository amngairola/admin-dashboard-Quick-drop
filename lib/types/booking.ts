export const BOOKING_STATUSES = [
  'request_received',
  'rider_assigned',
  'pickup_completed',
  'on_the_way',
  'delivered',
] as const

export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  request_received: 'Request Received',
  rider_assigned: 'Rider Assigned',
  pickup_completed: 'Pickup Completed',
  on_the_way: 'On The Way',
  delivered: 'Delivered',
}

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  request_received: 'bg-amber-500/10 text-amber-500',
  rider_assigned: 'bg-blue-500/10 text-blue-500',
  pickup_completed: 'bg-indigo-500/10 text-indigo-500',
  on_the_way: 'bg-orange-500/10 text-orange-500',
  delivered: 'bg-green-500/10 text-green-500',
}

export const BOOKING_STATUS_DISTRIBUTION = [
  { status: 'request_received' as const, label: 'Request Received', color: 'bg-amber-500' },
  { status: 'rider_assigned' as const, label: 'Rider Assigned', color: 'bg-blue-500' },
  { status: 'pickup_completed' as const, label: 'Pickup Completed', color: 'bg-indigo-500' },
  { status: 'on_the_way' as const, label: 'On The Way', color: 'bg-orange-500' },
  { status: 'delivered' as const, label: 'Delivered', color: 'bg-green-500' },
]

export function isBookingStatus(value: string): value is BookingStatus {
  return BOOKING_STATUSES.includes(value as BookingStatus)
}

export function getStatusLabel(status: string): string {
  if (isBookingStatus(status)) return BOOKING_STATUS_LABELS[status]
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function getStatusColor(status: string): string {
  if (isBookingStatus(status)) return BOOKING_STATUS_COLORS[status]
  return 'bg-gray-500/10 text-gray-500'
}

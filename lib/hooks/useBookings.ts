import { useQuery } from '@tanstack/react-query'
import { getBookings, getRecentBookings, getBookingStats, type Booking } from '@/lib/services/bookings'

export function useBookings(filters?: Parameters<typeof getBookings>[0]) {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => getBookings(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export function useRecentBookings(limit?: number) {
  return useQuery({
    queryKey: ['bookings:recent', limit],
    queryFn: () => getRecentBookings(limit),
    staleTime: 1000 * 60 * 2,
  })
}

export function useBookingStats() {
  return useQuery({
    queryKey: ['bookings:stats'],
    queryFn: () => getBookingStats(),
    staleTime: 1000 * 60 * 5,
  })
}

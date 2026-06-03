import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBookings, getRecentBookings, getBookingStats, updateBookingStatus, getBookingsWithCustomer, type Booking } from '@/lib/services/bookings'

export function useBookings(filters?: Parameters<typeof getBookings>[0]) {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => getBookings(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export function useBookingsWithCustomer(filters?: Parameters<typeof getBookingsWithCustomer>[0]) {
  return useQuery({
    queryKey: ['bookings:with-customer', filters],
    queryFn: () => getBookingsWithCustomer(filters),
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

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: Booking['status'] }) =>
      updateBookingStatus(bookingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['bookings:stats'] })
      queryClient.invalidateQueries({ queryKey: ['bookings:recent'] })
    },
  })
}

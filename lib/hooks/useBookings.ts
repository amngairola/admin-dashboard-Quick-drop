import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBookings, getRecentBookings, getBookingStats, updateBookingStatus, getBookingsWithCustomer, type Booking } from '@/lib/services/bookings'
import { createClient } from '@/lib/supabase/client'

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
      queryClient.invalidateQueries({ queryKey: ['bookings:with-customer'] })
      queryClient.invalidateQueries({ queryKey: ['bookings:stats'] })
      queryClient.invalidateQueries({ queryKey: ['bookings:recent'] })
    },
  })
}

/**
 * Real-time subscription to booking changes
 * Automatically invalidates cache when new bookings are created or updated
 */
export function useBookingsRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('bookings:changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          // Invalidate all booking queries to refetch latest data
          queryClient.invalidateQueries({ queryKey: ['bookings'] })
          queryClient.invalidateQueries({ queryKey: ['bookings:with-customer'] })
          queryClient.invalidateQueries({ queryKey: ['bookings:stats'] })
          queryClient.invalidateQueries({ queryKey: ['bookings:recent'] })
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [queryClient])
}

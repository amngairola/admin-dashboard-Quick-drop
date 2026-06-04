import { createClient } from '@/lib/supabase/server'
import { BOOKING_STATUS_DISTRIBUTION } from '@/lib/types/booking'

export interface DashboardStats {
  total_users: number
  total_bookings: number
  pending_bookings: number
  completed_bookings: number
  cancelled_bookings: number
  total_revenue: number
  status_counts: Record<string, number>
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  const [
    usersResult,
    totalBookingsResult,
    pendingResult,
    deliveredResult,
    cancelledResult,
    revenueResult,
    ...statusResults
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'request_received'),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'delivered'),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'cancelled'),
    supabase.from('bookings').select('estimated_price'),
    ...BOOKING_STATUS_DISTRIBUTION.map(({ status }) =>
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', status),
    ),
  ])

  const totalRevenue =
    (revenueResult.data as { estimated_price: number }[] | null)?.reduce(
      (sum, b) => sum + (b.estimated_price || 0),
      0,
    ) ?? 0

  const status_counts: Record<string, number> = {}
  BOOKING_STATUS_DISTRIBUTION.forEach(({ status }, i) => {
    status_counts[status] = statusResults[i].count ?? 0
  })

  return {
    total_users: usersResult.count ?? 0,
    total_bookings: totalBookingsResult.count ?? 0,
    pending_bookings: pendingResult.count ?? 0,
    completed_bookings: deliveredResult.count ?? 0,
    cancelled_bookings: cancelledResult.count ?? 0,
    total_revenue: totalRevenue,
    status_counts,
  }
}

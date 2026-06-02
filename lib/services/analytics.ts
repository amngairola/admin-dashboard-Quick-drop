import { createClient } from '@/lib/supabase/client'

export interface RevenueData {
  id: string
  booking_id: string
  amount: number
  commission?: number
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  completed_at?: string
}

export async function getRevenueSummary(dateRange?: { from: Date; to: Date }) {
  const supabase = createClient()
  let query = supabase.from('revenue').select('*')

  if (dateRange) {
    query = query
      .gte('created_at', dateRange.from.toISOString())
      .lte('created_at', dateRange.to.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching revenue:', error)
    return null
  }

  const revenues = (data as RevenueData[]) || []

  const totalRevenue = revenues.reduce((sum, r) => sum + (r.amount || 0), 0)
  const totalCommission = revenues.reduce((sum, r) => sum + (r.commission || 0), 0)
  const completedCount = revenues.filter((r) => r.status === 'completed').length
  const pendingCount = revenues.filter((r) => r.status === 'pending').length

  return {
    total_revenue: totalRevenue,
    total_commission: totalCommission,
    net_revenue: totalRevenue - totalCommission,
    completed_count: completedCount,
    pending_count: pendingCount,
    average_fare: totalRevenue / (completedCount || 1),
  }
}

export async function getRevenueByDate(dateRange: { from: Date; to: Date }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('revenue')
    .select('*')
    .gte('created_at', dateRange.from.toISOString())
    .lte('created_at', dateRange.to.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching revenue by date:', error)
    return []
  }

  const revenues = (data as RevenueData[]) || []

  // Group by date
  const grouped: Record<string, number> = {}
  revenues.forEach((rev) => {
    const date = new Date(rev.created_at).toISOString().split('T')[0]
    grouped[date] = (grouped[date] || 0) + rev.amount
  })

  return Object.entries(grouped).map(([date, amount]) => ({
    date,
    revenue: amount,
  }))
}

export async function getRevenueStats() {
  const supabase = createClient()

  // Last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const currentMonth = new Date()
  currentMonth.setDate(1)

  const [last30Days, thisMonth] = await Promise.all([
    getRevenueSummary({
      from: thirtyDaysAgo,
      to: new Date(),
    }),
    getRevenueSummary({
      from: currentMonth,
      to: new Date(),
    }),
  ])

  return {
    last_30_days: last30Days,
    this_month: thisMonth,
  }
}

export async function getTopRoutes(limit: number = 5) {
  const supabase = createClient()
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('pickup_location, dropoff_location, fare')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error || !bookings) return []

  // Group by route
  const routes: Record<string, { count: number; total_fare: number }> = {}

  bookings.forEach((booking: any) => {
    const route = `${booking.pickup_location} → ${booking.dropoff_location}`
    if (!routes[route]) {
      routes[route] = { count: 0, total_fare: 0 }
    }
    routes[route].count += 1
    routes[route].total_fare += booking.fare || 0
  })

  return Object.entries(routes)
    .map(([route, data]) => ({
      route,
      bookings: data.count,
      total_revenue: data.total_fare,
      avg_fare: data.total_fare / data.count,
    }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, limit)
}

export async function getUserStats() {
  const supabase = createClient()

  const [riders, drivers] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact' }).eq('user_type', 'rider'),
    supabase.from('users').select('id', { count: 'exact' }).eq('user_type', 'driver'),
  ])

  return {
    total_riders: riders.count || 0,
    total_drivers: drivers.count || 0,
  }
}

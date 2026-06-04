import { createClient } from '@/lib/supabase/client'

export async function getRevenueStats() {
  const supabase = createClient()

  // Get today's revenue
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrowStart = new Date(today)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)

  // Get this week's revenue
  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - today.getDay())

  // Get this month's revenue
  const monthStart = new Date(today)
  monthStart.setDate(1)

  const [todayBookings, weekBookings, monthBookings] = await Promise.all([
    supabase
      .from('bookings')
      .select('estimated_price')
      .eq('status', 'delivered')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrowStart.toISOString()),
    supabase
      .from('bookings')
      .select('estimated_price')
      .eq('status', 'delivered')
      .gte('created_at', weekStart.toISOString())
      .lt('created_at', tomorrowStart.toISOString()),
    supabase
      .from('bookings')
      .select('estimated_price')
      .eq('status', 'delivered')
      .gte('created_at', monthStart.toISOString())
      .lt('created_at', tomorrowStart.toISOString()),
  ])

  const calculateTotal = (bookings: any[] | null) => {
    if (!bookings || !Array.isArray(bookings)) return 0
    return bookings.reduce((sum, b) => sum + (b.estimated_price || 0), 0) || 0
  }

  return {
    today: calculateTotal(todayBookings.data),
    this_week: calculateTotal(weekBookings.data),
    this_month: calculateTotal(monthBookings.data),
  }
}

export async function getRevenueChart() {
  const supabase = createClient()

  // Get last 7 days
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('created_at, estimated_price')
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (error || !bookings) return []

  // Group by date
  const grouped: Record<string, number> = {}
  bookings.forEach((b) => {
    const date = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    grouped[date] = (grouped[date] || 0) + (b.estimated_price || 0)
  })

  return Object.entries(grouped).map(([date, revenue]) => ({
    date,
    revenue,
  }))
}

export async function getBookingTrendChart() {
  const supabase = createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (error || !bookings) return []

  // Group by date
  const grouped: Record<string, number> = {}
  bookings.forEach((b) => {
    const date = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    grouped[date] = (grouped[date] || 0) + 1
  })

  return Object.entries(grouped).map(([date, count]) => ({
    date,
    bookings: count,
  }))
}

export async function getBookingStatusStats() {
  const supabase = createClient()

  const results = await Promise.all(
    [
      'request_received',
      'rider_assigned',
      'pickup_completed',
      'on_the_way',
      'delivered',
    ].map((status) =>
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', status),
    ),
  )

  return [
    { name: 'Request Received', value: results[0].count || 0, fill: '#f59e0b' },
    { name: 'Rider Assigned', value: results[1].count || 0, fill: '#3b82f6' },
    { name: 'Pickup Completed', value: results[2].count || 0, fill: '#6366f1' },
    { name: 'On The Way', value: results[3].count || 0, fill: '#f97316' },
    { name: 'Delivered', value: results[4].count || 0, fill: '#22c55e' },
  ]
}

export async function getUserStats() {
  const supabase = createClient()
  const { count, error } = await supabase.from('users').select('id', { count: 'exact' })

  if (error) {
    console.error('Error fetching user stats:', error)
    return { total_users: 0 }
  }

  return {
    total_users: count || 0,
  }
}

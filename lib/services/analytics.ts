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
      .eq('status', 'completed')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrowStart.toISOString()),
    supabase
      .from('bookings')
      .select('estimated_price')
      .eq('status', 'completed')
      .gte('created_at', weekStart.toISOString())
      .lt('created_at', tomorrowStart.toISOString()),
    supabase
      .from('bookings')
      .select('estimated_price')
      .eq('status', 'completed')
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

  const [completed, inProgress, pending, cancelled] = await Promise.all([
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'completed'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'in progress'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'cancelled'),
  ])

  return [
    { name: 'Completed', value: completed.count || 0, fill: '#22c55e' },
    { name: 'In Progress', value: inProgress.count || 0, fill: '#3b82f6' },
    { name: 'Pending', value: pending.count || 0, fill: '#eab308' },
    { name: 'Cancelled', value: cancelled.count || 0, fill: '#ef4444' },
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

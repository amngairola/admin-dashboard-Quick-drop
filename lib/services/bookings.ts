import { createClient } from '@/lib/supabase/client'

export interface Booking {
  id: string
  user_id: string
  service_type: string
  pickup_address: string
  drop_address: string
  phone: string
  notes: string
  status: 'pending' | 'accepted' | 'in progress' | 'completed' | 'cancelled'
  created_at: string
  pickup_lat?: number
  pickup_lng?: number
  drop_lat?: number
  drop_lng?: number
  distance_km?: number
  estimated_price: number
  payment_method: string
  otp?: string
}

export async function getBookings(filters?: {
  status?: string
  userId?: string
  search?: string
  dateRange?: { from: Date; to: Date }
}) {
  const supabase = createClient()
  let query = supabase.from('bookings').select('*').order('created_at', { ascending: false })

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId)
  }

  if (filters?.search) {
    query = query.or(
      `phone.ilike.%${filters.search}%,pickup_address.ilike.%${filters.search}%,drop_address.ilike.%${filters.search}%`
    )
  }

  if (filters?.dateRange) {
    query = query
      .gte('created_at', filters.dateRange.from.toISOString())
      .lte('created_at', filters.dateRange.to.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching bookings:', error)
    return []
  }

  return (data as Booking[]) || []
}

export async function getBookingById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from('bookings').select('*').eq('id', id).single()

  if (error) {
    console.error('Error fetching booking:', error)
    return null
  }

  return (data as Booking) || null
}

export async function updateBookingStatus(id: string, status: Booking['status']) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating booking status:', error)
    throw error
  }

  return (data as Booking) || null
}

export async function updateBooking(id: string, updates: Partial<Booking>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating booking:', error)
    throw error
  }

  return (data as Booking) || null
}

export async function cancelBooking(id: string) {
  return updateBookingStatus(id, 'cancelled')
}

export async function getRecentBookings(limit: number = 10) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent bookings:', error)
    return []
  }

  return (data as Booking[]) || []
}

export async function getBookingStats() {
  const supabase = createClient()

  const [completed, inProgress, pending, cancelled, allBookings] = await Promise.all([
    supabase.from('bookings').select('id, estimated_price', { count: 'exact' }).eq('status', 'completed'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'in progress'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'cancelled'),
    supabase.from('bookings').select('estimated_price'),
  ])

  const totalRevenue = (allBookings.data as any[])?.reduce((sum, b) => sum + (b.estimated_price || 0), 0) || 0

  return {
    total_completed: completed.count || 0,
    total_ongoing: inProgress.count || 0,
    total_pending: pending.count || 0,
    total_cancelled: cancelled.count || 0,
    total_revenue: totalRevenue,
  }
}

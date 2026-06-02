import { createClient } from '@/lib/supabase/client'

export interface Booking {
  id: string
  rider_id: string
  driver_id?: string
  pickup_location: string
  dropoff_location: string
  pickup_lat?: number
  pickup_lng?: number
  dropoff_lat?: number
  dropoff_lng?: number
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled'
  distance_km?: number
  duration_minutes?: number
  fare?: number
  payment_method: string
  created_at: string
  updated_at: string
}

export async function getBookings(filters?: {
  status?: string
  driverId?: string
  riderId?: string
  dateRange?: { from: Date; to: Date }
}) {
  const supabase = createClient()
  let query = supabase.from('bookings').select('*').order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.driverId) {
    query = query.eq('driver_id', filters.driverId)
  }

  if (filters?.riderId) {
    query = query.eq('rider_id', filters.riderId)
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

export async function assignDriver(bookingId: string, driverId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings')
    .update({
      driver_id: driverId,
      status: 'accepted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select()
    .single()

  if (error) {
    console.error('Error assigning driver:', error)
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

  const [completed, ongoing, pending, cancelled] = await Promise.all([
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'completed'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'ongoing'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'cancelled'),
  ])

  return {
    total_completed: completed.count || 0,
    total_ongoing: ongoing.count || 0,
    total_pending: pending.count || 0,
    total_cancelled: cancelled.count || 0,
  }
}

import { createClient } from '@/lib/supabase/client'

import type { BookingStatus } from '@/lib/types/booking'

export interface Booking {
  id: string
  user_id: string
  service_type: string
  pickup_address: string
  drop_address: string
  phone: string
  notes: string
  status: BookingStatus | string
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
      `id.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,pickup_address.ilike.%${filters.search}%,drop_address.ilike.%${filters.search}%`
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

export interface BookingWithCustomer extends Booking {
  customer_name?: string
  customer_email?: string
}

export async function getBookingsWithCustomer(filters?: {
  status?: string
  userId?: string
  search?: string
  dateRange?: { from: Date; to: Date }
}) {
  const supabase = createClient()
  let query = supabase
    .from('bookings')
    .select('*, users!bookings_user_id_fkey(name, email, avatar_url)')
    .order('created_at', { ascending: false })

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId)
  }

  if (filters?.search) {
    query = query.or(
      `id.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,pickup_address.ilike.%${filters.search}%,drop_address.ilike.%${filters.search}%`
    )
  }

  if (filters?.dateRange) {
    query = query
      .gte('created_at', filters.dateRange.from.toISOString())
      .lte('created_at', filters.dateRange.to.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching bookings with customer info:', error)
    return []
  }

  return (data as any[])?.map((booking: any) => ({
    ...booking,
    customer_name: booking.users?.name,
    customer_email: booking.users?.email,
  })) || []
}

export async function getBookingStats() {
  const supabase = createClient()

  const [total, pending, delivered, cancelled, allBookings] = await Promise.all([
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'request_received'),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'delivered'),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'cancelled'),
    supabase.from('bookings').select('estimated_price'),
  ])

  const totalRevenue =
    (allBookings.data as { estimated_price: number }[] | null)?.reduce(
      (sum, b) => sum + (b.estimated_price || 0),
      0,
    ) ?? 0

  return {
    total_bookings: total.count || 0,
    total_completed: delivered.count || 0,
    total_ongoing: 0,
    total_pending: pending.count || 0,
    total_cancelled: cancelled.count || 0,
    total_revenue: totalRevenue,
  }
}

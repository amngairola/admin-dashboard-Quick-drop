import { createClient } from '@/lib/supabase/server'
import type { BookingStatus } from '@/lib/types/booking'

export interface BookingRow {
  id: string
  user_id: string
  service_type: string
  pickup_address: string
  drop_address: string
  phone: string
  notes: string
  status: BookingStatus | string
  created_at: string
  pickup_lat?: number | null
  pickup_lng?: number | null
  drop_lat?: number | null
  drop_lng?: number | null
  distance_km?: number | null
  estimated_price: number
  payment_method: string
  otp?: string | null
  users?: {
    name: string | null
    email: string | null
    avatar_url?: string | null
  } | null
}

export interface BookingWithCustomer extends BookingRow {
  customer_name: string
  customer_email: string
}

function mapBooking(row: BookingRow): BookingWithCustomer {
  return {
    ...row,
    customer_name: row.users?.name ?? 'Unknown',
    customer_email: row.users?.email ?? '',
  }
}

export async function getAllBookingsWithUsers(): Promise<{
  bookings: BookingWithCustomer[]
  error: string | null
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bookings')
    .select('*, users!bookings_user_id_fkey(name, email, avatar_url)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getAllBookingsWithUsers]', error.message)
    return { bookings: [], error: error.message }
  }

  return {
    bookings: ((data as BookingRow[]) ?? []).map(mapBooking),
    error: null,
  }
}

export async function getRecentBookings(limit = 5): Promise<BookingWithCustomer[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bookings')
    .select('*, users!bookings_user_id_fkey(name, email, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[getRecentBookings]', error.message)
    return []
  }

  return ((data as BookingRow[]) ?? []).map(mapBooking)
}

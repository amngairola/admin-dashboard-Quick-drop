import { createClient } from '@/lib/supabase/client'

export interface User {
  id: string
  name: string
  email: string
  avatar_url?: string
  created_at: string
}

export async function getUsers(filters?: {
  search?: string
  limit?: number
}) {
  const supabase = createClient()
  let query = supabase.from('users').select('*').order('created_at', { ascending: false })

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    )
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return (data as User[]) || []
}

export async function getUserById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return (data as User) || null
}

export async function getBookingsCountByUser(userId: string) {
  const supabase = createClient()
  const { count, error } = await supabase
    .from('bookings')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching bookings count:', error)
    return 0
  }

  return count || 0
}

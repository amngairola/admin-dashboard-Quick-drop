import { createClient } from '@/lib/supabase/client'

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  profile_image_url?: string
  user_type: 'rider' | 'driver'
  is_verified: boolean
  is_active: boolean
  rating: number
  total_rides: number
  created_at: string
  updated_at: string
}

export async function getUsers(filters?: {
  userType?: 'rider' | 'driver'
  isVerified?: boolean
  search?: string
}) {
  const supabase = createClient()
  let query = supabase.from('users').select('*').order('created_at', { ascending: false })

  if (filters?.userType) {
    query = query.eq('user_type', filters.userType)
  }

  if (filters?.isVerified !== undefined) {
    query = query.eq('is_verified', filters.isVerified)
  }

  if (filters?.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    )
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

export async function updateUser(id: string, updates: Partial<User>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating user:', error)
    throw error
  }

  return (data as User) || null
}

export async function verifyUser(id: string) {
  return updateUser(id, { is_verified: true })
}

export async function deactivateUser(id: string) {
  return updateUser(id, { is_active: false })
}

export async function activateUser(id: string) {
  return updateUser(id, { is_active: true })
}

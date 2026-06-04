import { createClient } from '@/lib/supabase/server'

export interface AppUser {
  id: string
  name: string
  email: string
  avatar_url?: string | null
  created_at: string
}

export async function getAllUsers(): Promise<{ users: AppUser[]; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, avatar_url, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getAllUsers]', error.message)
    return { users: [], error: error.message }
  }

  return { users: (data as AppUser[]) ?? [], error: null }
}

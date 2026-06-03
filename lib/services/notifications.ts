import { createClient } from '@/lib/supabase/client'

export interface Notification {
  id: string
  user_id: string
  booking_id: string
  message: string
  type: 'booking_created' | 'booking_updated' | 'booking_completed' | 'booking_cancelled'
  is_read: boolean
  created_at: string
}

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .insert([notification])
    .select()
    .single()

  if (error) {
    console.error('Error creating notification:', error)
    throw error
  }

  return (data as Notification) || null
}

export async function getNotifications(userId: string, limit: number = 20) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return (data as Notification[]) || []
}

export async function getUnreadNotificationCount(userId: string) {
  const supabase = createClient()
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error('Error fetching unread notification count:', error)
    return 0
  }

  return count || 0
}

export async function getUnreadNotifications(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching unread notifications:', error)
    return []
  }

  return (data as Notification[]) || []
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single()

  if (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }

  return (data as Notification) || null
}

export async function markAllNotificationsAsRead(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error('Error marking all notifications as read:', error)
    throw error
  }

  return data
}

export async function deleteNotification(notificationId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) {
    console.error('Error deleting notification:', error)
    throw error
  }
}

export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
) {
  const supabase = createClient()

  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Notification)
      }
    )
    .subscribe()

  return () => {
    channel.unsubscribe()
  }
}

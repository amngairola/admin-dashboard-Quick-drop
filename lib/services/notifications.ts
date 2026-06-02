import { createClient } from '@/lib/supabase/client'

export interface Notification {
  id: string
  admin_id: string
  booking_id?: string
  title: string
  message: string
  type: 'booking' | 'user' | 'system'
  is_read: boolean
  created_at: string
}

export async function getNotifications(adminId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('admin_id', adminId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return (data as Notification[]) || []
}

export async function getUnreadNotifications(adminId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('admin_id', adminId)
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
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
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

export async function createNotification(
  adminId: string,
  notification: Omit<Notification, 'id' | 'admin_id' | 'is_read' | 'created_at'>
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      admin_id: adminId,
      ...notification,
      is_read: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating notification:', error)
    throw error
  }

  return (data as Notification) || null
}

export async function subscribeToNotifications(
  adminId: string,
  callback: (notification: Notification) => void
) {
  const supabase = createClient()

  const channel = supabase
    .channel(`notifications:${adminId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `admin_id=eq.${adminId}`,
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

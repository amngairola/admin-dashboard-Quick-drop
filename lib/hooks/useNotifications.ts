import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getNotifications, getUnreadNotifications, subscribeToNotifications, type Notification } from '@/lib/services/notifications'
import { toast } from 'sonner'

export function useNotifications() {
  const queryClient = useQueryClient()
  const [userId, setUserId] = useState<string | null>(null)

  // Get current user
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
      }
    })
  }, [])

  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => getNotifications(userId!),
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
  })
}

export function useUnreadNotifications() {
  const queryClient = useQueryClient()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
      }
    })
  }, [])

  return useQuery({
    queryKey: ['notifications:unread', userId],
    queryFn: () => getUnreadNotifications(userId!),
    enabled: !!userId,
    staleTime: 1000 * 15, // 15 seconds
  })
}

export function useNotificationSubscription() {
  const [userId, setUserId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
      }
    })
  }, [])

  useEffect(() => {
    if (!userId) return

    const handleNewNotification = (notification: Notification) => {
      // Show toast notification
      const messageMap: Record<string, string> = {
        booking_created: 'New booking received',
        booking_updated: 'Booking updated',
        booking_completed: 'Booking completed',
        booking_cancelled: 'Booking cancelled',
      }

      const message = messageMap[notification.type] || notification.message

      if (notification.type === 'booking_completed') {
        toast.success(message, { description: notification.message })
      } else if (notification.type === 'booking_cancelled') {
        toast.error(message, { description: notification.message })
      } else {
        toast.info(message, { description: notification.message })
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
      queryClient.invalidateQueries({ queryKey: ['notifications:unread', userId] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['bookings:stats'] })
    }

    // Subscribe to real-time notifications
    const unsubscribe = subscribeToNotifications(userId, handleNewNotification)

    return () => {
      unsubscribe()
    }
  }, [userId, queryClient])
}

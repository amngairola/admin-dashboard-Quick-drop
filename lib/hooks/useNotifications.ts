import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getNotifications, getUnreadNotifications } from '@/lib/services/notifications'

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

    const supabase = createClient()
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['bookings'] })
          queryClient.invalidateQueries({ queryKey: ['bookings:stats'] })
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [userId, queryClient])
}

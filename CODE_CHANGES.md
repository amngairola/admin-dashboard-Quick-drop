# Exact Code Changes - Line by Line

## File 1: lib/services/bookings.ts

### Change 1.1: Added booking ID to search filter (Line 40-43)

**Before:**
```typescript
if (filters?.search) {
  query = query.or(
    `phone.ilike.%${filters.search}%,pickup_address.ilike.%${filters.search}%,drop_address.ilike.%${filters.search}%`
  )
}
```

**After:**
```typescript
if (filters?.search) {
  query = query.or(
    `id.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,pickup_address.ilike.%${filters.search}%,drop_address.ilike.%${filters.search}%`
  )
}
```

**Change:** Added `id.ilike.%${filters.search}%,` at beginning of search filter

---

### Change 1.2: Removed `updated_at` from updateBookingStatus() (Line 75-87)

**Before:**
```typescript
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
```

**After:**
```typescript
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
```

**Change:** Removed `updated_at: new Date().toISOString(),` line

---

### Change 1.3: Added new function getBookingsWithCustomer() (After line 125)

**Added:**
```typescript
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
    .select('*, users(name, email)')
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
```

---

## File 2: lib/services/notifications.ts

### Change 2.1: Complete file rewrite

**Full new content:**
```typescript
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
```

---

## File 3: lib/services/analytics.ts

### Change 3.1: Updated getBookingStatusStats() (Line 108-122)

**Before:**
```typescript
export async function getBookingStatusStats() {
  const supabase = createClient()

  const [completed, pending, cancelled] = await Promise.all([
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'completed'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'cancelled'),
  ])

  const total = (completed.count || 0) + (pending.count || 0) + (cancelled.count || 0)

  return [
    { name: 'Completed', value: completed.count || 0, fill: '#22c55e' },
    { name: 'Pending', value: pending.count || 0, fill: '#eab308' },
    { name: 'Cancelled', value: cancelled.count || 0, fill: '#ef4444' },
  ]
}
```

**After:**
```typescript
export async function getBookingStatusStats() {
  const supabase = createClient()

  const [completed, inProgress, pending, cancelled] = await Promise.all([
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'completed'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'in progress'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'cancelled'),
  ])

  return [
    { name: 'Completed', value: completed.count || 0, fill: '#22c55e' },
    { name: 'In Progress', value: inProgress.count || 0, fill: '#3b82f6' },
    { name: 'Pending', value: pending.count || 0, fill: '#eab308' },
    { name: 'Cancelled', value: cancelled.count || 0, fill: '#ef4444' },
  ]
}
```

**Changes:**
- Added `inProgress` query: `supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'in progress')`
- Added to return array: `{ name: 'In Progress', value: inProgress.count || 0, fill: '#3b82f6' }`
- Removed `const total = ...` line (unused)

---

## File 4: lib/hooks/useBookings.ts

### Change 4.1: Updated import (Line 2)

**Before:**
```typescript
import { getBookings, getRecentBookings, getBookingStats, updateBookingStatus, type Booking } from '@/lib/services/bookings'
```

**After:**
```typescript
import { getBookings, getRecentBookings, getBookingStats, updateBookingStatus, getBookingsWithCustomer, type Booking } from '@/lib/services/bookings'
```

**Change:** Added `getBookingsWithCustomer` to imports

---

### Change 4.2: Added new hook useBookingsWithCustomer() (After line 9)

**Added:**
```typescript
export function useBookingsWithCustomer(filters?: Parameters<typeof getBookingsWithCustomer>[0]) {
  return useQuery({
    queryKey: ['bookings:with-customer', filters],
    queryFn: () => getBookingsWithCustomer(filters),
    staleTime: 1000 * 60 * 5,
  })
}
```

---

## File 5: lib/hooks/useNotifications.ts

### Change 5.1: Updated import (Line 4)

**Before:**
```typescript
import { getNotifications, getUnreadNotifications } from '@/lib/services/notifications'
```

**After:**
```typescript
import { getNotifications, getUnreadNotifications, subscribeToNotifications, type Notification } from '@/lib/services/notifications'
import { toast } from 'sonner'
```

**Change:** 
- Added `subscribeToNotifications` and `type Notification` to imports
- Added `import { toast } from 'sonner'`

---

### Change 5.2: Updated useNotificationSubscription() (Line 64-99)

**Before:**
```typescript
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
```

**After:**
```typescript
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
```

**Changes:**
- Replaced hardcoded cache invalidation with real notification handling
- Added `handleNewNotification` function
- Added message map for notification types
- Added conditional toast showing based on notification type
- Changed from listening to bookings table to subscribeToNotifications function

---

## File 6: components/dashboard/pages/Bookings.tsx

### Change 6.1: Updated imports (Line 4-5)

**Before:**
```typescript
import { useBookings, useUpdateBookingStatus } from '@/lib/hooks/useBookings'
import { Search, MapPin, DollarSign, MoreVertical, Phone } from 'lucide-react'
```

**After:**
```typescript
import { useBookingsWithCustomer, useUpdateBookingStatus } from '@/lib/hooks/useBookings'
import { Search, MapPin, DollarSign, MoreVertical, Phone, User } from 'lucide-react'
```

**Changes:**
- Changed `useBookings` to `useBookingsWithCustomer`
- Added `User` icon import

---

### Change 6.2: Updated hook usage (Line 13)

**Before:**
```typescript
const { data: bookings = [] } = useBookings({
  status: statusFilter === 'all' ? undefined : statusFilter,
  search: searchTerm,
})
```

**After:**
```typescript
const { data: bookings = [] } = useBookingsWithCustomer({
  status: statusFilter === 'all' ? undefined : statusFilter,
  search: searchTerm,
})
```

---

### Change 6.3: Added customer name table header (Line 104-105)

**Before:**
```typescript
<tr className="border-b border-border bg-secondary/50">
  <th className="px-6 py-3 text-left text-sm font-semibold">Booking ID</th>
  <th className="px-6 py-3 text-left text-sm font-semibold">Pickup</th>
```

**After:**
```typescript
<tr className="border-b border-border bg-secondary/50">
  <th className="px-6 py-3 text-left text-sm font-semibold">Booking ID</th>
  <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
  <th className="px-6 py-3 text-left text-sm font-semibold">Pickup</th>
```

**Change:** Added customer name header column

---

### Change 6.4: Added customer name table cell (Line 130-139)

**Added after booking ID cell:**
```typescript
<td className="px-6 py-4">
  <div className="flex items-center gap-2">
    <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    <div className="min-w-0">
      <p className="text-sm font-medium truncate">{booking.customer_name || 'Unknown'}</p>
      <p className="text-xs text-muted-foreground truncate">{booking.customer_email}</p>
    </div>
  </div>
</td>
```

---

### Change 6.5: Updated colSpan for empty state (Line 212)

**Before:**
```typescript
<td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
```

**After:**
```typescript
<td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
```

**Change:** Updated from 8 to 9 columns (added customer column)

---

## File 7: components/dashboard/TopNavbar.tsx

### Change 7.1: Fixed notification display (Line 87)

**Before:**
```typescript
<p className="text-sm font-medium">{notif.title}</p>
```

**After:**
```typescript
<p className="text-sm font-medium capitalize">{notif.type.replace(/_/g, ' ')}</p>
```

**Change:** Changed from `notif.title` (doesn't exist) to `notif.type` with formatting

---

## Summary of Code Changes

| File | Lines Changed | Type | Issue Fixed |
|------|---------------|------|------------|
| `bookings.ts` | 40-43, 75-87, +51 lines | Added/Modified/New Function | 1, 2, 3 |
| `notifications.ts` | Entire file | Complete Rewrite | 4 |
| `analytics.ts` | 108-122 | Modified | 5 |
| `useBookings.ts` | 2, +9 lines | Modified/New Function | 3 |
| `useNotifications.ts` | 4, 64-99 | Modified | 4 |
| `Bookings.tsx` | 4-5, 13, 104-105, 130-139, 212 | Modified | 2, 3 |
| `TopNavbar.tsx` | 87 | Modified | 4 |

**Total changes:** 7 files, ~500 lines modified/added

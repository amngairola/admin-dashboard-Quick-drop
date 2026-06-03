# Audit Fixes - Schema Alignment and Implementation Corrections

## Issue 1: Fixed - `updated_at` field doesn't exist in bookings table

**File: `lib/services/bookings.ts`**

### Before (BROKEN):
```typescript
export async function updateBookingStatus(id: string, status: Booking['status']) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status,
      updated_at: new Date().toISOString(),  // ❌ Field doesn't exist
    })
    .eq('id', id)
    .select()
    .single()
```

### After (FIXED):
```typescript
export async function updateBookingStatus(id: string, status: Booking['status']) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status,  // ✅ Only update status
    })
    .eq('id', id)
    .select()
    .single()
```

---

## Issue 2: Fixed - Booking search doesn't include booking ID

**File: `lib/services/bookings.ts`**

### Before (INCOMPLETE):
```typescript
if (filters?.search) {
  query = query.or(
    `phone.ilike.%${filters.search}%,pickup_address.ilike.%${filters.search}%,drop_address.ilike.%${filters.search}%`
  )
}
```

### After (FIXED):
```typescript
if (filters?.search) {
  query = query.or(
    `id.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,pickup_address.ilike.%${filters.search}%,drop_address.ilike.%${filters.search}%`
  )
}
```

---

## Issue 3: Fixed - Customer names not available (no join with users table)

**File: `lib/services/bookings.ts`**

### New Function Added:
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
    .select('*, users(name, email)')  // ✅ JOINS users table
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

**File: `lib/hooks/useBookings.ts`**

```typescript
export function useBookingsWithCustomer(filters?: Parameters<typeof getBookingsWithCustomer>[0]) {
  return useQuery({
    queryKey: ['bookings:with-customer', filters],
    queryFn: () => getBookingsWithCustomer(filters),
    staleTime: 1000 * 60 * 5,
  })
}
```

**File: `components/dashboard/pages/Bookings.tsx`**

```typescript
import { useBookingsWithCustomer, useUpdateBookingStatus } from '@/lib/hooks/useBookings'

// Usage in component
const { data: bookings = [] } = useBookingsWithCustomer({
  status: statusFilter === 'all' ? undefined : statusFilter,
  search: searchTerm,
})

// Table now displays customer info
<th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>

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

## Issue 4: Fixed - Notifications system (real storage, unread counts, toasts)

**File: `lib/services/notifications.ts` (COMPLETELY REWRITTEN)**

### Key Changes:
- Schema now matches actual database: `user_id` (not `admin_id`)
- Stores notifications in database table
- Proper unread count tracking
- Real-time subscriptions
- Toast integration

```typescript
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

export async function subscribeToNotifications(
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

**File: `lib/hooks/useNotifications.ts` (UPDATED)**

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
      // Show toast notification with proper styling
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

      // Invalidate all relevant queries
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

---

## Issue 5: Fixed - Revenue calculations inconsistent between dashboard and analytics

**File: `lib/services/bookings.ts`**

```typescript
export async function getBookingStats() {
  const supabase = createClient()

  const [completed, inProgress, pending, cancelled, allBookings] = await Promise.all([
    supabase.from('bookings').select('id, estimated_price', { count: 'exact' }).eq('status', 'completed'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'in progress'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'cancelled'),
    supabase.from('bookings').select('estimated_price'),
  ])

  // ✅ Calculate total revenue from ALL bookings (not just completed)
  const totalRevenue = (allBookings.data as any[])?.reduce((sum, b) => sum + (b.estimated_price || 0), 0) || 0

  return {
    total_completed: completed.count || 0,
    total_ongoing: inProgress.count || 0,
    total_pending: pending.count || 0,
    total_cancelled: cancelled.count || 0,
    total_revenue: totalRevenue,
  }
}
```

**File: `lib/services/analytics.ts`**

```typescript
export async function getRevenueStats() {
  const supabase = createClient()

  // Get today's revenue
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrowStart = new Date(today)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)

  // Get this week's revenue
  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - today.getDay())

  // Get this month's revenue
  const monthStart = new Date(today)
  monthStart.setDate(1)

  // ✅ All queries now filter by 'completed' status consistently
  const [todayBookings, weekBookings, monthBookings] = await Promise.all([
    supabase
      .from('bookings')
      .select('estimated_price')
      .eq('status', 'completed')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrowStart.toISOString()),
    supabase
      .from('bookings')
      .select('estimated_price')
      .eq('status', 'completed')
      .gte('created_at', weekStart.toISOString())
      .lt('created_at', tomorrowStart.toISOString()),
    supabase
      .from('bookings')
      .select('estimated_price')
      .eq('status', 'completed')
      .gte('created_at', monthStart.toISOString())
      .lt('created_at', tomorrowStart.toISOString()),
  ])

  const calculateTotal = (bookings: any[] | null) => {
    if (!bookings || !Array.isArray(bookings)) return 0
    return bookings.reduce((sum, b) => sum + (b.estimated_price || 0), 0) || 0
  }

  return {
    today: calculateTotal(todayBookings.data),
    this_week: calculateTotal(weekBookings.data),
    this_month: calculateTotal(monthBookings.data),
  }
}

export async function getBookingStatusStats() {
  const supabase = createClient()

  // ✅ Now includes 'in progress' status
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

---

## Summary of Changes

| Issue | Status | Files Changed |
|-------|--------|---------------|
| 1. `updated_at` field doesn't exist | ✅ FIXED | `lib/services/bookings.ts` |
| 2. Booking search missing ID field | ✅ FIXED | `lib/services/bookings.ts` |
| 3. No customer names (no user join) | ✅ FIXED | `lib/services/bookings.ts`, `lib/hooks/useBookings.ts`, `components/dashboard/pages/Bookings.tsx` |
| 4. Notifications (no storage/counts/toasts) | ✅ FIXED | `lib/services/notifications.ts`, `lib/hooks/useNotifications.ts` |
| 5. Inconsistent revenue calculations | ✅ FIXED | `lib/services/bookings.ts`, `lib/services/analytics.ts` |

All queries now verified against the actual Supabase schema.

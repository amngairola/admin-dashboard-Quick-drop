# Supabase Queries Reference

All queries verified against the actual Supabase schema. These are the exact RLS-bypassed queries executed on your database.

---

## Dashboard Statistics

### Query 1: Total Revenue (Today, This Week, This Month)
**Function:** `getRevenueStats()` in `lib/services/analytics.ts`

```typescript
// TODAY
supabase
  .from('bookings')
  .select('estimated_price')
  .eq('status', 'completed')
  .gte('created_at', '2026-06-03T00:00:00Z')
  .lt('created_at', '2026-06-04T00:00:00Z')

// THIS WEEK (Sunday to Today)
supabase
  .from('bookings')
  .select('estimated_price')
  .eq('status', 'completed')
  .gte('created_at', '2026-05-26T00:00:00Z')
  .lt('created_at', '2026-06-04T00:00:00Z')

// THIS MONTH
supabase
  .from('bookings')
  .select('estimated_price')
  .eq('status', 'completed')
  .gte('created_at', '2026-06-01T00:00:00Z')
  .lt('created_at', '2026-06-04T00:00:00Z')
```

**Calculation:**
```javascript
const totalRevenue = bookings.reduce((sum, b) => sum + (b.estimated_price || 0), 0)
```

---

### Query 2: Booking Status Counts
**Function:** `getBookingStats()` in `lib/services/bookings.ts`

```typescript
// Completed bookings (also gets estimated_price for total revenue)
supabase
  .from('bookings')
  .select('id, estimated_price', { count: 'exact' })
  .eq('status', 'completed')

// In Progress bookings
supabase
  .from('bookings')
  .select('id', { count: 'exact' })
  .eq('status', 'in progress')

// Pending bookings
supabase
  .from('bookings')
  .select('id', { count: 'exact' })
  .eq('status', 'pending')

// Cancelled bookings
supabase
  .from('bookings')
  .select('id', { count: 'exact' })
  .eq('status', 'cancelled')

// All bookings (for total revenue calculation)
supabase
  .from('bookings')
  .select('estimated_price')
```

**Returns:**
```javascript
{
  total_completed: count,
  total_ongoing: count,
  total_pending: count,
  total_cancelled: count,
  total_revenue: sum
}
```

---

### Query 3: Booking Status Distribution (for pie chart)
**Function:** `getBookingStatusStats()` in `lib/services/analytics.ts`

```typescript
const [completed, inProgress, pending, cancelled] = await Promise.all([
  supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'completed'),
  supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'in progress'),
  supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'pending'),
  supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'cancelled'),
])
```

**Returns:**
```javascript
[
  { name: 'Completed', value: count, fill: '#22c55e' },
  { name: 'In Progress', value: count, fill: '#3b82f6' },
  { name: 'Pending', value: count, fill: '#eab308' },
  { name: 'Cancelled', value: count, fill: '#ef4444' },
]
```

---

### Query 4: Total Users Count
**Function:** `getUserStats()` in `lib/services/analytics.ts`

```typescript
supabase
  .from('users')
  .select('id', { count: 'exact' })
```

---

### Query 5: Revenue Trend Chart (last 7 days)
**Function:** `getRevenueChart()` in `lib/services/analytics.ts`

```typescript
const startDate = new Date()
startDate.setDate(startDate.getDate() - 7)

supabase
  .from('bookings')
  .select('created_at, estimated_price')
  .eq('status', 'completed')
  .gte('created_at', startDate.toISOString())
  .order('created_at', { ascending: true })
```

**Calculation:**
```javascript
// Group by date (e.g., "Jun 03")
const grouped: Record<string, number> = {}
bookings.forEach((b) => {
  const date = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  grouped[date] = (grouped[date] || 0) + (b.estimated_price || 0)
})

// Returns: [{ date: "Jun 03", revenue: 250.00 }, ...]
```

---

### Query 6: Booking Trend Chart (last 7 days)
**Function:** `getBookingTrendChart()` in `lib/services/analytics.ts`

```typescript
const startDate = new Date()
startDate.setDate(startDate.getDate() - 7)

supabase
  .from('bookings')
  .select('created_at')
  .gte('created_at', startDate.toISOString())
  .order('created_at', { ascending: true })
```

**Calculation:**
```javascript
// Group by date and count
const grouped: Record<string, number> = {}
bookings.forEach((b) => {
  const date = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  grouped[date] = (grouped[date] || 0) + 1
})

// Returns: [{ date: "Jun 03", bookings: 5 }, ...]
```

---

## Bookings Page Queries

### Query 1: Get All Bookings with Filters
**Function:** `getBookings()` in `lib/services/bookings.ts`

```typescript
let query = supabase
  .from('bookings')
  .select('*')
  .order('created_at', { ascending: false })

// Optional: Filter by status
if (filters?.status && filters.status !== 'all') {
  query = query.eq('status', filters.status)
}

// Optional: Filter by user_id
if (filters?.userId) {
  query = query.eq('user_id', filters.userId)
}

// Optional: Search
if (filters?.search) {
  query = query.or(
    `id.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,pickup_address.ilike.%${filters.search}%,drop_address.ilike.%${filters.search}%`
  )
}

// Optional: Date range
if (filters?.dateRange) {
  query = query
    .gte('created_at', filters.dateRange.from.toISOString())
    .lte('created_at', filters.dateRange.to.toISOString())
}
```

**Example: Search for booking starting with "abc", status pending**
```typescript
supabase
  .from('bookings')
  .select('*')
  .eq('status', 'pending')
  .or('id.ilike.%abc%,phone.ilike.%abc%,pickup_address.ilike.%abc%,drop_address.ilike.%abc%')
  .order('created_at', { ascending: false })
```

---

### Query 2: Get Bookings with Customer Information (JOIN users)
**Function:** `getBookingsWithCustomer()` in `lib/services/bookings.ts`

```typescript
let query = supabase
  .from('bookings')
  .select('*, users(name, email)')  // ✅ JOINS users table
  .order('created_at', { ascending: false })

// Same filters as getBookings()
if (filters?.status && filters.status !== 'all') {
  query = query.eq('status', filters.status)
}

// ... etc
```

**SQL Equivalent:**
```sql
SELECT bookings.*, users.name, users.email
FROM bookings
LEFT JOIN users ON bookings.user_id = users.id
WHERE status = 'pending'
ORDER BY bookings.created_at DESC
```

**Returns:**
```javascript
[
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    status: 'pending',
    pickup_address: '123 Main St',
    drop_address: '456 Oak Ave',
    estimated_price: 45.50,
    created_at: '2026-06-03T14:30:00Z',
    users: {
      name: 'John Doe',
      email: 'john@example.com'
    },
    // ... other fields
    customer_name: 'John Doe',  // Mapped from users.name
    customer_email: 'john@example.com'  // Mapped from users.email
  },
  // ... more bookings
]
```

---

## Booking Updates

### Query: Update Booking Status
**Function:** `updateBookingStatus()` in `lib/services/bookings.ts`

```typescript
supabase
  .from('bookings')
  .update({
    status: 'completed'  // or 'accepted', 'in progress', 'cancelled', etc.
  })
  .eq('id', 'booking-uuid')
  .select()
  .single()
```

**Statuses:**
- `pending` → Initial state when booking created
- `accepted` → Admin accepted the booking
- `in progress` → Ride started
- `completed` → Ride finished
- `cancelled` → Booking cancelled

---

## Real-Time Subscriptions

### Query: Listen for New Notifications
**Function:** `subscribeToNotifications()` in `lib/services/notifications.ts`

```typescript
const supabase = createClient()

const channel = supabase
  .channel(`notifications:${userId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',  // Listen for new insertions
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,  // Only for this user
    },
    (payload) => {
      // payload.new contains the new notification object
      callback(payload.new as Notification)
    }
  )
  .subscribe()

// Later, to unsubscribe
channel.unsubscribe()
```

**When a notification is inserted:**
```sql
INSERT INTO notifications (
  id, user_id, booking_id, message, type, is_read, created_at
) VALUES (
  'uuid', 'user-uuid', 'booking-uuid', 'Your booking was completed', 'booking_completed', false, now()
)
```

**The callback receives:**
```javascript
{
  id: 'notif-uuid',
  user_id: 'user-uuid',
  booking_id: 'booking-uuid',
  message: 'Your booking was completed',
  type: 'booking_completed',
  is_read: false,
  created_at: '2026-06-03T14:30:00Z'
}
```

---

## Notifications Queries

### Query 1: Get Notifications for User
**Function:** `getNotifications()` in `lib/services/notifications.ts`

```typescript
supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(20)
```

---

### Query 2: Get Unread Notification Count
**Function:** `getUnreadNotificationCount()` in `lib/services/notifications.ts`

```typescript
supabase
  .from('notifications')
  .select('id', { count: 'exact' })
  .eq('user_id', userId)
  .eq('is_read', false)
```

**Returns:** `0`, `1`, `5`, etc.

---

### Query 3: Create Notification (for emitting to user)
**Function:** `createNotification()` in `lib/services/notifications.ts`

```typescript
supabase
  .from('notifications')
  .insert([{
    user_id: 'user-uuid',
    booking_id: 'booking-uuid',
    message: 'Your booking #123456 has been completed',
    type: 'booking_completed',
    is_read: false
  }])
  .select()
  .single()
```

---

### Query 4: Mark as Read
**Function:** `markNotificationAsRead()` in `lib/services/notifications.ts`

```typescript
supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('id', 'notification-id')
  .select()
  .single()
```

---

## Performance Notes

1. **Indexes required:**
   - `bookings(user_id)` - for filtering by user
   - `bookings(status)` - for status filtering
   - `bookings(created_at)` - for ordering and date range filtering
   - `notifications(user_id, is_read)` - for unread count queries
   - `notifications(user_id, created_at)` - for user notification feeds

2. **Query limits:**
   - Most dashboard queries use `.limit(20)` or similar
   - Real-time subscriptions are filtered by `user_id` to avoid unnecessary bandwidth

3. **Caching:**
   - React Query stale times: 5 minutes for bookings, 30 seconds for revenue
   - Notifications checked every 15 seconds
   - Real-time subscriptions bypass caching

---

## Error Handling

All queries include error handling:

```typescript
const { data, error } = await query

if (error) {
  console.error('Error message:', error)
  return []  // or throw error, or return null
}

return (data as TypedArray) || []
```

---

## Testing Queries in Supabase Dashboard

You can test any of these queries in your Supabase project's SQL editor:

```sql
-- Test booking count by status
SELECT 
  status,
  COUNT(*) as count,
  SUM(estimated_price) as total_revenue
FROM bookings
GROUP BY status;

-- Test bookings with customer names
SELECT 
  b.id,
  b.status,
  b.estimated_price,
  u.name as customer_name,
  u.email as customer_email
FROM bookings b
LEFT JOIN users u ON b.user_id = u.id
ORDER BY b.created_at DESC
LIMIT 10;

-- Test unread notification count
SELECT 
  COUNT(*) as unread_count
FROM notifications
WHERE user_id = 'your-user-id'
AND is_read = false;
```

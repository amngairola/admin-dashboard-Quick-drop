import { Suspense } from 'react'
import BookingsClient from '@/components/dashboard/pages/BookingsClient'
import { getAllBookingsWithUsers } from '@/lib/services/server/bookings'

export const dynamic = 'force-dynamic'

function BookingsTableSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-8 w-48 bg-secondary/60 rounded animate-pulse" />
      <div className="h-10 bg-secondary/60 rounded animate-pulse" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 bg-secondary/60 rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
}

async function BookingsContent() {
  const { bookings, error } = await getAllBookingsWithUsers()
  return (
    <Suspense fallback={<BookingsTableSkeleton />}>
      <BookingsClient initialBookings={bookings} fetchError={error} />
    </Suspense>
  )
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<BookingsTableSkeleton />}>
      <BookingsContent />
    </Suspense>
  )
}

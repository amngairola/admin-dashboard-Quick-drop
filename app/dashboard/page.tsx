import DashboardClient from '@/components/dashboard/pages/DashboardClient'
import { getDashboardStats } from '@/lib/services/server/dashboard'
import { getRecentBookings } from '@/lib/services/server/bookings'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [stats, recentBookings] = await Promise.all([getDashboardStats(), getRecentBookings(5)])

  return <DashboardClient stats={stats} recentBookings={recentBookings} />
}

'use client'

import { motion } from 'framer-motion'
import StatsCard from '../components/StatsCard'
import TrendChart from '../components/TrendChart'
import RecentActivity from '../components/RecentActivity'
import { useBookingStats } from '@/lib/hooks/useBookings'
import { useUserStats } from '@/lib/hooks/useAnalytics'
import { useRecentBookings } from '@/lib/hooks/useBookings'
import { TrendingUp, Users, MapPin, DollarSign, Activity, Clock } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
}

export default function Dashboard() {
  const { data: bookingStats, isLoading: statsLoading } = useBookingStats()
  const { data: userStats, isLoading: usersLoading } = useUserStats()
  const { data: recentBookings = [] } = useRecentBookings(5)

  const stats = [
    {
      title: 'Total Bookings',
      value: bookingStats ? bookingStats.total_completed : 0,
      icon: Activity,
      color: 'text-blue-500',
      trend: '+12% from last week',
    },
    {
      title: 'Total Revenue',
      value: '$12,450',
      icon: DollarSign,
      color: 'text-green-500',
      trend: '+8% from last week',
    },
    {
      title: 'Active Users',
      value: userStats ? (userStats.total_riders + userStats.total_drivers).toString() : 0,
      icon: Users,
      color: 'text-purple-500',
      trend: `${userStats?.total_drivers || 0} drivers, ${userStats?.total_riders || 0} riders`,
    },
    {
      title: 'Pending Bookings',
      value: bookingStats?.total_pending || 0,
      icon: Clock,
      color: 'text-yellow-500',
      trend: 'Awaiting driver assignment',
    },
    {
      title: 'Completed Today',
      value: bookingStats?.total_completed || 0,
      icon: TrendingUp,
      color: 'text-emerald-500',
      trend: '98% completion rate',
    },
    {
      title: 'Avg Rating',
      value: '4.8',
      icon: MapPin,
      color: 'text-orange-500',
      trend: 'Based on 2,345 rides',
    },
  ]

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome back, Admin</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your service today</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div key={index} variants={item}>
            <StatsCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <TrendChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-card rounded-lg border border-border p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Booking Status Distribution</h2>
          <div className="space-y-4">
            {[
              {
                label: 'Completed',
                value: bookingStats?.total_completed || 0,
                percentage: 65,
                color: 'bg-green-500',
              },
              {
                label: 'Ongoing',
                value: bookingStats?.total_ongoing || 0,
                percentage: 20,
                color: 'bg-blue-500',
              },
              {
                label: 'Pending',
                value: bookingStats?.total_pending || 0,
                percentage: 10,
                color: 'bg-yellow-500',
              },
              {
                label: 'Cancelled',
                value: bookingStats?.total_cancelled || 0,
                percentage: 5,
                color: 'bg-red-500',
              },
            ].map((status, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{status.label}</span>
                  <span className="text-sm text-muted-foreground">{status.value}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className={`${status.color} h-2 rounded-full`} style={{ width: `${status.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <RecentActivity bookings={recentBookings} />
      </motion.div>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import StatsCard from '../components/StatsCard'
import TrendChart from '../components/TrendChart'
import RecentActivity from '../components/RecentActivity'
import { useBookingStats } from '@/lib/hooks/useBookings'
import { useUserStats, useRevenueStats } from '@/lib/hooks/useAnalytics'
import { useRecentBookings } from '@/lib/hooks/useBookings'
import { TrendingUp, Users, MapPin, DollarSign, Activity, Clock } from 'lucide-react'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

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
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
}

export default function Dashboard() {
  const { data: bookingStats, isLoading: statsLoading } = useBookingStats()
  const { data: userStats, isLoading: usersLoading } = useUserStats()
  const { data: revenueStats } = useRevenueStats()
  const { data: recentBookings = [] } = useRecentBookings(5)

  const stats = [
    {
      title: 'Total Users',
      value: (userStats?.total_users || 0).toString(),
      icon: Users,
      color: 'text-purple-500',
      change: 'Registered users',
    },
    {
      title: 'Total Bookings',
      value: ((bookingStats?.total_completed || 0) + (bookingStats?.total_ongoing || 0) + (bookingStats?.total_pending || 0)).toString(),
      icon: Activity,
      color: 'text-blue-500',
      change: 'All time',
    },
    {
      title: 'Pending Bookings',
      value: (bookingStats?.total_pending || 0).toString(),
      icon: Clock,
      color: 'text-yellow-500',
      change: 'Awaiting action',
    },
    {
      title: 'Completed Bookings',
      value: (bookingStats?.total_completed || 0).toString(),
      icon: TrendingUp,
      color: 'text-emerald-500',
      change: 'Successfully done',
    },
    {
      title: 'Cancelled Bookings',
      value: (bookingStats?.total_cancelled || 0).toString(),
      icon: MapPin,
      color: 'text-red-500',
      change: 'Cancelled orders',
    },
    {
      title: 'Total Revenue',
      value: `$${(bookingStats?.total_revenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-500',
      change: 'From all bookings',
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
              change={stat.change}
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
                color: 'bg-green-500',
              },
              {
                label: 'In Progress',
                value: bookingStats?.total_ongoing || 0,
                color: 'bg-blue-500',
              },
              {
                label: 'Pending',
                value: bookingStats?.total_pending || 0,
                color: 'bg-yellow-500',
              },
              {
                label: 'Cancelled',
                value: bookingStats?.total_cancelled || 0,
                color: 'bg-red-500',
              },
            ].map((status, idx) => {
              const total = (bookingStats?.total_completed || 0) + (bookingStats?.total_ongoing || 0) + (bookingStats?.total_pending || 0) + (bookingStats?.total_cancelled || 0)
              const percentage = total > 0 ? (status.value / total) * 100 : 0
              return (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{status.label}</span>
                    <span className="text-sm text-muted-foreground">{status.value}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className={`${status.color} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
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

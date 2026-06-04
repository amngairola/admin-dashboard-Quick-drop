'use client'

import { motion } from 'framer-motion'
import StatsCard from '../components/StatsCard'
import TrendChart from '../components/TrendChart'
import RecentActivity from '../components/RecentActivity'
import type { DashboardStats } from '@/lib/services/server/dashboard'
import type { BookingWithCustomer } from '@/lib/services/server/bookings'
import { BOOKING_STATUS_DISTRIBUTION } from '@/lib/types/booking'
import { TrendingUp, Users, MapPin, IndianRupee, Activity, Clock, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
}

interface DashboardClientProps {
  stats: DashboardStats
  recentBookings: BookingWithCustomer[]
}

export default function DashboardClient({ stats, recentBookings }: DashboardClientProps) {
  const distributionTotal = BOOKING_STATUS_DISTRIBUTION.reduce(
    (sum, { status }) => sum + (stats.status_counts[status] ?? 0),
    0,
  )

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total_users.toString(),
      icon: Users,
      color: 'text-purple-500',
      change: 'Registered users',
      href: '/dashboard/users',
    },
    {
      title: 'Total Bookings',
      value: stats.total_bookings.toString(),
      icon: Activity,
      color: 'text-blue-500',
      change: 'All time',
      href: '/dashboard/bookings',
    },
    {
      title: 'Pending Bookings',
      value: stats.pending_bookings.toString(),
      icon: Clock,
      color: 'text-yellow-500',
      change: 'Request received',
      href: '/dashboard/bookings?status=request_received',
    },
    {
      title: 'Completed Bookings',
      value: stats.completed_bookings.toString(),
      icon: TrendingUp,
      color: 'text-emerald-500',
      change: 'Delivered',
      href: '/dashboard/bookings?status=delivered',
    },
    {
      title: 'Cancelled Bookings',
      value: stats.cancelled_bookings.toString(),
      icon: XCircle,
      color: 'text-red-500',
      change: stats.cancelled_bookings === 0 ? 'No cancelled status' : 'Cancelled orders',
      href: '/dashboard/bookings?status=cancelled',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.total_revenue),
      icon: IndianRupee,
      color: 'text-green-500',
      change: 'From all bookings',
      href: '/dashboard/bookings',
    },
  ]

  return (
    <div className="p-6 space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome back, Admin</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your service today</p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {statCards.map((stat, index) => (
          <motion.div key={stat.title} variants={item}>
            <StatsCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              change={stat.change}
              href={stat.href}
            />
          </motion.div>
        ))}
      </motion.div>

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
            {BOOKING_STATUS_DISTRIBUTION.map(({ status, label, color }) => {
              const value = stats.status_counts[status] ?? 0
              const percentage = distributionTotal > 0 ? (value / distributionTotal) * 100 : 0
              return (
                <div key={status}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-sm text-muted-foreground">{value}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

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

'use client'

import { motion } from 'framer-motion'
import StatsCard from '../components/StatsCard'
import TrendChart from '../components/TrendChart'
import RecentActivity from '../components/RecentActivity'
import { TrendingUp, MapPin, DollarSign, Activity, Calendar } from 'lucide-react'

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
        <motion.div variants={item}>
          <StatsCard
            title="Total Bookings"
            value="2,453"
            change="+12.5%"
            icon={Calendar}
            color="bg-chart-1"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Revenue"
            value="$24,580"
            change="+8.2%"
            icon={DollarSign}
            color="bg-chart-2"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Active Users"
            value="1,829"
            change="+5.1%"
            icon={TrendingUp}
            color="bg-chart-3"
          />
        </motion.div>
      </motion.div>

      {/* Additional Stats Row */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={item}>
          <StatsCard
            title="Active Drivers"
            value="456"
            change="+3.2%"
            icon={Activity}
            color="bg-chart-4"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Completed Rides"
            value="8,421"
            change="+15.3%"
            icon={TrendingUp}
            color="bg-chart-5"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Avg Rating"
            value="4.8"
            change="+0.3"
            icon={MapPin}
            color="bg-accent"
          />
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 30 }}
          className="lg:col-span-2"
        >
          <TrendChart />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 30 }}
        >
          <RecentActivity />
        </motion.div>
      </div>
    </div>
  )
}

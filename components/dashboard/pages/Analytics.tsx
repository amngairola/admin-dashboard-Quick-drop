'use client'

import { motion } from 'framer-motion'
import { useRevenueStats, useUserStats } from '@/lib/hooks/useAnalytics'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import DashboardPageHeader from '../DashboardPageHeader'

export default function Analytics() {
  const { data: revenueStats } = useRevenueStats()
  const { data: userStats } = useUserStats()
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <DashboardPageHeader
          title="Analytics"
          description="In-depth metrics and insights"
          breadcrumb="Analytics"
        />
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { label: 'Revenue Today', value: formatCurrency(revenueStats?.today || 0, 0), change: 'Today' },
          { label: 'This Week', value: formatCurrency(revenueStats?.this_week || 0, 0), change: 'Last 7 days' },
          { label: 'This Month', value: formatCurrency(revenueStats?.this_month || 0, 0), change: 'Current month' },
          { label: 'Total Users', value: userStats?.total_users || 0, change: 'Registered' },
        ].map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
            <h3 className="text-2xl font-bold">{metric.value}</h3>
            <p className="text-xs text-accent mt-2">{metric.change}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Revenue Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Revenue Summary</h3>
            <p className="text-sm text-muted-foreground mt-1">Last 30 days vs This month</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Today</span>
                <span className="text-sm font-bold">{formatCurrency(revenueStats?.today || 0)}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: '40%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">This Week</span>
                <span className="text-sm font-bold">{formatCurrency(revenueStats?.this_week || 0)}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">This Month</span>
                <span className="text-sm font-bold">{formatCurrency(revenueStats?.this_month || 0)}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
        <div className="space-y-3">
          {[
            'Rides peak between 5-7 PM on weekdays with 35% more bookings',
            'Premium service tier shows 28% of revenue despite being 15% of rides',
            'Average ride rating is 4.8/5.0, up from 4.5 last month',
            'Driver retention rate improved to 82% with new incentive program',
          ].map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex gap-3 p-3 bg-secondary/50 rounded-lg"
            >
              <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />
              <p className="text-sm">{insight}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { useRevenueStats, useTopRoutes, useUserStats } from '@/lib/hooks/useAnalytics'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts'

export default function Analytics() {
  const { data: revenueStats } = useRevenueStats()
  const { data: topRoutes = [] } = useTopRoutes()
  const { data: userStats } = useUserStats()

  const routeData = topRoutes.slice(0, 7).map((route) => ({
    name: route.route.substring(0, 20),
    revenue: route.total_revenue,
  }))
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">In-depth metrics and insights</p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { label: 'Total Revenue', value: `$${(revenueStats?.this_month?.total_revenue || 0).toFixed(0)}`, change: 'This Month' },
          { label: 'Total Riders', value: userStats?.total_riders || 0, change: 'Active Users' },
          { label: 'Total Drivers', value: userStats?.total_drivers || 0, change: 'Available' },
          { label: 'Avg Fare', value: `$${(revenueStats?.this_month?.average_fare || 0).toFixed(2)}`, change: 'Per Ride' },
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Routes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Top Routes</h3>
            <p className="text-sm text-muted-foreground mt-1">By revenue</p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={routeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
              <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Bar dataKey="revenue" fill="var(--chart-1)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

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
                <span className="text-sm font-medium">Total Revenue</span>
                <span className="text-sm font-bold">${(revenueStats?.this_month?.total_revenue || 0).toFixed(2)}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Commission</span>
                <span className="text-sm font-bold">${(revenueStats?.this_month?.total_commission || 0).toFixed(2)}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Net Revenue</span>
                <span className="text-sm font-bold">${(revenueStats?.this_month?.net_revenue || 0).toFixed(2)}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }} />
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

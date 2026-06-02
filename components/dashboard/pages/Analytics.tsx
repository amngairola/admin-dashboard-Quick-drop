'use client'

import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const revenueByCategory = [
  { name: 'Regular', value: 45, fill: '#488f47' },
  { name: 'Premium', value: 28, fill: '#7c3aed' },
  { name: 'Business', value: 27, fill: '#3b82f6' },
]

const rideDistribution = [
  { month: 'Mon', rides: 240, revenue: 2400 },
  { month: 'Tue', rides: 320, revenue: 2800 },
  { month: 'Wed', rides: 280, revenue: 2400 },
  { month: 'Thu', rides: 390, revenue: 3500 },
  { month: 'Fri', rides: 450, revenue: 4000 },
  { month: 'Sat', rides: 520, revenue: 4600 },
  { month: 'Sun', rides: 380, revenue: 3400 },
]

export default function Analytics() {
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
          { label: 'Avg Ride Duration', value: '18.5 min', change: '+2.3%' },
          { label: 'Avg Rating', value: '4.8', change: '+0.2' },
          { label: 'Cancellation Rate', value: '2.5%', change: '-0.8%' },
          { label: 'Peak Hour', value: '6 PM', change: 'Consistent' },
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
        {/* Weekly Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Weekly Distribution</h3>
            <p className="text-sm text-muted-foreground mt-1">Rides and revenue by day</p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rideDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
              <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Bar dataKey="rides" fill="var(--chart-1)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Revenue Distribution</h3>
            <p className="text-sm text-muted-foreground mt-1">By service type</p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={revenueByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                {revenueByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex gap-4 justify-center mt-6 flex-wrap">
            {revenueByCategory.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-xs text-muted-foreground">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
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

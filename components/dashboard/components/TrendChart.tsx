'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useRevenueChart, useBookingTrendChart } from '@/lib/hooks/useAnalytics'

export default function TrendChart() {
  const { data: revenueData = [] } = useRevenueChart()
  const { data: bookingData = [] } = useBookingTrendChart()

  // Merge data by date
  const mergedData = revenueData.map((rev) => ({
    date: rev.date,
    revenue: rev.revenue,
    bookings: bookingData.find((b) => b.date === rev.date)?.bookings || 0,
  }))

  const displayData = mergedData.length > 0 ? mergedData : []

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Bookings & Revenue Trend</h3>
        <p className="text-sm text-muted-foreground mt-1">Last 7 days</p>
      </div>
      
      {displayData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={displayData}>
            <defs>
              <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
            <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
              labelStyle={{ color: 'var(--foreground)' }}
            />
            <Legend />
            <Area type="monotone" dataKey="bookings" stroke="var(--chart-1)" fillOpacity={1} fill="url(#colorBookings)" />
            <Area type="monotone" dataKey="revenue" stroke="var(--chart-2)" fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-72 flex items-center justify-center text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  )
}

'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'

const data = [
  { month: 'Jan', bookings: 400, revenue: 2400, drivers: 240 },
  { month: 'Feb', bookings: 520, revenue: 2800, drivers: 300 },
  { month: 'Mar', bookings: 680, revenue: 3200, drivers: 380 },
  { month: 'Apr', bookings: 750, revenue: 3500, drivers: 420 },
  { month: 'May', bookings: 890, revenue: 4100, drivers: 500 },
  { month: 'Jun', bookings: 950, revenue: 4400, drivers: 540 },
]

export default function TrendChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Bookings & Revenue Trend</h3>
        <p className="text-sm text-muted-foreground mt-1">Last 6 months performance</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
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
          <XAxis dataKey="month" stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
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
    </div>
  )
}

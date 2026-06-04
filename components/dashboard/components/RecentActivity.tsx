'use client'

import { motion } from 'framer-motion'
import { Check, AlertCircle, Clock } from 'lucide-react'
import { Booking } from '@/lib/services/bookings'
import { formatDistanceToNow } from 'date-fns'

interface RecentActivityProps {
  bookings?: Booking[]
}

const getStatusColor = (status: Booking['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500/10 text-green-500'
    case 'in progress':
      return 'bg-blue-500/10 text-blue-500'
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-500'
    case 'cancelled':
      return 'bg-red-500/10 text-red-500'
    case 'accepted':
      return 'bg-purple-500/10 text-purple-500'
    default:
      return 'bg-gray-500/10 text-gray-500'
  }
}

const getStatusIcon = (status: Booking['status']) => {
  switch (status) {
    case 'completed':
      return <Check className="w-4 h-4" />
    case 'pending':
      return <Clock className="w-4 h-4" />
    case 'cancelled':
      return <AlertCircle className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

export default function RecentActivity({ bookings = [] }: RecentActivityProps) {
  const displayBookings = bookings.length > 0 ? bookings : getPlaceholderBookings()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg border border-border overflow-hidden"
    >
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
      </div>

      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {displayBookings.length > 0 ? (
          displayBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 p-2 rounded-lg ${getStatusColor(booking.status)}`}
                >
                  {getStatusIcon(booking.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">
                      {booking.pickup_address} → {booking.drop_address}
                    </p>
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                    <span>${booking.estimated_price.toFixed(2)}</span>
                    <span>{formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No recent bookings
          </div>
        )}
      </div>
    </motion.div>
  )
}

function getPlaceholderBookings(): Booking[] {
  return []
}

'use client'

import { motion } from 'framer-motion'
import { Check, AlertCircle, Clock, Truck } from 'lucide-react'
import type { BookingWithCustomer } from '@/lib/services/server/bookings'
import { formatDistanceToNow } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { getStatusColor, getStatusLabel, isBookingStatus } from '@/lib/types/booking'

interface RecentActivityProps {
  bookings?: BookingWithCustomer[]
}

function getStatusIcon(status: string) {
  if (status === 'delivered') return <Check className="w-4 h-4" />
  if (status === 'request_received') return <Clock className="w-4 h-4" />
  if (status === 'on_the_way') return <Truck className="w-4 h-4" />
  if (status === 'cancelled') return <AlertCircle className="w-4 h-4" />
  return <Clock className="w-4 h-4" />
}

export default function RecentActivity({ bookings = [] }: RecentActivityProps) {
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
        {bookings.length > 0 ? (
          bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 p-2 rounded-lg ${getStatusColor(booking.status)}`}>
                  {getStatusIcon(booking.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">
                      {booking.pickup_address} → {booking.drop_address}
                    </p>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(booking.status)}`}
                    >
                      {isBookingStatus(booking.status)
                        ? getStatusLabel(booking.status)
                        : getStatusLabel(booking.status)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatCurrency(booking.estimated_price)}</span>
                    <span>{formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">No recent bookings</div>
        )}
      </div>
    </motion.div>
  )
}

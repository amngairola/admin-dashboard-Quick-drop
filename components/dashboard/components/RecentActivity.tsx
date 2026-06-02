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
    case 'ongoing':
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
                      {booking.pickup_location} → {booking.dropoff_location}
                    </p>
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                    <span>${booking.fare?.toFixed(2) || '0.00'}</span>
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
  return [
    {
      id: '1',
      rider_id: 'user1',
      driver_id: 'driver1',
      pickup_location: 'Downtown Station',
      dropoff_location: 'Airport Terminal 1',
      status: 'completed',
      fare: 42.50,
      created_at: new Date(Date.now() - 5 * 60000).toISOString(),
      updated_at: new Date().toISOString(),
      payment_method: 'card',
    },
    {
      id: '2',
      rider_id: 'user2',
      pickup_location: 'Central Park',
      dropoff_location: 'Times Square',
      status: 'ongoing',
      fare: 18.75,
      created_at: new Date(Date.now() - 15 * 60000).toISOString(),
      updated_at: new Date().toISOString(),
      payment_method: 'card',
    },
    {
      id: '3',
      rider_id: 'user3',
      pickup_location: 'Grand Central',
      dropoff_location: 'Brooklyn Bridge',
      status: 'pending',
      fare: 25.00,
      created_at: new Date(Date.now() - 30 * 60000).toISOString(),
      updated_at: new Date().toISOString(),
      payment_method: 'card',
    },
    {
      id: '4',
      rider_id: 'user4',
      driver_id: 'driver2',
      pickup_location: 'Wall Street',
      dropoff_location: 'Madison Avenue',
      status: 'completed',
      fare: 31.20,
      created_at: new Date(Date.now() - 60 * 60000).toISOString(),
      updated_at: new Date().toISOString(),
      payment_method: 'card',
    },
    {
      id: '5',
      rider_id: 'user5',
      pickup_location: 'Union Station',
      dropoff_location: 'Empire State Building',
      status: 'cancelled',
      fare: 22.00,
      created_at: new Date(Date.now() - 120 * 60000).toISOString(),
      updated_at: new Date().toISOString(),
      payment_method: 'card',
    },
  ]
}

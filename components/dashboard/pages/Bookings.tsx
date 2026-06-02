'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useBookings } from '@/lib/hooks/useBookings'
import { updateBookingStatus } from '@/lib/services/bookings'
import { Search, MapPin, DollarSign, MoreVertical } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function Bookings() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { data: bookings = [], refetch } = useBookings({
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const filteredBookings = bookings.slice(0, 50)

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await updateBookingStatus(bookingId, newStatus as any)
      refetch()
    } catch (error) {
      console.error('Error updating booking status:', error)
    }
  }

  const getStatusColor = (status: string) => {
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl font-bold">Booking Management</h1>
        <p className="text-muted-foreground">Monitor and manage all ride bookings</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'pending', 'accepted', 'ongoing', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-foreground hover:bg-border'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Bookings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-lg border border-border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-6 py-3 text-left text-sm font-semibold">Route</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Distance</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Fare</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Time</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking, index) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{booking.pickup_location}</p>
                          <p className="text-xs text-muted-foreground">{booking.dropoff_location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{booking.distance_km?.toFixed(1) || '-'} km</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{booking.fare?.toFixed(2) || '0.00'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(booking.id, 'accepted')}
                              className="px-3 py-1 bg-green-500/10 text-green-500 rounded text-xs font-medium hover:bg-green-500/20 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                              className="px-3 py-1 bg-red-500/10 text-red-500 rounded text-xs font-medium hover:bg-red-500/20 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {booking.status === 'accepted' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'ongoing')}
                            className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-medium hover:bg-blue-500/20 transition-colors"
                          >
                            Start
                          </button>
                        )}
                        {booking.status === 'ongoing' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'completed')}
                            className="px-3 py-1 bg-green-500/10 text-green-500 rounded text-xs font-medium hover:bg-green-500/20 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

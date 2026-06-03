'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useBookingsWithCustomer, useUpdateBookingStatus } from '@/lib/hooks/useBookings'
import { Search, MapPin, DollarSign, MoreVertical, Phone, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

export default function Bookings() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { data: bookings = [] } = useBookingsWithCustomer({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchTerm,
  })

  const updateBooking = useUpdateBookingStatus()

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await updateBooking.mutateAsync({
        bookingId,
        status: newStatus as any,
      })
      toast.success('Booking status updated')
    } catch (error) {
      toast.error('Failed to update booking')
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
            placeholder="Search by phone, address, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending', 'accepted', 'in progress', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm ${
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
                <th className="px-6 py-3 text-left text-sm font-semibold">Booking ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Pickup</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Dropoff</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Time</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((booking, index) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-muted-foreground">{booking.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{booking.customer_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground truncate">{booking.customer_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm max-w-xs truncate">{booking.pickup_address}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm max-w-xs truncate">{booking.drop_address}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{booking.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">${booking.estimated_price.toFixed(2)}</span>
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
                              disabled={updateBooking.isPending}
                              className="px-3 py-1 bg-green-500/10 text-green-500 rounded text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                              disabled={updateBooking.isPending}
                              className="px-3 py-1 bg-red-500/10 text-red-500 rounded text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {booking.status === 'accepted' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'in progress')}
                            disabled={updateBooking.isPending}
                            className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                          >
                            Start
                          </button>
                        )}
                        {booking.status === 'in progress' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'completed')}
                            disabled={updateBooking.isPending}
                            className="px-3 py-1 bg-green-500/10 text-green-500 rounded text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
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

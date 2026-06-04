'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import DashboardPageHeader from '../DashboardPageHeader'
import type { BookingWithCustomer } from '@/lib/services/server/bookings'
import { createClient } from '@/lib/supabase/client'
import {
  BOOKING_STATUSES,
  BOOKING_STATUS_LABELS,
  getStatusColor,
  getStatusLabel,
  isBookingStatus,
  type BookingStatus,
} from '@/lib/types/booking'
import { formatBookingDate, formatCurrency } from '@/lib/utils'

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  ...BOOKING_STATUSES.map((status) => ({
    value: status,
    label: BOOKING_STATUS_LABELS[status],
  })),
]

interface BookingsClientProps {
  initialBookings: BookingWithCustomer[]
  fetchError: string | null
}

export default function BookingsClient({ initialBookings, fetchError }: BookingsClientProps) {
  const searchParams = useSearchParams()
  const [bookings, setBookings] = useState(initialBookings)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(() => searchParams.get('status') ?? 'all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    setBookings(initialBookings)
  }, [initialBookings])

  useEffect(() => {
    const status = searchParams.get('status')
    setStatusFilter(status && (status === 'all' || isBookingStatus(status) || status === 'cancelled') ? status : 'all')
  }, [searchParams])

  const filteredBookings = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()

    return bookings.filter((booking) => {
      const matchesStatus =
        statusFilter === 'all' ||
        booking.status === statusFilter

      if (!matchesStatus) return false
      if (!q) return true

      return (
        booking.id.toLowerCase().includes(q) ||
        booking.customer_name.toLowerCase().includes(q) ||
        booking.customer_email.toLowerCase().includes(q) ||
        booking.pickup_address.toLowerCase().includes(q) ||
        booking.drop_address.toLowerCase().includes(q)
      )
    })
  }, [bookings, searchTerm, statusFilter])

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    const previous = bookings.find((b) => b.id === bookingId)
    if (!previous || previous.status === newStatus) return

    setUpdatingId(bookingId)
    setBookings((current) =>
      current.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)),
    )

    const supabase = createClient()
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId)

    setUpdatingId(null)

    if (error) {
      setBookings((current) =>
        current.map((b) => (b.id === bookingId ? { ...b, status: previous.status } : b)),
      )
      toast.error(`Failed to update status: ${error.message}`)
      return
    }

    toast.success('Booking status updated')
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <DashboardPageHeader
          title="Booking Management"
          description="Monitor and manage all ride bookings"
          breadcrumb="Bookings"
        />
      </motion.div>

      {fetchError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load bookings: {fetchError}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by customer name, email, pickup address, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTER_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm ${
                statusFilter === value
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-foreground hover:bg-border'
              }`}
            >
              {label}
            </button>
          ))}
          {statusFilter === 'cancelled' && (
            <span className="self-center text-xs text-muted-foreground px-2">
              (no cancelled status in schema — showing 0)
            </span>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-lg border border-border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-sm font-semibold">Booking ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Service Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Pickup</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Drop</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Distance</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Payment</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking, index) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-muted-foreground">{booking.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{booking.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{booking.customer_email || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{booking.service_type || '—'}</td>
                    <td className="px-4 py-3 text-sm max-w-[160px] truncate" title={booking.pickup_address}>
                      {booking.pickup_address}
                    </td>
                    <td className="px-4 py-3 text-sm max-w-[160px] truncate" title={booking.drop_address}>
                      {booking.drop_address}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={isBookingStatus(booking.status) ? booking.status : BOOKING_STATUSES[0]}
                        disabled={updatingId === booking.id || !isBookingStatus(booking.status)}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                        className={`text-xs font-medium rounded-full px-2 py-1.5 border border-border bg-background cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent ${getStatusColor(booking.status)}`}
                      >
                        {BOOKING_STATUSES.map((status) => (
                          <option key={status} value={status} className="bg-card text-foreground">
                            {BOOKING_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                      {!isBookingStatus(booking.status) && (
                        <span className={`mt-1 block px-2 py-0.5 rounded text-xs ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {booking.distance_km != null ? `${booking.distance_km.toFixed(1)} km` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{formatCurrency(booking.estimated_price)}</td>
                    <td className="px-4 py-3 text-sm capitalize">{booking.payment_method || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {formatBookingDate(booking.created_at)}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-muted-foreground">
                    {fetchError
                      ? 'Unable to display bookings'
                      : searchTerm || statusFilter !== 'all'
                        ? 'No bookings match your filters'
                        : 'No bookings found'}
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

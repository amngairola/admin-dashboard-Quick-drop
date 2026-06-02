'use client'

import { motion } from 'framer-motion'
import { Search, MapPin, Clock, User, Smartphone } from 'lucide-react'
import { useState } from 'react'

interface Booking {
  id: string
  passanger: string
  driver: string
  from: string
  to: string
  status: 'completed' | 'in-progress' | 'cancelled' | 'scheduled'
  fare: number
  date: string
  time: string
}

const bookings: Booking[] = [
  {
    id: 'BK001',
    passanger: 'Sarah Johnson',
    driver: 'John Smith',
    from: '123 Main St',
    to: '456 Oak Ave',
    status: 'completed',
    fare: 24.5,
    date: '2024-06-02',
    time: '14:30',
  },
  {
    id: 'BK002',
    passanger: 'Michael Chen',
    driver: 'Emma Davis',
    from: '789 Pine Rd',
    to: '321 Elm St',
    status: 'in-progress',
    fare: 18.75,
    date: '2024-06-02',
    time: '15:45',
  },
  {
    id: 'BK003',
    passanger: 'Lisa Martinez',
    driver: 'Tom Wilson',
    from: 'Airport Terminal A',
    to: 'Downtown Hotel',
    status: 'scheduled',
    fare: 42.0,
    date: '2024-06-02',
    time: '16:00',
  },
  {
    id: 'BK004',
    passanger: 'Robert Brown',
    driver: 'Not assigned',
    from: '555 Maple Dr',
    to: 'City Center',
    status: 'cancelled',
    fare: 31.25,
    date: '2024-06-02',
    time: '13:15',
  },
]

export default function Bookings() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.passanger.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.driver.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400'
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400'
      case 'scheduled':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="text-muted-foreground">View and manage all ride bookings</p>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4 flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex-1 flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-secondary border border-border rounded-lg text-sm font-medium outline-none cursor-pointer hover:border-accent transition-colors"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="scheduled">Scheduled</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </motion.div>

      {/* Bookings Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {filteredBookings.map((booking, index) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            {/* Booking Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{booking.id}</p>
                <h3 className="text-lg font-semibold mt-1">{booking.passanger}</h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(booking.status)}`}
              >
                {booking.status.replace('-', ' ')}
              </span>
            </div>

            {/* Route */}
            <div className="space-y-3 mb-4">
              <div className="flex gap-3">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="text-sm font-medium">{booking.from}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">To</p>
                  <p className="text-sm font-medium">{booking.to}</p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Driver</p>
                <div className="flex items-center gap-1.5">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <p className="text-sm font-medium">{booking.driver}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Date & Time</p>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {booking.time}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Fare</p>
                <p className="text-lg font-bold">${booking.fare.toFixed(2)}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors text-sm font-medium"
              >
                View Details
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No bookings found</p>
        </div>
      )}

      {/* Pagination */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between"
      >
        <p className="text-sm text-muted-foreground">Showing {filteredBookings.length} of {bookings.length} bookings</p>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-sm font-medium"
          >
            Previous
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-sm font-medium"
          >
            Next
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

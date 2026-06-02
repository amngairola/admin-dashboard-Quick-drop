'use client'

import { motion } from 'framer-motion'
import { Menu, Bell, User, Search } from 'lucide-react'
import { useState } from 'react'

interface TopNavbarProps {
  onMenuClick: () => void
}

export default function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const [notificationOpen, setNotificationOpen] = useState(false)

  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: Menu and Title */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </motion.button>
        <h2 className="text-xl font-semibold hidden sm:block">Dashboard</h2>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm w-32 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Notifications */}
        <motion.div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors relative"
          >
            <Bell className="w-6 h-6" />
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"
            />
          </motion.button>

          {notificationOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg p-4 space-y-3"
            >
              <h3 className="font-semibold">Notifications</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <div className="p-2 bg-secondary rounded hover:bg-secondary/80 transition-colors cursor-pointer">
                  <p className="text-sm font-medium">New booking received</p>
                  <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                </div>
                <div className="p-2 bg-secondary rounded hover:bg-secondary/80 transition-colors cursor-pointer">
                  <p className="text-sm font-medium">Driver verification completed</p>
                  <p className="text-xs text-muted-foreground mt-1">15 minutes ago</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Profile */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <User className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  )
}

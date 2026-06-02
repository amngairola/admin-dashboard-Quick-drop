'use client'

import { motion } from 'framer-motion'
import { Menu, Bell, User, Search, LogOut } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUnreadNotifications } from '@/lib/hooks/useNotifications'
import { useRouter } from 'next/navigation'

interface TopNavbarProps {
  onMenuClick: () => void
}

export default function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const [notificationOpen, setNotificationOpen] = useState(false)
  const { data: unreadNotifications = [] } = useUnreadNotifications()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

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
            {unreadNotifications.length > 0 && (
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"
              />
            )}
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadNotifications.length}
              </span>
            )}
          </motion.button>

          {notificationOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg p-4 space-y-3 z-50"
            >
              <h3 className="font-semibold">Notifications ({unreadNotifications.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {unreadNotifications.length > 0 ? (
                  unreadNotifications.slice(0, 5).map((notif) => (
                    <div key={notif.id} className="p-2 bg-secondary rounded hover:bg-secondary/80 transition-colors cursor-pointer">
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No notifications</p>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Profile Dropdown */}
        <div className="relative group">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <User className="w-6 h-6" />
          </motion.button>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
          >
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors rounded-lg text-red-500 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

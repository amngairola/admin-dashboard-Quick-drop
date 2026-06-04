'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { BarChart3, Users, MapPin, Settings, LogOut } from 'lucide-react'

interface SidebarProps {
  open: boolean
  onClose: () => void
  currentPage: string
}

export default function Sidebar({ open, onClose, currentPage }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/dashboard' },
    { id: 'users', label: 'Users', icon: Users, href: '/dashboard/users' },
    { id: 'bookings', label: 'Bookings', icon: MapPin, href: '/dashboard/bookings' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard' },
  ]

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -256 }}
        animate={{ x: open ? 0 : -256 }}
        exit={{ x: -256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-64 bg-sidebar border-r border-sidebar-border fixed left-0 top-0 h-screen z-50 flex flex-col lg:static lg:translate-x-0 lg:border-r"
      >
        <div className="px-6 py-6 border-b border-sidebar-border">
          <Link href="/dashboard" onClick={onClose} className="block">
            <h1 className="text-xl font-bold text-sidebar-foreground flex items-center gap-2">
              <img
                src="/icon.svg"
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 rounded"
              />
              QuickDrop
            </h1>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id

            return (
              <Link key={item.id} href={item.href} onClick={onClose}>
                <motion.span
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  )
}

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { BarChart3, Users, MapPin, Settings, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  open: boolean
  onClose: () => void
  currentPage: string
  onPageChange: (page: string) => void
}

export default function Sidebar({ open, onClose, currentPage, onPageChange }: SidebarProps) {

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '#' },
    { id: 'users', label: 'Users', icon: Users, href: '#' },
    { id: 'bookings', label: 'Bookings', icon: MapPin, href: '#' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '#' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '#' },
  ]

  return (
    <>
      {/* Mobile Overlay */}
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

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -256 }}
        animate={{ x: open ? 0 : -256 }}
        exit={{ x: -256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-64 bg-sidebar border-r border-sidebar-border fixed left-0 top-0 h-screen z-50 flex flex-col lg:static lg:translate-x-0 lg:border-r"
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-sm">Q</span>
            </div>
            QuickDrop
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id)
                  onClose()
                }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            )
          })}
        </nav>

        {/* Logout */}
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

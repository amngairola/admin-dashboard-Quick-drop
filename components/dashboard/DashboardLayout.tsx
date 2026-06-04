'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import TopNavbar from './TopNavbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const currentPage =
    pathname === '/dashboard'
      ? 'dashboard'
      : pathname.startsWith('/dashboard/users')
        ? 'users'
        : pathname.startsWith('/dashboard/bookings')
          ? 'bookings'
          : pathname.startsWith('/dashboard/analytics')
            ? 'analytics'
            : 'dashboard'

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

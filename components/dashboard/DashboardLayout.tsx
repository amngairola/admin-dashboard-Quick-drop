'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import TopNavbar from './TopNavbar'
import DashboardPage from './pages/Dashboard'
import Users from './pages/Users'
import Bookings from './pages/Bookings'
import Analytics from './pages/Analytics'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'users':
        return <Users />
      case 'bookings':
        return <Bookings />
      case 'analytics':
        return <Analytics />
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

'use client'

export const dynamic = 'force-dynamic'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    },
  },
})

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardLayout />
    </QueryClientProvider>
  )
}

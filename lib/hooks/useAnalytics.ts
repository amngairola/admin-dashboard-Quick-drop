import { useQuery } from '@tanstack/react-query'
import { getRevenueStats, getRevenueByDate, getTopRoutes, getUserStats } from '@/lib/services/analytics'

export function useRevenueStats() {
  return useQuery({
    queryKey: ['analytics:revenue:stats'],
    queryFn: () => getRevenueStats(),
    staleTime: 1000 * 60 * 10,
  })
}

export function useRevenueByDate(dateRange: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ['analytics:revenue:byDate', dateRange],
    queryFn: () => getRevenueByDate(dateRange),
    staleTime: 1000 * 60 * 10,
  })
}

export function useTopRoutes(limit?: number) {
  return useQuery({
    queryKey: ['analytics:topRoutes', limit],
    queryFn: () => getTopRoutes(limit),
    staleTime: 1000 * 60 * 10,
  })
}

export function useUserStats() {
  return useQuery({
    queryKey: ['analytics:userStats'],
    queryFn: () => getUserStats(),
    staleTime: 1000 * 60 * 10,
  })
}

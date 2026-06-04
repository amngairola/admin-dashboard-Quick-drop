import { useQuery } from '@tanstack/react-query'
import {
  getRevenueStats,
  getRevenueChart,
  getBookingTrendChart,
  getBookingStatusStats,
  getUserStats,
} from '@/lib/services/analytics'

export function useRevenueStats() {
  return useQuery({
    queryKey: ['analytics:revenue:stats'],
    queryFn: () => getRevenueStats(),
    staleTime: 1000 * 60 * 10,
  })
}

export function useRevenueChart() {
  return useQuery({
    queryKey: ['analytics:revenue:chart'],
    queryFn: () => getRevenueChart(),
    staleTime: 1000 * 60 * 10,
  })
}

export function useBookingTrendChart() {
  return useQuery({
    queryKey: ['analytics:bookingTrend:chart'],
    queryFn: () => getBookingTrendChart(),
    staleTime: 1000 * 60 * 10,
  })
}

export function useBookingStatusStats() {
  return useQuery({
    queryKey: ['analytics:bookingStatus'],
    queryFn: () => getBookingStatusStats(),
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

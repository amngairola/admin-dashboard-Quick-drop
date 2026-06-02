import { useQuery } from '@tanstack/react-query'
import { getUsers, getUserById, type User } from '@/lib/services/users'

export function useUsers(filters?: Parameters<typeof getUsers>[0]) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => getUsers(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => getUserById(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  })
}

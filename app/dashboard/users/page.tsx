import UsersClient from '@/components/dashboard/pages/UsersClient'
import { getAllUsers } from '@/lib/services/server/users'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const { users, error } = await getAllUsers()

  return <UsersClient initialUsers={users} fetchError={error} />
}

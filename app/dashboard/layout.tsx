import QueryProvider from '@/components/providers/QueryProvider'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Toaster } from 'sonner'

export const dynamic = 'force-dynamic'

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <DashboardLayout>{children}</DashboardLayout>
      <Toaster richColors position="top-right" theme="dark" />
    </QueryProvider>
  )
}

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface DashboardPageHeaderProps {
  title: string
  description?: string
  breadcrumb: string
  showBack?: boolean
}

export default function DashboardPageHeader({
  title,
  description,
  breadcrumb,
  showBack = true,
}: DashboardPageHeaderProps) {
  return (
    <div className="space-y-2">
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <span className="mx-1.5">›</span>
        <span className="text-foreground">{breadcrumb}</span>
      </nav>

      <div className="flex items-center gap-3">
        {showBack && (
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
      </div>
    </div>
  )
}

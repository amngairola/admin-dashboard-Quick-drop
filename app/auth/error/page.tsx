import Link from 'next/link'

export const dynamic = 'force-dynamic'

type AuthErrorPageProps = {
  searchParams: Promise<{
    reason?: string
    name?: string
    message?: string
    status?: string
    code?: string
  }>
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams
  const { reason, name, message, status, code } = params

  const hasSupabaseError = Boolean(message || status || code || name)
  const title =
    reason === 'missing_code'
      ? 'Missing authorization code'
      : reason === 'exchange_failed'
        ? 'Sign-in failed'
        : 'Authentication error'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">QuickDrop Admin</h1>
            <p className="text-muted-foreground">{title}</p>
          </div>

          {reason && (
            <p className="text-sm text-muted-foreground text-center">
              Reason: <span className="font-mono text-foreground">{reason}</span>
            </p>
          )}

          {hasSupabaseError ? (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-4 space-y-3 text-sm">
              <p className="font-semibold text-destructive">Supabase error (exchangeCodeForSession)</p>
              <dl className="space-y-2 font-mono text-xs break-all">
                {name && (
                  <div>
                    <dt className="text-muted-foreground">name</dt>
                    <dd className="text-foreground">{name}</dd>
                  </div>
                )}
                {message && (
                  <div>
                    <dt className="text-muted-foreground">message</dt>
                    <dd className="text-foreground">{message}</dd>
                  </div>
                )}
                {status && (
                  <div>
                    <dt className="text-muted-foreground">status</dt>
                    <dd className="text-foreground">{status}</dd>
                  </div>
                )}
                {code && (
                  <div>
                    <dt className="text-muted-foreground">code</dt>
                    <dd className="text-foreground">{code}</dd>
                  </div>
                )}
              </dl>
            </div>
          ) : (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm text-center">
              No Supabase error details were passed. Check the dev server terminal for{' '}
              <span className="font-mono">[auth/callback]</span> logs.
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            The same error is logged in the server console under{' '}
            <span className="font-mono">[auth/callback] exchangeCodeForSession failed</span>.
          </p>

          <Link
            href="/auth/login"
            className="block w-full text-center bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 px-4 rounded-lg transition-all duration-200"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

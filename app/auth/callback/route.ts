import { createServerClient } from '@supabase/ssr'
import type { AuthError } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function authErrorPayload(error: AuthError) {
  return {
    name: error.name,
    message: error.message,
    status: error.status,
    code: error.code,
  }
}

function redirectToAuthError(origin: string, reason: string, error?: AuthError) {
  const params = new URLSearchParams({ reason })
  if (error) {
    const payload = authErrorPayload(error)
    if (payload.name) params.set('name', payload.name)
    if (payload.message) params.set('message', payload.message)
    if (payload.status != null) params.set('status', String(payload.status))
    if (payload.code) params.set('code', payload.code)
  }
  return NextResponse.redirect(`${origin}/auth/error?${params.toString()}`)
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) {
    console.error('[auth/callback] Missing OAuth code in callback URL', {
      searchParams: Object.fromEntries(searchParams.entries()),
    })
    return redirectToAuthError(origin, 'missing_code')
  }

  // Build the redirect response first so we can attach cookies to it
  const redirectResponse = NextResponse.redirect(`${origin}${next}`)

  // Create a Supabase client that writes cookies directly onto our response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write session cookies onto the redirect response
          // so the browser receives them in the same round-trip
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  console.log('[auth/callback] exchangeCodeForSession starting', {
    hasCode: Boolean(code),
    codeLength: code.length,
    next,
  })

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const payload = authErrorPayload(error)
    console.error('[auth/callback] exchangeCodeForSession failed', payload)
    console.error('[auth/callback] exchangeCodeForSession raw error', error)
    return redirectToAuthError(origin, 'exchange_failed', error)
  }

  console.log('[auth/callback] exchangeCodeForSession succeeded', {
    hasSession: Boolean(data.session),
    userId: data.session?.user?.id ?? null,
  })

  // redirectResponse already has the session cookies attached
  return redirectResponse
}
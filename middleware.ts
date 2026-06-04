// middleware.ts
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Create a single response object we'll mutate throughout
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Create ONE Supabase client that reads AND writes to the same response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write to both request and response so cookies propagate correctly
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Always call getUser() to refresh the session token if needed.
  // Do NOT use getSession() here — it doesn't validate the JWT server-side.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('PATH:', request.nextUrl.pathname)
  console.log('USER:', user?.id ?? 'null')

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname === '/'

  if (isProtectedRoute) {
    if (!user) {
      console.log('No user — redirecting to login')
      const redirectResponse = NextResponse.redirect(
        new URL('/auth/login', request.url)
      )
      // Forward any cookies that were set (e.g. PKCE state cleanup)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }

    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id, is_active')
      .eq('id', user.id)
      .single()

    console.log('ADMIN DATA:', adminData)
    console.log('ADMIN ERROR:', adminError?.message ?? 'none')

    if (!adminData || !adminData.is_active) {
      console.log('Not an active admin — redirecting to login')
      const redirectResponse = NextResponse.redirect(
        new URL('/auth/login', request.url)
      )
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }
  }

  // IMPORTANT: Return supabaseResponse, not a new NextResponse.
  // Returning a different object drops the session cookies Supabase set.
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
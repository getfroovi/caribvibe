import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicRoute = 
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/admin/login' ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.match(/\.(.*)$/);

  // If user is not authenticated and trying to access a protected route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    // If they were trying to access admin, send to admin login
    if (request.nextUrl.pathname.startsWith('/admin')) {
      url.pathname = '/admin/login';
    } else {
      url.pathname = '/login';
    }
    return NextResponse.redirect(url);
  }

  // If user IS authenticated
  if (user) {
    // Check if they are accessing an auth route
    const isUserAuthRoute = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/auth';
    const isAdminAuthRoute = request.nextUrl.pathname === '/admin/login';
    
    // We cannot reliably check role in middleware without fetching from DB which is slow.
    // Instead, we just redirect them out of the login pages.
    if (isUserAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/profile';
      return NextResponse.redirect(url);
    }
    
    if (isAdminAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse
}

import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the path the user is trying to visit
  const path = request.nextUrl.pathname;

  // We only want to protect routes inside /admin/ (but NOT the /admin login page itself)
  const isProtectedAdminRoute = path.startsWith('/admin/') && path !== '/admin';

  // Check if our simple auth cookie exists
  const isAuthenticated = request.cookies.has('adminAuth');

  if (isProtectedAdminRoute && !isAuthenticated) {
    // If they try to go to /admin/dashboard or /admin/tools/create without the cookie,
    // immediately bounce them back to the /admin login page.
    const loginUrl = new URL('/admin', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Otherwise, let them through!
  return NextResponse.next();
}

// Optional: Configure the matcher to optimize performance so middleware only runs on admin paths
export const config = {
  matcher: ['/admin/:path*'],
};
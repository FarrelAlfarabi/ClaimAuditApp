import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL, authEnabled, isPublicPath } from "@/lib/auth/config";

/**
 * Refreshes the Supabase session cookie on every request and sends signed-out visitors to /login.
 * Role checks happen in pages and server actions (lib/role.ts), not here.
 */
export async function middleware(req: NextRequest) {
  if (!authEnabled()) return NextResponse.next();

  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });

  let signedIn = false;
  try {
    const { data } = await supabase.auth.getClaims();
    signedIn = !!data?.claims;
  } catch {
    signedIn = false; // Supabase unreachable: treat as signed out (login page explains; AUTH_DISABLED=1 is the fallback)
  }

  const path = req.nextUrl.pathname;
  if (!signedIn && !isPublicPath(path)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = path === "/" ? "" : `?next=${encodeURIComponent(path + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|mock-receipts/).*)"],
};

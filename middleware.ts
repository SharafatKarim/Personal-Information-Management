// Client-side route guarding via <RouteGuard /> is used instead of edge middleware,
// because Firebase Auth state lives in IndexedDB / localStorage and can't be read
// from the Edge runtime without implementing a server-side session-cookie flow.
// This file is intentionally a no-op so Next.js doesn't error on its absence.

import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};

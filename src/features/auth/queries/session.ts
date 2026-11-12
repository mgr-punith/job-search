import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export async function getSessionUserId(requestHeaders?: Headers) {
  const session = await auth.api.getSession({ headers: requestHeaders ?? await headers() });
  return session?.user.id ?? null;
}

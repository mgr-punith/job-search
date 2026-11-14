import { headers } from "next/headers";
import { cache } from "react";

import { auth } from "@/lib/auth";

export const getSession = cache(async (requestHeaders?: Headers) => {
  return auth.api.getSession({ headers: requestHeaders ?? await headers() });
});

export async function getSessionUserId(requestHeaders?: Headers) {
  const session = await getSession(requestHeaders);
  return session?.user.id ?? null;
}

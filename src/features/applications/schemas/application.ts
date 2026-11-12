import { z } from "zod";

export const applicationIdSchema = z.string().trim().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/);
export const applySchema = z.object({ jobId: applicationIdSchema });

export function parseApplicationPage(value: string | string[] | undefined) {
  return z.coerce.number().int().min(1).max(10_000).catch(1).parse(Array.isArray(value) ? value[0] : value);
}

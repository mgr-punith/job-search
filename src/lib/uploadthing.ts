import { UTApi } from "uploadthing/server";

import { parseUploadEnvironment } from "@/lib/env";

export async function deleteUnusedUpload(key: string | null) {
  if (!key) return;
  try {
    const environment = parseUploadEnvironment(process.env);
    const api = new UTApi({ token: environment.UPLOADTHING_TOKEN, logLevel: "None" });
    await api.deleteFiles(key);
  } catch {
    // Profile changes stay successful if storage cleanup is temporarily unavailable.
    console.warn("Unused resume cleanup could not complete.");
  }
}

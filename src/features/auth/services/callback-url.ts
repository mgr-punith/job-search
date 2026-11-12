const DEFAULT_CALLBACK_URL = "/dashboard";
const CALLBACK_BASE_URL = "https://jobsearch.local";

export function getSafeCallbackUrl(callbackUrl?: string | null) {
  if (
    !callbackUrl?.startsWith("/") ||
    callbackUrl.startsWith("//") ||
    callbackUrl.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(callbackUrl)
  ) {
    return DEFAULT_CALLBACK_URL;
  }

  try {
    const parsedUrl = new URL(callbackUrl, CALLBACK_BASE_URL);

    if (
      parsedUrl.origin !== CALLBACK_BASE_URL ||
      parsedUrl.pathname.startsWith("//")
    ) {
      return DEFAULT_CALLBACK_URL;
    }

    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return DEFAULT_CALLBACK_URL;
  }
}

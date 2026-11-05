export function getSafeNextUrl(candidate?: string): string {
  if (!candidate?.startsWith("/") || candidate.startsWith("//")) {
    return "/";
  }

  try {
    const baseUrl = new URL("http://booknook.local");
    const targetUrl = new URL(candidate, baseUrl);
    if (targetUrl.origin !== baseUrl.origin) {
      return "/";
    }
    return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
  } catch {
    return "/";
  }
}

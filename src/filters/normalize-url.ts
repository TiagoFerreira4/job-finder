const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
]);

export function normalizeUrl(url: string): string {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(`URL invalida: ${url}`);
  }

  parsedUrl.protocol = parsedUrl.protocol.toLowerCase();
  parsedUrl.hostname = parsedUrl.hostname.toLowerCase();
  parsedUrl.hash = "";

  for (const param of TRACKING_PARAMS) {
    parsedUrl.searchParams.delete(param);
  }

  if (parsedUrl.pathname !== "/" && parsedUrl.pathname.endsWith("/")) {
    parsedUrl.pathname = parsedUrl.pathname.slice(0, -1);
  }

  return parsedUrl.toString();
}

const DEFAULT_AUTH_REDIRECT = "/discover";

const AUTH_ROUTE_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/sign-out",
];

export function getFirstQueryValue(value: string | string[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function resolveAuthRedirect(
  nextPath: string | string[] | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT,
) {
  const rawPath = getFirstQueryValue(nextPath)?.trim();

  if (!rawPath || rawPath.startsWith("//") || !rawPath.startsWith("/")) {
    return fallback;
  }

  try {
    const parsed = new URL(rawPath, "https://wavestream.local");
    const normalizedPath = `${parsed.pathname}${parsed.search}${parsed.hash}`;

    if (AUTH_ROUTE_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix))) {
      return fallback;
    }

    return normalizedPath || fallback;
  } catch {
    return fallback;
  }
}

export function buildAuthHref(
  pathname: string,
  nextPath?: string | string[] | null | undefined,
) {
  const resolvedNext = resolveAuthRedirect(nextPath);

  if (!resolvedNext || resolvedNext === DEFAULT_AUTH_REDIRECT) {
    return pathname;
  }

  const searchParams = new URLSearchParams();
  searchParams.set("next", resolvedNext);
  return `${pathname}?${searchParams.toString()}`;
}

export function getDefaultAuthRedirect() {
  return DEFAULT_AUTH_REDIRECT;
}

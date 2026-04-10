export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status = 500, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  meta?: unknown;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object";

const isApiEnvelope = <T>(value: unknown): value is ApiEnvelope<T> =>
  isObject(value) && "success" in value && "data" in value;

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => "");
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    body:
      options.body === undefined || options.body instanceof FormData
        ? (options.body as BodyInit | undefined)
        : JSON.stringify(options.body),
    credentials: "include",
    cache: "no-store",
  }).catch((error: unknown) => {
    throw new ApiError(
      "WaveStream API is not reachable yet. The frontend shell still compiles safely.",
      503,
      error,
    );
  });

  if (!response.ok) {
    const details = await parseResponse(response);
    throw new ApiError(
      isObject(details) && "message" in details
        ? String((details as { message: string }).message)
        : `Request failed with status ${response.status}`,
      response.status,
      details,
    );
  }

  const payload = await parseResponse(response);
  if (isApiEnvelope<T>(payload)) {
    return (payload.data ?? payload) as T;
  }

  return payload as T;
}

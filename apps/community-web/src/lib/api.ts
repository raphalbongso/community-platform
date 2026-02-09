const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders as Record<string, string>,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...rest,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error?.message ?? "Request failed");
  }

  return json.data as T;
}

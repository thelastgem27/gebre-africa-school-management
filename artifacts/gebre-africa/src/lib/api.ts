import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

function buildUrl(path: string): string {
  if (!API_BASE) return path;
  return `${API_BASE.replace(/\/$/, '')}${path}`;
}

function assertJson(res: Response, path: string): void {
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) {
    throw new Error(
      `API ${path} returned non-JSON (${res.status}). Make sure VITE_API_BASE_URL points to the API server.`
    );
  }
}

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  let { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const { data: refreshed } = await supabase.auth.refreshSession();
    session = refreshed.session;
  }
  const token = session?.access_token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(buildUrl(input), { ...init, headers });
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await apiFetch(path);
  assertJson(res, path);
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPost<T = any>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
  assertJson(res, path);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error ?? `API ${path} failed: ${res.status}`);
  }
  return res.json();
}

export async function apiPatch<T = any>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) });
  assertJson(res, path);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error ?? `API ${path} failed: ${res.status}`);
  }
  return res.json();
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  const res = await apiFetch(path, { method: 'DELETE' });
  if (res.status === 204) return undefined as T;
  assertJson(res, path);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error ?? `API ${path} failed: ${res.status}`);
  }
  return res.json();
}

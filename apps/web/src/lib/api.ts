import type { PinsResponse } from '@freshmarket/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  } catch {
    throw new Error(
      'API niedostępne. Uruchom `pnpm dev` i sprawdź, czy NestJS nasłuchuje na porcie 4000.',
    );
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export function fetchPins(params: {
  place?: string;
  lat?: number;
  lng?: number;
  category?: string;
  radiusKm?: number;
}): Promise<PinsResponse> {
  const search = new URLSearchParams();
  if (params.place) search.set('place', params.place);
  if (params.lat != null) search.set('lat', String(params.lat));
  if (params.lng != null) search.set('lng', String(params.lng));
  if (params.category) search.set('category', params.category);
  if (params.radiusKm != null) search.set('radiusKm', String(params.radiusKm));
  const qs = search.toString();
  return apiFetch<PinsResponse>(`/pins${qs ? `?${qs}` : ''}`);
}

export function syncGoogleUser(
  profile: { googleId: string; email: string; name: string; avatarUrl?: string | null },
): Promise<{ accessToken: string; refreshToken: string }> {
  return apiFetch('/auth/google', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
}

export function storeApiTokens(tokens: { accessToken: string; refreshToken: string }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('fm_access_token', tokens.accessToken);
  localStorage.setItem('fm_refresh_token', tokens.refreshToken);
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fm_access_token');
}

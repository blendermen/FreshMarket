'use client';

import type { MapCenter, PinListItem } from '@freshmarket/shared';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCallback, useState } from 'react';
import { GoogleTokenSync } from '@/components/GoogleTokenSync';
import { MapView } from '@/components/MapView';
import { PinPanel } from '@/components/PinPanel';
import {
  PlaceSearchInput,
  type PlaceSearchPayload,
} from '@/components/PlaceSearchInput';
import { fetchPins } from '@/lib/api';

export default function MapPage() {
  const { data: session } = useSession();
  const [place, setPlace] = useState('');
  const [pins, setPins] = useState<PinListItem[]>([]);
  const [center, setCenter] = useState<MapCenter | null>(null);
  const [resolvedPlace, setResolvedPlace] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async ({ place: queryPlace, center: preset }: PlaceSearchPayload) => {
    const trimmed = queryPlace.trim();
    if (!trimmed && !preset) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchPins(
        preset
          ? {
              lat: preset.latitude,
              lng: preset.longitude,
              radiusKm: 50,
            }
          : { place: trimmed, radiusKm: 50 },
      );
      setPins(data.pins);
      setCenter(preset ?? data.center);
      setResolvedPlace(data.placeName ?? trimmed);
      if (data.pins[0]) setSelectedId(data.pins[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd wyszukiwania');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <GoogleTokenSync />
      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
          zIndex: 10,
        }}
      >
        <Link href="/" style={{ fontWeight: 700, color: 'var(--text)' }}>
          FreshMarket
        </Link>
        <form
          style={{ flex: 1, display: 'flex', gap: '0.5rem', minWidth: 200 }}
          onSubmit={(e) => {
            e.preventDefault();
            runSearch({ place });
          }}
        >
          <PlaceSearchInput
            value={place}
            onChange={setPlace}
            onSearch={runSearch}
            loading={loading}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              padding: '0.6rem 1.25rem',
              borderRadius: 999,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Szukaj
          </button>
        </form>
        {session ? (
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            {session.user?.name ?? session.user?.email}
          </span>
        ) : (
          <Link href="/login" style={{ fontSize: '0.85rem' }}>
            Zaloguj
          </Link>
        )}
      </header>
      {error && (
        <p style={{ margin: 0, padding: '0.5rem 1rem', background: '#fde8e8', color: '#9b2226' }}>
          {error}
        </p>
      )}
      {resolvedPlace && !error && (
        <p
          style={{
            margin: 0,
            padding: '0.4rem 1rem',
            fontSize: '0.85rem',
            color: 'var(--muted)',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          Znaleziono: {resolvedPlace}
        </p>
      )}
      <div
        className="map-layout"
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr',
          minHeight: 0,
        }}
      >
        <div style={{ position: 'relative', minHeight: 0 }}>
          <MapView
            center={center}
            pins={pins}
            selectedId={selectedId}
            onSelectPin={setSelectedId}
          />
        </div>
        <PinPanel
          pins={pins}
          selectedId={selectedId}
          onSelect={setSelectedId}
          loading={loading}
        />
      </div>
      <style jsx global>{`
        @media (min-width: 768px) {
          .map-layout {
            grid-template-columns: 1fr 320px !important;
          }
        }
        @media (max-width: 767px) {
          .map-layout {
            grid-template-rows: 55dvh 1fr;
          }
        }
      `}</style>
    </div>
  );
}

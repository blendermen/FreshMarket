'use client';

import {
  PIN_CATEGORY_LABELS,
  type PinCategory,
  type PinListItem,
} from '@freshmarket/shared';

interface PinPanelProps {
  pins: PinListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

function formatDistance(km: number | null): string {
  if (km == null) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function PinPanel({ pins, selectedId, onSelect, loading }: PinPanelProps) {
  return (
    <aside
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
      }}
    >
      <header style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ margin: 0, fontSize: '1rem' }}>W pobliżu</h2>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--muted)' }}>
          {loading ? 'Szukam…' : `${pins.length} ofert`}
        </p>
      </header>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          overflow: 'auto',
          flex: 1,
        }}
      >
        {pins.map((pin) => (
          <li key={pin.id}>
            <button
              type="button"
              onClick={() => onSelect(pin.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                background: pin.id === selectedId ? '#eef5eb' : 'transparent',
                padding: '0.85rem 1rem',
                cursor: 'pointer',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}
            >
              <Avatar name={pin.seller.name} url={pin.seller.avatarUrl} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{pin.seller.name}</div>
                <div style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>{pin.title}</div>
                {pin.priceLabel && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{pin.priceLabel}</div>
                )}
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>
                  {PIN_CATEGORY_LABELS[pin.category as PinCategory]} ·{' '}
                  {formatDistance(pin.distanceKm)}
                </div>
              </div>
            </button>
          </li>
        ))}
        {!loading && pins.length === 0 && (
          <li style={{ padding: '1.5rem', color: 'var(--muted)', textAlign: 'center' }}>
            Brak pinezek w tym obszarze
          </li>
        )}
      </ul>
    </aside>
  );
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (url) {
    return (
      <img
        src={url}
        alt=""
        width={40}
        height={40}
        style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }

  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'var(--accent)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

'use client';

import { PIN_CATEGORIES, PIN_CATEGORY_LABELS } from '@freshmarket/shared';
import { CategoryIcon } from './CategoryIcon';

export function MapLegend() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        zIndex: 5,
        background: 'rgba(255,255,255,0.92)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '0.5rem 0.65rem',
        fontSize: '0.75rem',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.4rem 0.75rem',
        maxWidth: 'calc(100% - 24px)',
      }}
    >
      {PIN_CATEGORIES.map((cat) => (
        <span
          key={cat}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            color: 'var(--text)',
          }}
        >
          <CategoryIcon category={cat} size={18} />
          {PIN_CATEGORY_LABELS[cat]}
        </span>
      ))}
    </div>
  );
}

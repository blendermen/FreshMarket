'use client';

import type { MapCenter, PlaceSuggestion } from '@freshmarket/shared';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { fetchPlaceSuggestions } from '@/lib/api';

export interface PlaceSearchPayload {
  place: string;
  center?: MapCenter;
}

interface PlaceSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (payload: PlaceSearchPayload) => void;
  loading?: boolean;
}

const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 3;

export function PlaceSearchInput({
  value,
  onChange,
  onSearch,
  loading = false,
}: PlaceSearchInputProps) {
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (value.trim().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        const items = await fetchPlaceSuggestions(value, controller.signal);
        setSuggestions(items);
        setOpen(items.length > 0);
        setActiveIndex(-1);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setSuggestions([]);
          setOpen(false);
        }
      } finally {
        setSuggestLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const pickSuggestion = useCallback(
    (item: PlaceSuggestion) => {
      onChange(item.label);
      setOpen(false);
      setSuggestions([]);
      onSearch({
        place: item.label,
        center: {
          latitude: item.latitude,
          longitude: item.longitude,
          zoom: item.zoom,
        },
      });
    },
    [onChange, onSearch],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const item = suggestions[activeIndex];
      if (item) pickSuggestion(item);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <input
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder="Miejscowość lub ulica, np. Marki lub ul. Lipowa 3, Marki"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (e.target.value.trim().length >= MIN_QUERY_LENGTH) {
            setOpen(true);
          }
        }}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        style={{
          width: '100%',
          padding: '0.6rem 1rem',
          border: '1px solid var(--border)',
          borderRadius: 999,
          background: 'var(--bg)',
        }}
      />
      {open && (suggestions.length > 0 || suggestLoading) && (
        <ul
          id={listId}
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            margin: 0,
            padding: '0.35rem 0',
            listStyle: 'none',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            boxShadow: 'var(--shadow)',
            maxHeight: 280,
            overflowY: 'auto',
            zIndex: 100,
          }}
        >
          {suggestLoading && suggestions.length === 0 && (
            <li style={{ padding: '0.6rem 1rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Szukam…
            </li>
          )}
          {suggestions.map((item, index) => (
            <li key={`${item.latitude}-${item.longitude}-${item.label}`} role="option">
              <button
                type="button"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => pickSuggestion(item)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: index === activeIndex ? '#eef5eb' : 'transparent',
                  padding: '0.6rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  lineHeight: 1.35,
                  color: 'var(--text)',
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

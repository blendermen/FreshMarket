'use client';

import type { PinListItem } from '@freshmarket/shared';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef } from 'react';

const OSM_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

interface MapViewProps {
  center: { latitude: number; longitude: number; zoom?: number } | null;
  pins: PinListItem[];
  selectedId: string | null;
  onSelectPin: (id: string) => void;
}

export function MapView({ center, pins, selectedId, onSelectPin }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const defaultCenter: [number, number] = [21.0, 52.1];
    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: defaultCenter,
      zoom: 6,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      markersRef.current.forEach((m) => m.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !center) return;
    map.flyTo({
      center: [center.longitude, center.latitude],
      zoom: center.zoom ?? 11,
      essential: true,
    });
  }, [center]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const pin of pins) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'pin-marker';
      el.title = pin.title;
      el.style.cssText = `
        width: 28px; height: 28px; border-radius: 50%;
        border: 2px solid #fff;
        background: ${pin.id === selectedId ? '#1b4332' : '#2d6a4f'};
        cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.25);
      `;
      el.addEventListener('click', () => onSelectPin(pin.id));

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([pin.longitude, pin.latitude])
        .addTo(map);
      markersRef.current.push(marker);
    }
  }, [pins, selectedId, onSelectPin]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: 280, borderRadius: 'inherit' }}
    />
  );
}

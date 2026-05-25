import type { PinCategory } from '../categories';

export interface PinListItem {
  id: string;
  title: string;
  description: string;
  category: PinCategory;
  latitude: number;
  longitude: number;
  priceLabel: string | null;
  distanceKm: number | null;
  photoUrls: string[];
  seller: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface PinsResponse {
  center: { latitude: number; longitude: number } | null;
  placeName: string | null;
  pins: PinListItem[];
}

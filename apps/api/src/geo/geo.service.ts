import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GeocodedPlace {
  placeName: string;
  latitude: number;
  longitude: number;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);

  constructor(private readonly config: ConfigService) {}

  async geocodePlace(place: string): Promise<GeocodedPlace> {
    const params = new URLSearchParams({
      q: place,
      format: 'json',
      limit: '1',
      countrycodes: 'pl',
    });

    const userAgent = this.config.get(
      'NOMINATIM_USER_AGENT',
      'FreshMarket/1.0 (contact@example.com)',
    );

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          'User-Agent': userAgent,
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      this.logger.warn(`Nominatim error: ${response.status}`);
      throw new ServiceUnavailableException('Geocoding service unavailable');
    }

    const results = (await response.json()) as NominatimResult[];
    const first = results[0];
    if (!first) {
      throw new ServiceUnavailableException('Place not found');
    }

    return {
      placeName: first.display_name,
      latitude: parseFloat(first.lat),
      longitude: parseFloat(first.lon),
    };
  }

  /** Haversine distance in km */
  distanceKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}

import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GeocodedPlace {
  placeName: string;
  latitude: number;
  longitude: number;
  zoom: number;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  class?: string;
  type?: string;
  addresstype?: string;
  importance?: number;
}

interface ParsedAddressQuery {
  freeText: string;
  street?: string;
  city?: string;
}

const STREET_HINT =
  /\b(ul\.?|ulica|al\.?|aleja|os\.?|osiedle|pl\.?|plac|rynek|skwer)\b|\d+[a-zA-Z]?\b/i;

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);

  constructor(private readonly config: ConfigService) {}

  async geocodePlace(place: string): Promise<GeocodedPlace> {
    const parsed = this.parseAddressQuery(place.trim());
    const preferStreet = STREET_HINT.test(place);

    let results: NominatimResult[] = [];

    if (parsed.street && parsed.city) {
      results = await this.nominatimSearch({
        street: parsed.street,
        city: parsed.city,
        country: 'Poland',
      });
    }

    if (results.length === 0) {
      results = await this.nominatimSearch({ q: parsed.freeText });
    }

    const best = this.pickBestResult(results, preferStreet);
    if (!best) {
      throw new ServiceUnavailableException('Nie znaleziono miejscowości ani adresu');
    }

    return {
      placeName: best.display_name,
      latitude: parseFloat(best.lat),
      longitude: parseFloat(best.lon),
      zoom: this.zoomForResult(best),
    };
  }

  /** Parses "ul. Lipowa 3, Marki" or "Marki, ul. Lipowa 3" */
  private parseAddressQuery(query: string): ParsedAddressQuery {
    const parts = query
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length >= 2) {
      const streetIdx = parts.findIndex((p) => STREET_HINT.test(p));
      if (streetIdx >= 0) {
        const street = parts[streetIdx];
        const city = parts.filter((_, i) => i !== streetIdx).join(', ');
        return { freeText: query, street, city };
      }
    }

    return { freeText: query };
  }

  private async nominatimSearch(
    params: Record<string, string>,
  ): Promise<NominatimResult[]> {
    const search = new URLSearchParams({
      format: 'json',
      limit: '8',
      countrycodes: 'pl',
      'accept-language': 'pl',
      ...params,
    });

    const userAgent = this.config.get(
      'NOMINATIM_USER_AGENT',
      'FreshMarket/1.0 (contact@example.com)',
    );

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${search.toString()}`,
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

    return (await response.json()) as NominatimResult[];
  }

  private pickBestResult(
    results: NominatimResult[],
    preferStreet: boolean,
  ): NominatimResult | undefined {
    if (results.length === 0) return undefined;
    if (!preferStreet) return results[0];

    const scored = [...results].sort(
      (a, b) => this.scoreResult(b, preferStreet) - this.scoreResult(a, preferStreet),
    );
    return scored[0];
  }

  private scoreResult(result: NominatimResult, preferStreet: boolean): number {
    const type = result.type ?? '';
    const addresstype = result.addresstype ?? '';
    const cls = result.class ?? '';
    let score = result.importance ?? 0;

    const streetTypes = new Set([
      'road',
      'house',
      'building',
      'residential',
      'hamlet',
      'neighbourhood',
      'suburb',
    ]);

    if (preferStreet) {
      if (cls === 'highway' || streetTypes.has(addresstype) || streetTypes.has(type)) {
        score += 2;
      }
      if (addresstype === 'house' || type === 'house') score += 1;
    } else {
      if (['city', 'town', 'village', 'municipality'].includes(type)) score += 1;
    }

    return score;
  }

  private zoomForResult(result: NominatimResult): number {
    const type = result.type ?? '';
    const addresstype = result.addresstype ?? '';

    if (addresstype === 'house' || type === 'house' || type === 'building') return 17;
    if (clsHighway(result) || addresstype === 'road' || type === 'road') return 15;
    if (['suburb', 'neighbourhood', 'quarter'].includes(type)) return 13;
    if (['city', 'town', 'village'].includes(type)) return 11;
    return 12;
  }

  /** Haversine distance in km */
  distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

function clsHighway(result: NominatimResult): boolean {
  return result.class === 'highway';
}

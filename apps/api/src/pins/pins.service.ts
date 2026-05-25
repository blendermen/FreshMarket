import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  createPinSchema,
  pinsQuerySchema,
  updatePinSchema,
  type PinListItem,
  type PinsResponse,
} from '@freshmarket/shared';
import { GeoService } from '../geo/geo.service';
import { MediaService } from '../media/media.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PinsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geo: GeoService,
    private readonly media: MediaService,
  ) {}

  async findMany(query: unknown): Promise<PinsResponse> {
    const params = pinsQuerySchema.parse(query);

    let centerLat = params.lat;
    let centerLng = params.lng;
    let placeName: string | null = null;

    if (params.place) {
      const geocoded = await this.geo.geocodePlace(params.place);
      centerLat = geocoded.latitude;
      centerLng = geocoded.longitude;
      placeName = geocoded.placeName;
    }

    const pins = await this.prisma.pin.findMany({
      where: params.category ? { category: params.category } : undefined,
      include: {
        photos: { orderBy: { sortOrder: 'asc' } },
        user: { select: { id: true, name: true, avatarKey: true } },
      },
    });

    const withDistance = pins
      .map((pin) => {
        const distanceKm =
          centerLat != null && centerLng != null
            ? this.geo.distanceKm(centerLat, centerLng, pin.latitude, pin.longitude)
            : null;

        return {
          pin,
          distanceKm,
        };
      })
      .filter(({ distanceKm }) => {
        if (distanceKm == null) return true;
        return distanceKm <= params.radiusKm;
      })
      .sort((a, b) => {
        if (a.distanceKm == null || b.distanceKm == null) return 0;
        return a.distanceKm - b.distanceKm;
      });

    const items: PinListItem[] = withDistance.map(({ pin, distanceKm }) =>
      this.toListItem(pin, distanceKm),
    );

    return {
      center:
        centerLat != null && centerLng != null
          ? { latitude: centerLat, longitude: centerLng }
          : null,
      placeName,
      pins: items,
    };
  }

  async findOne(id: string): Promise<PinListItem> {
    const pin = await this.prisma.pin.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { sortOrder: 'asc' } },
        user: { select: { id: true, name: true, avatarKey: true } },
      },
    });
    if (!pin) {
      throw new NotFoundException('Pin not found');
    }
    return this.toListItem(pin, null);
  }

  async create(userId: string, input: unknown) {
    const data = createPinSchema.parse(input);
    const pin = await this.prisma.pin.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        latitude: data.latitude,
        longitude: data.longitude,
        priceLabel: data.priceLabel,
        userId,
        photos: data.photoKeys?.length
          ? {
              create: data.photoKeys.map((objectKey, index) => ({
                objectKey,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: {
        photos: true,
        user: { select: { id: true, name: true, avatarKey: true } },
      },
    });
    return this.toListItem(pin, null);
  }

  async update(userId: string, id: string, input: unknown) {
    const pin = await this.prisma.pin.findUnique({ where: { id } });
    if (!pin) throw new NotFoundException('Pin not found');
    if (pin.userId !== userId) throw new ForbiddenException();

    const data = updatePinSchema.parse(input);
    const updated = await this.prisma.pin.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        latitude: data.latitude,
        longitude: data.longitude,
        priceLabel: data.priceLabel,
      },
      include: {
        photos: { orderBy: { sortOrder: 'asc' } },
        user: { select: { id: true, name: true, avatarKey: true } },
      },
    });
    return this.toListItem(updated, null);
  }

  async remove(userId: string, id: string) {
    const pin = await this.prisma.pin.findUnique({ where: { id } });
    if (!pin) throw new NotFoundException('Pin not found');
    if (pin.userId !== userId) throw new ForbiddenException();
    await this.prisma.pin.delete({ where: { id } });
    return { ok: true };
  }

  private toListItem(
    pin: {
      id: string;
      title: string;
      description: string;
      category: string;
      latitude: number;
      longitude: number;
      priceLabel: string | null;
      photos: { objectKey: string }[];
      user: { id: string; name: string; avatarKey: string | null };
    },
    distanceKm: number | null,
  ): PinListItem {
    return {
      id: pin.id,
      title: pin.title,
      description: pin.description,
      category: pin.category as PinListItem['category'],
      latitude: pin.latitude,
      longitude: pin.longitude,
      priceLabel: pin.priceLabel,
      distanceKm,
      photoUrls: pin.photos.map((p) => this.media.toPublicUrl(p.objectKey)),
      seller: {
        id: pin.user.id,
        name: pin.user.name,
        avatarUrl: pin.user.avatarKey
          ? this.media.toPublicUrl(pin.user.avatarKey)
          : null,
      },
    };
  }
}

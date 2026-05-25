import { z } from 'zod';
import { PIN_CATEGORIES } from '../categories';

export const createPinSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().min(10).max(2000),
  category: z.enum(PIN_CATEGORIES),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  priceLabel: z.string().max(80).optional(),
  photoKeys: z.array(z.string().min(1)).max(8).optional(),
});

export const updatePinSchema = createPinSchema.partial();

export const pinsQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  place: z.string().min(2).max(200).optional(),
  radiusKm: z.coerce.number().min(1).max(200).default(50),
  category: z.enum(PIN_CATEGORIES).optional(),
});

export type CreatePinInput = z.infer<typeof createPinSchema>;
export type UpdatePinInput = z.infer<typeof updatePinSchema>;
export type PinsQueryInput = z.infer<typeof pinsQuerySchema>;

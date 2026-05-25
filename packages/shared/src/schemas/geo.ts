import { z } from 'zod';

export const geoSuggestQuerySchema = z.object({
  q: z.string().trim().min(3).max(120),
});

export type GeoSuggestQuery = z.infer<typeof geoSuggestQuerySchema>;

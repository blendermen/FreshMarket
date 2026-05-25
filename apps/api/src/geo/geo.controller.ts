import { Controller, Get, Query } from '@nestjs/common';
import { geoSuggestQuerySchema } from '@freshmarket/shared';
import { GeoService } from './geo.service';

@Controller('geo')
export class GeoController {
  constructor(private readonly geo: GeoService) {}

  @Get('suggest')
  suggest(@Query() query: Record<string, string>) {
    const { q } = geoSuggestQuerySchema.parse(query);
    return this.geo.suggestPlaces(q);
  }
}

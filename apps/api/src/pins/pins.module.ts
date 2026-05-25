import { Module } from '@nestjs/common';
import { GeoModule } from '../geo/geo.module';
import { MediaModule } from '../media/media.module';
import { PinsController } from './pins.controller';
import { PinsService } from './pins.service';

@Module({
  imports: [GeoModule, MediaModule],
  controllers: [PinsController],
  providers: [PinsService],
})
export class PinsModule {}

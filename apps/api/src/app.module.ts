import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { GeoModule } from './geo/geo.module';
import { MediaModule } from './media/media.module';
import { PinsModule } from './pins/pins.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PinsModule,
    MediaModule,
    GeoModule,
  ],
})
export class AppModule {}

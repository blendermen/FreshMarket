import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, type JwtPayload } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MediaService } from './media.service';

class PresignDto {
  contentType!: string;
}

@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post('presign')
  @UseGuards(JwtAuthGuard)
  presign(@CurrentUser() user: JwtPayload, @Body() body: PresignDto) {
    return this.media.createPresignedUpload(user.sub, body.contentType);
  }
}

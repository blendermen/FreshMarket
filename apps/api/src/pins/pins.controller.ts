import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, type JwtPayload } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PinsService } from './pins.service';

@Controller('pins')
export class PinsController {
  constructor(private readonly pins: PinsService) {}

  @Get()
  findMany(@Query() query: Record<string, string>) {
    return this.pins.findMany(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pins.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.pins.create(user.sub, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.pins.update(user.sub, id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.pins.remove(user.sub, id);
  }
}

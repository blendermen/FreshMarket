import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { GoogleProfile } from './auth.service';

class RefreshDto {
  refreshToken!: string;
}

class GoogleSyncDto {
  googleId!: string;
  email!: string;
  name!: string;
  avatarUrl?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() body: unknown) {
    return this.auth.register(body);
  }

  @Post('login')
  login(@Body() body: unknown) {
    return this.auth.login(body);
  }

  @Post('refresh')
  refresh(@Body() body: RefreshDto) {
    return this.auth.refresh(body.refreshToken);
  }

  /** Called by Next.js after Google OAuth to obtain API JWT tokens */
  @Post('google')
  googleSync(@Body() body: GoogleSyncDto) {
    const profile: GoogleProfile = {
      googleId: body.googleId,
      email: body.email,
      name: body.name,
      avatarUrl: body.avatarUrl,
    };
    return this.auth.loginWithGoogle(profile);
  }
}

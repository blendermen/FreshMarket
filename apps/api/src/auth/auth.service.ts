import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { registerSchema, loginSchema } from '@freshmarket/shared';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(input: unknown): Promise<TokenPair> {
    const data = registerSchema.parse(input);
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        provider: AuthProvider.credentials,
      },
    });
    return this.issueTokens(user.id, user.email);
  }

  async login(input: unknown): Promise<TokenPair> {
    const data = loginSchema.parse(input);
    const user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user.id, user.email);
  }

  async loginWithGoogle(profile: GoogleProfile): Promise<TokenPair> {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: profile.googleId }, { email: profile.email }],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          googleId: profile.googleId,
          provider: AuthProvider.google,
        },
      });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.googleId,
          provider: AuthProvider.google,
          name: profile.name,
        },
      });
    }

    return this.issueTokens(user.id, user.email);
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string; type: string }>(
        refreshToken,
        { secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET') },
      );
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException();
      }
      return this.issueTokens(payload.sub, payload.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async issueTokens(userId: string, email: string): Promise<TokenPair> {
    const accessToken = await this.jwt.signAsync({ sub: userId, email });
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, email, type: 'refresh' },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    );
    return { accessToken, refreshToken };
  }
}

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcryptjs";
import type { AuthSessionDto, AuthTokensDto, LoginDto } from "@tracker/types";
import { UsersService } from "../users/users.service";
import { AuthRepository } from "./auth.repository";

type TokenTtl = `${number}${"ms" | "s" | "m" | "h" | "d" | "w" | "y"}`;

const DURATION_PATTERN = /^\d+(ms|s|m|h|d|w|y)$/;

function resolveTokenTtl(duration: string | undefined, fallback: TokenTtl): TokenTtl {
  if (duration && DURATION_PATTERN.test(duration)) {
    return duration as TokenTtl;
  }

  return fallback;
}

function toExpiryDate(duration: TokenTtl): Date {
  const value = Number.parseInt(duration, 10);
  if (duration.endsWith("ms")) {
    return new Date(Date.now() + value);
  }
  if (duration.endsWith("s")) {
    return new Date(Date.now() + value * 1000);
  }
  if (duration.endsWith("m")) {
    return new Date(Date.now() + value * 60 * 1000);
  }
  if (duration.endsWith("h")) {
    return new Date(Date.now() + value * 60 * 60 * 1000);
  }
  if (duration.endsWith("d")) {
    return new Date(Date.now() + value * 24 * 60 * 60 * 1000);
  }
  if (duration.endsWith("w")) {
    return new Date(Date.now() + value * 7 * 24 * 60 * 60 * 1000);
  }
  if (duration.endsWith("y")) {
    return new Date(Date.now() + value * 365 * 24 * 60 * 60 * 1000);
  }
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<AuthSessionDto> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const organizations = await this.usersService.listOrganizations(user.id);
    const tokens = await this.issueTokens(user.id, user.email, user.role);

    return {
      user: this.usersService.toUserSummary(user),
      organizations,
      tokens,
    };
  }

  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    let payload: { sub: string; email: string; role: "ADMIN" | "USER" };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? "replace-me-refresh",
      });
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const tokens = await this.authRepository.findValidRefreshTokens(payload.sub);

    const matchedToken = await this.findMatchingToken(tokens, refreshToken);

    if (!matchedToken) {
      throw new UnauthorizedException("Refresh token has been revoked");
    }

    await this.authRepository.revokeRefreshToken(matchedToken.id);
    return this.issueTokens(payload.sub, payload.email, payload.role);
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return {
      user: this.usersService.toUserSummary(user),
      organizations: await this.usersService.listOrganizations(user.id),
    };
  }

  private async issueTokens(userId: string, email: string, role: "ADMIN" | "USER"): Promise<AuthTokensDto> {
    const accessTtl = resolveTokenTtl(process.env.JWT_ACCESS_TTL, "15m");
    const refreshTtl = resolveTokenTtl(process.env.JWT_REFRESH_TTL, "7d");
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET ?? "replace-me-access",
        expiresIn: accessTtl,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET ?? "replace-me-refresh",
        expiresIn: refreshTtl,
      }),
    ]);

    await this.authRepository.createRefreshToken(userId, await hash(refreshToken, 10), toExpiryDate(refreshTtl));

    return {
      accessToken,
      refreshToken,
    };
  }

  private async findMatchingToken(
    tokens: Array<{ id: string; tokenHash: string }>,
    refreshToken: string,
  ): Promise<{ id: string; tokenHash: string } | null> {
    for (const token of tokens) {
      const isMatch = await compare(refreshToken, token.tokenHash);
      if (isMatch) {
        return token;
      }
    }

    return null;
  }
}

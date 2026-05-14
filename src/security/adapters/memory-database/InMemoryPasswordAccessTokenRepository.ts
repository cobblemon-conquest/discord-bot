import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { randomUUID } from 'crypto';

import { PasswordAccessToken } from '../../domain/models/PasswordAccessToken';
import { PasswordDefinitionUtility } from '../../application/utils/PasswordDefinitionUtility';
import { PasswordAccessTokenRepository } from '../../application/ports/PasswordAccessTokenRepository';

interface PasswordAccessTokenData {
  serviceName: string;
  expiresAt: number;
}

@Injectable()
export class InMemoryPasswordAccessTokenRepository implements PasswordAccessTokenRepository {
  private readonly tokens = new Map<string, PasswordAccessTokenData>();

  public async create(serviceName: string, expiresInMs: number): Promise<PasswordAccessToken> {
    const token = randomUUID();
    const normalizedServiceName = PasswordDefinitionUtility.normalizeServiceName(serviceName);
    const expiresAt = Date.now() + expiresInMs;

    this.tokens.set(token, {
      serviceName: normalizedServiceName,
      expiresAt,
    });

    return new PasswordAccessToken(token, normalizedServiceName, expiresAt);
  }

  public async consume(token: string): Promise<PasswordAccessToken | null> {
    const tokenData = this.tokens.get(token);
    if (!tokenData) {
      return null;
    }

    this.tokens.delete(token);

    if (tokenData.expiresAt <= Date.now()) {
      return null;
    }

    return new PasswordAccessToken(token, tokenData.serviceName, tokenData.expiresAt);
  }

  public cleanupExpiredTokens(): void {
    for (const [token, tokenData] of this.tokens.entries()) {
      if (tokenData.expiresAt <= Date.now()) {
        this.tokens.delete(token);
      }
    }
  }

  @Cron('*/15 * * * * *')
  public cleanupExpiredTokensCron(): void {
    this.cleanupExpiredTokens();
  }
}
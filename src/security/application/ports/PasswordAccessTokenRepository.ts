import { PasswordAccessToken } from '../../domain/models/PasswordAccessToken';

export const PasswordAccessTokenRepositoryToken = Symbol('PasswordAccessTokenRepository');

export interface PasswordAccessTokenRepository {
  create(serviceName: string, expiresInMs: number): Promise<PasswordAccessToken>;
  consume(token: string): Promise<PasswordAccessToken | null>;
  cleanupExpiredTokens(): void;
}
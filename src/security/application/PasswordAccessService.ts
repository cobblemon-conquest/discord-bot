import { Inject, Injectable } from '@nestjs/common';

import { PasswordDefinitionRepositoryToken } from './ports/PasswordDefinitionRepository';
import { PasswordAccessTokenRepositoryToken } from './ports/PasswordAccessTokenRepository';
import type { PasswordDefinitionRepository } from './ports/PasswordDefinitionRepository';
import type { PasswordAccessTokenRepository } from './ports/PasswordAccessTokenRepository';
import { SecurityUrlUtility } from './utils/SecurityUrlUtility';

@Injectable()
export class PasswordAccessService {
  private readonly tokenExpirationMs = 60_000;

  public constructor(
    @Inject(PasswordDefinitionRepositoryToken)
    private readonly passwordDefinitionRepository: PasswordDefinitionRepository,
    @Inject(PasswordAccessTokenRepositoryToken)
    private readonly passwordAccessTokenRepository: PasswordAccessTokenRepository,
  ) {}

  public async createPasswordAccessUrl(serviceName: string): Promise<string | null> {
    const passwordDefinition = this.passwordDefinitionRepository.findByName(serviceName);
    if (!passwordDefinition) {
      return null;
    }

    const accessToken = await this.passwordAccessTokenRepository.create(
      passwordDefinition.getServiceName(),
      this.tokenExpirationMs,
    );

    return SecurityUrlUtility.createSecretUrl(accessToken.getToken());
  }

  public async consumePassword(token: string): Promise<string | null> {
    const accessToken = await this.passwordAccessTokenRepository.consume(token);
    if (!accessToken) {
      return null;
    }

    const def = this.passwordDefinitionRepository.findByName(accessToken.getServiceName());
    if (!def) return null;

    return JSON.stringify({ username: def.getUsername(), password: def.getPassword() });
  }
}
import { Module } from '@nestjs/common';

import { OtpCodeService } from './application/OtpCodeService';
import { OtpDefinitionRepositoryToken } from './application/ports/OtpDefinitionRepository';
import { PasswordAccessService } from './application/PasswordAccessService';
import { PasswordAccessTokenRepositoryToken } from './application/ports/PasswordAccessTokenRepository';
import { PasswordDefinitionRepositoryToken } from './application/ports/PasswordDefinitionRepository';
import { createSecurityOtpCommandProviders } from './adapters/discord/SecurityDiscordAdapter';
import { createSecurityPasswordCommandProviders } from './adapters/discord/createSecurityPasswordCommandProviders';
import { OtpEnvironmentRepositoryAdapter } from './adapters/environment/OtpEnvironmentRepositoryAdapter';
import { PasswordEnvironmentRepositoryAdapter } from './adapters/environment/PasswordEnvironmentRepositoryAdapter';
import { InMemoryPasswordAccessTokenRepository } from './adapters/memory-database/InMemoryPasswordAccessTokenRepository';
import { SecurityController } from './adapters/http/SecurityController';

@Module({
  controllers: [SecurityController],
  providers: [
    OtpCodeService,
    PasswordAccessService,
    {
      provide: OtpDefinitionRepositoryToken,
      useClass: OtpEnvironmentRepositoryAdapter,
    },
    {
      provide: PasswordDefinitionRepositoryToken,
      useClass: PasswordEnvironmentRepositoryAdapter,
    },
    {
      provide: PasswordAccessTokenRepositoryToken,
      useClass: InMemoryPasswordAccessTokenRepository,
    },
    ...createSecurityOtpCommandProviders(),
    ...createSecurityPasswordCommandProviders(),
  ],
})
export class SecurityModule {}
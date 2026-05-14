import { Module } from '@nestjs/common';

import { OtpCodeService } from './application/OtpCodeService';
import { OtpDefinitionRepositoryToken } from './application/ports/OtpDefinitionRepository';
import { PasswordAccessService } from './application/PasswordAccessService';
import { PasswordAccessTokenRepositoryToken } from './application/ports/PasswordAccessTokenRepository';
import { PasswordDefinitionRepositoryToken } from './application/ports/PasswordDefinitionRepository';
import { SecurityPrefixCommandAdapter } from './adapters/discord/SecurityPrefixCommandAdapter';
import { OtpEnvironmentRepositoryAdapter } from './adapters/environment/OtpEnvironmentRepositoryAdapter';
import { PasswordEnvironmentRepositoryAdapter } from './adapters/environment/PasswordEnvironmentRepositoryAdapter';
import { InMemoryPasswordAccessTokenRepository } from './adapters/memory-database/InMemoryPasswordAccessTokenRepository';
import { SecurityController } from './adapters/http/SecurityController';

@Module({
  controllers: [SecurityController],
  providers: [
    OtpCodeService,
    PasswordAccessService,
    SecurityPrefixCommandAdapter,
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
  ],
})
export class SecurityModule {}
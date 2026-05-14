import { Module } from '@nestjs/common';

import { OtpCodeService } from './application/OtpCodeService';
import { OtpDefinitionRepositoryToken } from './application/ports/OtpDefinitionRepository';
import { SecurityDiscordAdapter } from './adapters/discord/SecurityDiscordAdapter';
import { OtpEnvironmentRepositoryAdapter } from './adapters/environment/OtpEnvironmentRepositoryAdapter';

@Module({
  providers: [
    OtpCodeService,
    SecurityDiscordAdapter,
    {
      provide: OtpDefinitionRepositoryToken,
      useClass: OtpEnvironmentRepositoryAdapter,
    },
  ],
})
export class SecurityModule {}
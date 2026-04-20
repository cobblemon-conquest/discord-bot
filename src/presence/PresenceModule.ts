import { Module } from '@nestjs/common';
import { RefreshDiscordPresenceHandler } from './application/handlers/RefreshDiscordPresenceHandler';
import {
  GameServerPopulationPortToken,
  type GameServerPopulationPort,
} from './application/ports/GameServerPopulationPort';
import {
  DiscordPresencePortToken,
  type DiscordPresencePort,
} from './application/ports/DiscordPresencePort';
import {
  PresenceStateRepositoryToken,
  type PresenceStateRepository,
} from './application/ports/PresenceStateRepository';
import { MinecraftServerPopulationAdapter } from './adapters/minecraft/MinecraftServerPopulationAdapter';
import { DiscordPresenceAdapter } from './adapters/discord/DiscordPresenceAdapter';
import { InMemoryPresenceStateRepository } from './adapters/memory/InMemoryPresenceStateRepository';
import { PresenceScheduler } from './adapters/scheduler/PresenceScheduler';

@Module({
  providers: [
    RefreshDiscordPresenceHandler,
    PresenceScheduler,
    {
      provide: GameServerPopulationPortToken,
      useClass: MinecraftServerPopulationAdapter,
    },
    {
      provide: DiscordPresencePortToken,
      useClass: DiscordPresenceAdapter,
    },
    {
      provide: PresenceStateRepositoryToken,
      useClass: InMemoryPresenceStateRepository,
    },
  ],
})
export class PresenceModule {}

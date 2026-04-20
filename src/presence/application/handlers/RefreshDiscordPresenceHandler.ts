import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  type GameServerPopulationPort,
  GameServerPopulationPortToken,
} from '../ports/GameServerPopulationPort';
import {
  type DiscordPresencePort,
  DiscordPresencePortToken,
} from '../ports/DiscordPresencePort';
import {
  type PresenceStateRepository,
  PresenceStateRepositoryToken,
} from '../ports/PresenceStateRepository';

@Injectable()
export class RefreshDiscordPresenceHandler {
  private readonly logger = new Logger(RefreshDiscordPresenceHandler.name);
  private readonly failureThreshold: number;

  constructor(
    @Inject(GameServerPopulationPortToken)
    private readonly gameServerPopulationPort: GameServerPopulationPort,
    @Inject(DiscordPresencePortToken)
    private readonly discordPresencePort: DiscordPresencePort,
    @Inject(PresenceStateRepositoryToken)
    private readonly presenceStateRepository: PresenceStateRepository,
  ) {
    this.failureThreshold = this.resolveFailureThreshold();
  }

  async execute(): Promise<void> {
    const state = await this.presenceStateRepository.getState();

    try {
      const onlinePlayers =
        await this.gameServerPopulationPort.getOnlinePlayers();
      const shouldUpdatePresence =
        state.isOffline || state.lastOnlinePlayers !== onlinePlayers;

      if (shouldUpdatePresence) {
        await this.discordPresencePort.setOnlinePlayers(onlinePlayers);
        this.logger.log(`Updated Discord presence to ${onlinePlayers} players online.`);
      }

      await this.presenceStateRepository.saveState({
        isOffline: false,
        consecutiveFailures: 0,
        lastOnlinePlayers: onlinePlayers,
      });
    } catch (error) {
      const nextFailures = state.consecutiveFailures + 1;
      const shouldMarkOffline =
        !state.isOffline && nextFailures >= this.failureThreshold;

      if (shouldMarkOffline) {
        await this.discordPresencePort.setOffline();
        this.logger.warn(
          `Server health check failed ${nextFailures} times. Marked Discord presence as offline.`,
        );
      } else {
        this.logger.warn(
          `Server health check failed (${nextFailures}/${this.failureThreshold}).`,
        );
      }

      if (error instanceof Error) {
        this.logger.warn(error.message);
      }

      await this.presenceStateRepository.saveState({
        isOffline: shouldMarkOffline ? true : state.isOffline,
        consecutiveFailures: nextFailures,
        lastOnlinePlayers: state.lastOnlinePlayers,
      });
    }
  }

  private resolveFailureThreshold(): number {
    const configured = Number.parseInt(
      process.env.PRESENCE_FAILURE_THRESHOLD ?? '2',
      10,
    );

    if (!Number.isFinite(configured) || configured <= 0) {
      return 2;
    }

    return configured;
  }
}

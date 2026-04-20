import { Injectable, Logger } from '@nestjs/common';
import { ActivityType, Client } from 'discord.js';
import { type DiscordPresencePort } from 'src/presence/application/ports/DiscordPresencePort';

@Injectable()
export class DiscordPresenceAdapter implements DiscordPresencePort {
  private readonly logger = new Logger(DiscordPresenceAdapter.name);

  constructor(private readonly client: Client) {}

  async setOnlinePlayers(onlinePlayers: number): Promise<boolean> {
    const botUser = this.client.user;
    if (!botUser) {
      this.logger.warn('Discord client is not ready yet. Skipping presence update.');
      return false;
    }

    botUser.setPresence({
      status: 'online',
      activities: [
        {
          name: `${onlinePlayers} jugadores online`,
          type: ActivityType.Watching
        }
      ],
    });

    return true;
  }

  async setOffline(): Promise<boolean> {
    const botUser = this.client.user;
    if (!botUser) {
      this.logger.warn(
        'Discord client is not ready yet. Skipping offline presence update.',
      );
      return false;
    }

    botUser.setPresence({
      status: 'idle',
      activities: [
        {
          name: 'Servidor offline',
          type: ActivityType.Watching,
        },
      ],
    });

    return true;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { status } from 'minecraft-server-util';
import { type GameServerPopulationPort } from 'src/presence/application/ports/GameServerPopulationPort';

const DEFAULT_SERVER_HOST = '127.0.0.1';
const DEFAULT_SERVER_PORT = 25577;
const DEFAULT_QUERY_TIMEOUT_MS = 5000;

@Injectable()
export class MinecraftServerPopulationAdapter
  implements GameServerPopulationPort
{
  private readonly logger = new Logger(MinecraftServerPopulationAdapter.name);
  private readonly host = process.env.MC_SERVER_HOST ?? DEFAULT_SERVER_HOST;
  private readonly port = this.resolveServerPort();

  async getOnlinePlayers(): Promise<number> {
    this.logger.debug(
      `Polling Minecraft server player count from ${this.host}:${this.port}`,
    );

    const response = await status(this.host, this.port, {
      timeout: DEFAULT_QUERY_TIMEOUT_MS,
      enableSRV: false,
    });

    const onlinePlayers = response.players?.online;
    if (typeof onlinePlayers !== 'number') {
      throw new Error('Could not read online players from Minecraft status response.');
    }

    this.logger.debug(`Minecraft server reports ${onlinePlayers} players online.`);

    return onlinePlayers;
  }

  private resolveServerPort(): number {
    const configuredPort = Number.parseInt(
      process.env.MC_SERVER_PORT ?? `${DEFAULT_SERVER_PORT}`,
      10,
    );

    if (!Number.isFinite(configuredPort) || configuredPort <= 0) {
      return DEFAULT_SERVER_PORT;
    }

    return configuredPort;
  }
}

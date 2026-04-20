import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { RefreshDiscordPresenceHandler } from 'src/presence/application/handlers/RefreshDiscordPresenceHandler';

const DEFAULT_POLL_INTERVAL_MS = 60_000;

function resolvePollIntervalMs(): number {
  const configured = Number.parseInt(
    process.env.PRESENCE_POLL_INTERVAL_MS ?? `${DEFAULT_POLL_INTERVAL_MS}`,
    10,
  );

  if (!Number.isFinite(configured) || configured <= 0) {
    return DEFAULT_POLL_INTERVAL_MS;
  }

  return configured;
}

const POLL_INTERVAL_MS = resolvePollIntervalMs();

@Injectable()
export class PresenceScheduler implements OnModuleInit {
  private readonly logger = new Logger(PresenceScheduler.name);
  private isRunning = false;

  constructor(
    private readonly refreshDiscordPresenceHandler: RefreshDiscordPresenceHandler,
  ) {}

  onModuleInit(): void {
    this.logger.log(
      `Presence scheduler started with ${POLL_INTERVAL_MS}ms interval.`,
    );
    void this.runRefresh('startup');
  }

  @Interval(POLL_INTERVAL_MS)
  async handleInterval(): Promise<void> {
    await this.runRefresh('interval');
  }

  private async runRefresh(trigger: 'startup' | 'interval'): Promise<void> {
    if (this.isRunning) {
      this.logger.warn(
        `Skipping ${trigger} presence refresh because a previous run is still in progress.`,
      );
      return;
    }

    this.isRunning = true;
    try {
      await this.refreshDiscordPresenceHandler.execute();
    } finally {
      this.isRunning = false;
    }
  }
}

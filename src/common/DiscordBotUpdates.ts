import { Injectable, Logger } from '@nestjs/common';
import { Context, On, Once, type ContextOf } from 'necord';
import { Client } from 'discord.js';

@Injectable()
export class DiscordBotUpdates {
    private readonly logger = new Logger(DiscordBotUpdates.name);

    public constructor(private readonly client: Client) {}

    @Once('clientReady')
    public onReady(@Context() [client]: ContextOf<'clientReady'>) {
        this.logger.log(`Bot logged in as ${client.user.username}`);
    }

    @On('warn')
    public onWarn(@Context() [message]: ContextOf<'warn'>) {
        this.logger.warn(message);
    }
}

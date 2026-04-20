import { Module } from '@nestjs/common';
import { MemberModule } from './members/MemberModule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NecordModule } from 'necord';
import { IntentsBitField } from 'discord.js';
import { ScheduleModule } from '@nestjs/schedule';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from './common/prisma/PrismaModule';
import { ExceptionsModule } from './common/exceptions/ExceptionsModule';
import { DiscordBotUpdates } from './common/DiscordBotUpdates';
import { PresenceModule } from './presence/PresenceModule';
import { HealthController } from './common/health/HealthController';

@Module({
  imports: [
    PrismaModule.forRoot(),
    EventEmitterModule.forRoot(),
    ExceptionsModule,
    ScheduleModule.forRoot(),
    CqrsModule.forRoot(),
    NecordModule.forRoot({
      token: process.env.DISCORD_BOT_TOKEN || '',
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.GuildPresences
      ],
      development: process.env.DISCORD_DEVELOPMENT_GUILD_ID
        ? [process.env.DISCORD_DEVELOPMENT_GUILD_ID]
        : false,
      skipRegistration: false,
    }),
    MemberModule,
    PresenceModule,
  ],
  controllers: [HealthController],
  providers: [DiscordBotUpdates],
})
export class RootModule {}

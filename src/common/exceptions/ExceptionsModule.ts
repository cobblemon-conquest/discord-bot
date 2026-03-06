import { Module } from "@nestjs/common";
import { EventExceptionHandler } from "./application/handlers/EventExceptionHandler";
import { PrismaDeadLetterRepository } from "./adapters/database/PrismaEventErrorRepository";
import { DeadLetterRepositoryToken } from "./application/ports/DeadLetterRepository";
import { DiscoveryModule } from "@nestjs/core";
import { RetryDeadLetterDiscordController } from "./adapters/discord/RetryDeadLetterDiscordController";

@Module({
    imports: [DiscoveryModule],
    controllers: [RetryDeadLetterDiscordController],
    providers: [
        EventExceptionHandler,
        {
            provide: DeadLetterRepositoryToken,
            useClass: PrismaDeadLetterRepository,
        }
    ],
})
export class ExceptionsModule { }
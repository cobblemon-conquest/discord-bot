import { Controller, Post } from "@nestjs/common";
import { EventExceptionHandler } from "../../application/handlers/EventExceptionHandler";

@Controller('exceptions/discord/retry-dead-letter')
export class RetryDeadLetterDiscordController {

    constructor(private readonly eventExceptionHandler: EventExceptionHandler) { }

    @Post(':id')
    async retryDeadLetter(id: number): Promise<void> {
        return this.eventExceptionHandler.retryDeadLetter(id);
    }
}
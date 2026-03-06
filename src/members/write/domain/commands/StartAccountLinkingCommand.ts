import { Command } from "@nestjs/cqrs";

export class StartAccountLinkingCommand extends Command<string> {

    constructor(
        public readonly discordId: string,
        public readonly discordName: string,
    ) {
        super();
    }
}
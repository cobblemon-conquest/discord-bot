import { Command } from "@nestjs/cqrs";

export class EndAccountLinkingCommand extends Command<void> {

    constructor(
        public readonly linkingCode: string,
        public readonly minecraftUuid: string,
        public readonly minecraftName: string,
    ) {
        super();
    }
}
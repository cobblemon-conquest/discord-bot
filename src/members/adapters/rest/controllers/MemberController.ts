import { Body, Controller, Logger, Post, Req } from "@nestjs/common";
import { LinkMinecraftAccountDto, StartAccountLinkingDto } from "../dtos/MemberDto";
import { CommandBus } from "@nestjs/cqrs";
import { StartAccountLinkingCommand } from "src/members/write/domain/commands/StartAccountLinkingCommand";
import { EndAccountLinkingCommand } from "src/members/write/domain/commands/EndAccountLinkingCommand";

@Controller('members')
export class MemberController {

    private static readonly logger = new Logger(MemberController.name);

    constructor(private readonly commandBus: CommandBus) { }

    @Post('/account-link/start')
    async startAccountLinking(@Body() {discordId, discordName}: StartAccountLinkingDto): Promise<string> {
        MemberController.logger.log(`Starting account linking for Discord ID: ${discordId}, Discord Name: ${discordName}`);
        return this.commandBus.execute(new StartAccountLinkingCommand(discordId, discordName));
    }

    @Post('/account-link/finish')
    async linkAccount(@Body() {linkingCode, minecraftUuid, minecraftName}: LinkMinecraftAccountDto) {
        MemberController.logger.log(`Linking Minecraft account with UUID: ${minecraftUuid}, Minecraft Name: ${minecraftName} using Linking Code: ${linkingCode}`);
        return this.commandBus.execute(new EndAccountLinkingCommand(linkingCode, minecraftUuid, minecraftName));
    }
}
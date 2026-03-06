import { Inject, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EndAccountLinkingCommand } from "../../domain/commands/EndAccountLinkingCommand";
import { InvalidLinkingCode } from "../../domain/errors/InvalidLinkingCode";
import { MemberNotFound } from "../../domain/errors/MemberNotFoundByDiscordId";
import { MinecraftAccountAlreadyLinkedError } from "../../domain/errors/MinecraftAccountAlreadyLinked";
import { type LinkingCodeRepository, LinkingCodeRepositoryToken } from "../ports/LinkingCodeRepository";
import { type MemberRepository, MemberRepositoryToken } from "../ports/MemberRepository";

@CommandHandler(EndAccountLinkingCommand)
export class EndAccountLinkingHandler implements ICommandHandler<EndAccountLinkingCommand> {

    private readonly logger = new Logger(EndAccountLinkingHandler.name);

    constructor(
        @Inject(MemberRepositoryToken) private readonly memberRepository: MemberRepository,
        @Inject(LinkingCodeRepositoryToken) private readonly linkingCodeRepository: LinkingCodeRepository,
    ) {}

    async execute({ linkingCode, minecraftUuid, minecraftName }: EndAccountLinkingCommand): Promise<void> {
        const discordId = await this.linkingCodeRepository.findDiscordIdByCode(linkingCode);

        if (!discordId) {
            throw new InvalidLinkingCode(linkingCode);
        }

        const existingMemberWithMinecraft = await this.memberRepository.findByMinecraftUuid(minecraftUuid);
        if (existingMemberWithMinecraft) {
            this.logger.warn(`INCONSISTENT DATA!!!: Attempt to link Minecraft account UUID ${minecraftUuid} (${minecraftName}) which is already linked to Discord ID ${existingMemberWithMinecraft.discordId}`);
            throw new MinecraftAccountAlreadyLinkedError(discordId, existingMemberWithMinecraft.discordId);
        }

        const member = await this.memberRepository.findByDiscordId(discordId);

        if (!member) {
            this.logger.error(`INCONSISTENT DATA!!!: Member not found for Discord ID: ${discordId}. This should not happen as we verified the linking code exists.`);
            throw new MemberNotFound(discordId);
        }

        member.linkMinecraftAccount(minecraftUuid, minecraftName);

        await this.memberRepository.save(member);
        await this.linkingCodeRepository.invalidateCode(linkingCode);

        member.commit();
    }
}
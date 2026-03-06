import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { StartAccountLinkingCommand } from "../../domain/commands/StartAccountLinkingCommand";
import { Inject } from "@nestjs/common";
import { type MemberRepository, MemberRepositoryToken } from "../ports/MemberRepository";
import { LinkingCodeRepositoryToken, type LinkingCodeRepository } from "../ports/LinkingCodeRepository";
import Member from "../../domain/models/Member";
import { DiscordAccountAlreadyLinkedError } from "../../domain/errors/DiscordAccountAlreadyLinked";

@CommandHandler(StartAccountLinkingCommand)
export class StartAccountLinkingHandler implements ICommandHandler<StartAccountLinkingCommand> {
    constructor(
        @Inject(MemberRepositoryToken) private readonly memberRepository: MemberRepository,
        @Inject(LinkingCodeRepositoryToken) private readonly linkingCodeRepository: LinkingCodeRepository,
    ) {}

    async execute({discordId, discordName}: StartAccountLinkingCommand): Promise<string> {
        let member = await this.memberRepository.findByDiscordId(discordId);
        
        if(!member) {
            member = Member.createNew(discordId, discordName);
        }

        if (member?.minecraftUuid) {
            throw new DiscordAccountAlreadyLinkedError(member.discordId, member.discordName);
        }

        await this.memberRepository.save(member);

        const existingLinkingCode = await this.linkingCodeRepository.findCodeByDiscordId(discordId);
        if(existingLinkingCode) {
            return existingLinkingCode;
        }

        const linkingCode = await this.linkingCodeRepository.generateAndSaveCode(discordId);
        member.commit();

        return linkingCode;
    }
}
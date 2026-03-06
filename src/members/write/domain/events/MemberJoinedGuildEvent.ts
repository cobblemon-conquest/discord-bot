export class MemberJoinedGuildEvent {
    static readonly eventName = 'member.joinedGuild';

    constructor(
        public readonly discordId: string,
        public readonly minecraftUuid: string,
    ) {}
}
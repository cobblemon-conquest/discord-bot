import { Logger } from "@nestjs/common/services/logger.service";
import { CannotLeaveGuildYetError } from "../errors/CannotLeaveGuildYetError";
import { NoGuildToLeaveError } from "../errors/NoGuildToLeaveError";
import { DiscordAccountAlreadyLinkedError } from "../errors/DiscordAccountAlreadyLinked";
import { AggregateRoot } from "@nestjs/cqrs";
import { MemberJoinedGuildEvent } from "../events/MemberJoinedGuildEvent";

export default class Member extends AggregateRoot {

    private readonly log = new Logger(Member.name);

    constructor(
        public readonly id: number | undefined,
        public readonly discordId: string,
        public readonly discordName: string,
        private _minecraftUuid?: string,
        private _minecraftName?: string,
        private _guildId?: string,
        private _guildJoinedAt?: Date
    ) {
        super();
    }

    get minecraftUuid(): string | undefined { return this._minecraftUuid; }
    get minecraftName(): string | undefined { return this._minecraftName; }
    get guildId(): string | undefined { return this._guildId; }
    get guildJoinedAt(): Date | undefined { return this._guildJoinedAt; }

    static createNew(discordId: string, discordName: string): Member {
        return new Member(
            undefined,
            discordId,
            discordName
        );
    }

    linkMinecraftAccount(minecraftUuid: string, minecraftName: string): void {
        if(this._minecraftUuid) {
            throw new DiscordAccountAlreadyLinkedError(this._minecraftUuid, this._minecraftName!);
        }

        this._minecraftUuid = minecraftUuid;
        this._minecraftName = minecraftName;
    }

    unlinkMinecraftAccount(): void {
        this._minecraftUuid = undefined;
        this._minecraftName = undefined;
        this.forceLeaveGuild();
    }

    joinGuild(guildId: string): void {
        this._guildId = guildId;
        this._guildJoinedAt = new Date();

        this.apply(new MemberJoinedGuildEvent(this.discordId, guildId));
    }

    leaveGuild(): void {
        if (!this._guildId) {
            throw new NoGuildToLeaveError();
        }

        if (!this._guildJoinedAt) {
            this.log.warn(`Member ${this.discordId} (${this.discordName}) has no guildJoinedAt date but is in guild ${this._guildId}. Setting guildJoinedAt to now.`);
            this._guildJoinedAt = new Date();
        }

        const oneMonthInMs = 30 * 24 * 60 * 60 * 1000;
        const now = new Date();

        if (now.getTime() - this._guildJoinedAt.getTime() < oneMonthInMs) {
            throw new CannotLeaveGuildYetError(this._guildId);
        }

        this._guildId = undefined;
        this._guildJoinedAt = undefined;
    }

    forceLeaveGuild(): void {
        this._guildId = undefined;
        this._guildJoinedAt = undefined;
    }
}

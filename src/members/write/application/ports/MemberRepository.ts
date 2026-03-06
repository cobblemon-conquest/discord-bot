import Member from "../../domain/models/Member";

export const MemberRepositoryToken = Symbol('MemberRepository');
export interface MemberRepository {

    save(member: Member): Promise<void>;
    findByMinecraftUuid(minecraftUuid: string): Promise<Member | null>;
    findByDiscordId(discordId: string): Promise<Member | null>;
}
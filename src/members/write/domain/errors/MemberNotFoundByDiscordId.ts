export class MemberNotFound extends Error {
    
    constructor(discordId: string) {
        super(`Member with Discord ID ${discordId} not found.`);
        this.name = 'MemberNotFoundByDiscordId';
    }
}
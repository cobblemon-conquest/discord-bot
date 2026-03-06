export class DiscordAccountAlreadyLinkedError extends Error {

    constructor(discordId: string, discordName: string) {
        super(`Discord account with ID ${discordId} (${discordName}) is already linked with a Minecraft account.`);
        this.name = 'DiscordAccountAlreadyLinked';
    }
}
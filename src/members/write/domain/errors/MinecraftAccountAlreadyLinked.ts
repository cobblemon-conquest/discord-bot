export class MinecraftAccountAlreadyLinkedError extends Error {

    constructor(minecraftUuid: string, minecraftName: string) {
        super(`Minecraft account with UUID ${minecraftUuid} (${minecraftName}) is already linked to another member.`);
        this.name = 'MinecraftAccountAlreadyLinked';
    }
}

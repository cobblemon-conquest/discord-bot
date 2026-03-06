export class CannotLeaveGuildYetError extends Error {
    
    constructor(guildId: string) {
        super(`Member cannot leave guild ${guildId} yet.`);
        this.name = 'CannotLeaveGuildYet';
    }
}
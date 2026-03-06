export class NoGuildToLeaveError extends Error {
    
    constructor() {
        super(`Member is not part of any guild to leave.`);
        this.name = 'NoGuildToLeave';
    }
}
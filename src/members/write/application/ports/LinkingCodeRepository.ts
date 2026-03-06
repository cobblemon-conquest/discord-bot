export interface LinkingCodeRepository {
    findCodeByDiscordId(discordId: string): Promise<string | null>;
    generateAndSaveCode(discordId: string): Promise<string>;
    findDiscordIdByCode(code: string): Promise<string | null>;
    invalidateCode(code: string): Promise<void>;
}

export const LinkingCodeRepositoryToken = 'LinkingCodeRepository';

import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule/dist/decorators/cron.decorator';
import { LinkingCodeRepository } from 'src/members/write/application/ports/LinkingCodeRepository';

interface CodeData {
  discordId: string;
  expirationTime: number;
}

@Injectable()
export class InMemoryLinkingCodeRepository implements LinkingCodeRepository {
  private readonly codes = new Map<string, CodeData>();
  private readonly discordIdToCode = new Map<string, string>();

  private readonly codeExpirationTimeMs: number;

  constructor() {
    this.codeExpirationTimeMs = Number(process.env.CODE_EXPIRATION_TIME_MS) || 60 * 60 * 1000;
  }

  async generateAndSaveCode(discordId: string): Promise<string> {
    this.invalidateExistingCode(discordId);

    const code = this.generateUniqueCode();
    const expirationTime = Date.now() + this.codeExpirationTimeMs;
    
    this.storeCode(code, { discordId, expirationTime });
    this.discordIdToCode.set(discordId, code);

    return code;
  }

  async findDiscordIdByCode(code: string): Promise<string | null> {
    const codeData = this.getCode(code);
    
    if (!codeData) {
      return null;
    }

    if (this.isExpired(codeData)) {
      await this.invalidateCode(code);
      return null;
    }

    return codeData.discordId;
  }

  async findCodeByDiscordId(discordId: string): Promise<string | null> {
    const code = this.discordIdToCode.get(discordId);
    
    if (!code) {
      return null;
    }

    const codeData = this.getCode(code);
    
    if (!codeData || this.isExpired(codeData)) {
      await this.invalidateCode(code);
      return null;
    }

    return code;
  }

  async invalidateCode(code: string): Promise<void> {
    const codeData = this.codes.get(code);
    
    if (codeData) {
      this.removeCode(code, codeData.discordId);
    }
  }

  // Helper methods

  private invalidateExistingCode(discordId: string): void {
    const existingCode = this.discordIdToCode.get(discordId);
    
    if (existingCode) {
      this.removeCode(existingCode, discordId);
    }
  }

  private storeCode(code: string, codeData: CodeData): void {
    this.codes.set(code, codeData);
    this.discordIdToCode.set(codeData.discordId, code);
  }

  private getCode(code: string): CodeData | undefined {
    return this.codes.get(code);
  }

  private removeCode(code: string, discordId: string): void {
    this.codes.delete(code);
    this.discordIdToCode.delete(discordId);
  }

  private isExpired(codeData: CodeData): boolean {
    return Date.now() > codeData.expirationTime;
  }

  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    let isUnique = false;

    do {
      code = this.generateRandomCode(chars);
      isUnique = !this.codes.has(code);
    } while (!isUnique);

    return code;
  }

  private generateRandomCode(chars: string): string {
    let code = '';
    
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
  }

  @Cron('0 0 * * * *') // Every hour
  cleanupExpiredCodes(): void {
    const expiredCodes: string[] = [];

    for (const [code, codeData] of this.codes.entries()) {
      if (this.isExpired(codeData)) {
        expiredCodes.push(code);
      }
    }

    expiredCodes.forEach((code) => {
      const codeData = this.codes.get(code);
      if (codeData) {
        this.removeCode(code, codeData.discordId);
      }
    });
  }
}

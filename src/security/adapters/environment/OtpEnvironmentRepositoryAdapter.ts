import { Injectable } from '@nestjs/common';

import { OtpDefinition } from '../../domain/models/OtpDefinition';
import { OtpCodeUtility } from '../../application/utils/OtpCodeUtility';
import { OtpDefinitionRepository } from '../../application/ports/OtpDefinitionRepository';

@Injectable()
export class OtpEnvironmentRepositoryAdapter implements OtpDefinitionRepository {
  private readonly otpDefinitions = this.loadOtpDefinitions();

  public findByName(otpName: string): OtpDefinition | null {
    return this.otpDefinitions.get(OtpCodeUtility.normalizeOtpName(otpName)) ?? null;
  }

  private loadOtpDefinitions(): Map<string, OtpDefinition> {
    const definitions = new Map<string, OtpDefinition>();

    for (const [key, value] of Object.entries(process.env)) {
      const match = key.match(/^OTP_([A-Z0-9_]+)_SECRET$/);
      if (!match || !value) {
        continue;
      }

      const name = OtpCodeUtility.normalizeOtpName(match[1]);
      definitions.set(name, new OtpDefinition(name, value));
    }

    return definitions;
  }
}
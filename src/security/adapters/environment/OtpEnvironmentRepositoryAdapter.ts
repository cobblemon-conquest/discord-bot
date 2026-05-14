import { Injectable } from '@nestjs/common';

import { OtpDefinition } from '../../domain/models/OtpDefinition';
import { OtpCodeUtility } from '../../domain/utils/OtpCodeUtility';
import { OtpDefinitionRepository } from '../../application/ports/OtpDefinitionRepository';
import { OtpDefinitionUtility } from '../../application/utils/OtpDefinitionUtility';

@Injectable()
export class OtpEnvironmentRepositoryAdapter implements OtpDefinitionRepository {
  private readonly otpDefinitions = this.loadOtpDefinitions();

  public findByName(otpName: string): OtpDefinition | null {
    return this.otpDefinitions.get(OtpCodeUtility.normalizeOtpName(otpName)) ?? null;
  }

  private loadOtpDefinitions(): Map<string, OtpDefinition> {
    const definitions = new Map<string, OtpDefinition>();

    for (const [serviceName, secret] of OtpDefinitionUtility.loadOtpSecrets()) {
      definitions.set(serviceName, new OtpDefinition(serviceName, secret));
    }

    return definitions;
  }
}
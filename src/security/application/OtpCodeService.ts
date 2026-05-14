import { Inject, Injectable } from '@nestjs/common';

import type { OtpDefinitionRepository as IOtpDefinitionRepository } from './ports/OtpDefinitionRepository';
import { OtpDefinitionRepositoryToken } from './ports/OtpDefinitionRepository';

@Injectable()
export class OtpCodeService {
  public constructor(
    @Inject(OtpDefinitionRepositoryToken)
    private readonly otpDefinitionRepository: IOtpDefinitionRepository,
  ) {}

  public getOtpCode(otpName: string): string | null {
    const otpDefinition = this.otpDefinitionRepository.findByName(otpName);

    if (!otpDefinition) {
      return null;
    }

    return otpDefinition.getCode();
  }
}
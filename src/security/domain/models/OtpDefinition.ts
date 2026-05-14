import { OtpCodeUtility } from '../utils/OtpCodeUtility';

export class OtpDefinition {
  public constructor(
    private readonly name: string,
    private readonly secret: string,
  ) {}

  public getName(): string {
    return this.name;
  }

  public getCode(): string {
    return OtpCodeUtility.generateOtpCode(this.secret);
  }
}
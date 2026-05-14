import { OtpCodeUtility } from '../utils/OtpCodeUtility';

export class PasswordDefinition {
  public constructor(
    private readonly serviceName: string,
    private readonly username: string | null,
    private readonly password: string,
  ) {}

  public getServiceName(): string {
    return this.serviceName;
  }

  public getUsername(): string | null {
    return this.username;
  }

  public getPassword(): string {
    return this.password;
  }

  public matchesServiceName(serviceName: string): boolean {
    return this.serviceName === OtpCodeUtility.normalizeOtpName(serviceName);
  }
}
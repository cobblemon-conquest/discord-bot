export class PasswordAccessToken {
  public constructor(
    private readonly token: string,
    private readonly serviceName: string,
    private readonly expiresAt: number,
  ) {}

  public getToken(): string {
    return this.token;
  }

  public getServiceName(): string {
    return this.serviceName;
  }

  public isExpired(now = Date.now()): boolean {
    return now >= this.expiresAt;
  }
}
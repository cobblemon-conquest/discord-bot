export class SecurityUrlUtility {
  public static createSecretUrl(token: string): string {
    const baseUrl = this.getPublicBaseUrl();
    const path = `/security/secret?token=${encodeURIComponent(token)}`;

    return baseUrl ? `${baseUrl}${path}` : path;
  }

  private static getPublicBaseUrl(): string {
    return (
      process.env.SECURITY_PUBLIC_URL ??
      process.env.APP_PUBLIC_URL ??
      process.env.PUBLIC_URL ??
      ''
    ).replace(/\/+$/, '');
  }
}
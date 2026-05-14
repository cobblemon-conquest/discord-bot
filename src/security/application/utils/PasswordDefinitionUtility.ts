import { OtpCodeUtility } from '../../domain/utils/OtpCodeUtility';

export class PasswordDefinitionUtility {
  public static normalizeServiceName(serviceName: string): string {
    return OtpCodeUtility.normalizeOtpName(serviceName);
  }

  public static loadPasswordSecrets(env: NodeJS.ProcessEnv = process.env): Map<string, string> {
    const entries = new Map<string, { username?: string; password?: string }>();

    for (const [key, value] of Object.entries(env)) {
      if (!value) continue;

      // Match PASSWORD at end: ACCOUNT_PASSWORD_GMAIL
      let m = key.match(/^(?:ACCOUNT|SECURITY)_PASSWORD_([A-Z0-9_]+)$/);
      if (m) {
        const service = this.normalizeServiceName(m[1]);
        const cur = entries.get(service) ?? {};
        cur.password = value;
        entries.set(service, cur);
        continue;
      }

      // Match USERNAME at end: ACCOUNT_USERNAME_GMAIL
      m = key.match(/^(?:ACCOUNT|SECURITY)_USERNAME_([A-Z0-9_]+)$/);
      if (m) {
        const service = this.normalizeServiceName(m[1]);
        const cur = entries.get(service) ?? {};
        cur.username = value;
        entries.set(service, cur);
        continue;
      }
    }

    // Flatten to password map (keep only those with password)
    const secrets = new Map<string, string>();
    for (const [service, data] of entries) {
      if (data.password) secrets.set(service, data.password);
    }

    return secrets;
  }

  public static getConfiguredServiceNames(env: NodeJS.ProcessEnv = process.env): string[] {
    return [...this.loadPasswordSecrets(env).keys()].sort();
  }
}
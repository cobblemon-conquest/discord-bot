import { OtpCodeUtility } from '../../domain/utils/OtpCodeUtility';

export class OtpDefinitionUtility {
  public static normalizeServiceName(serviceName: string): string {
    return OtpCodeUtility.normalizeOtpName(serviceName);
  }

  public static loadOtpSecrets(env: NodeJS.ProcessEnv = process.env): Map<string, string> {
    const secrets = new Map<string, string>();

    for (const [key, value] of Object.entries(env)) {
      const match = key.match(/^OTP_SECRET_([A-Z0-9_]+)$/);
      if (!match || !value) {
        continue;
      }

      const serviceName = this.normalizeServiceName(match[1]);
      secrets.set(serviceName, value);
    }

    return secrets;
  }

  public static getConfiguredServiceNames(env: NodeJS.ProcessEnv = process.env): string[] {
    return [...this.loadOtpSecrets(env).keys()].sort();
  }
}
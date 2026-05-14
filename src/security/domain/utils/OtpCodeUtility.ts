import { createHmac } from 'crypto';

export class OtpCodeUtility {
  public static normalizeOtpName(otpName: string): string {
    return otpName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
  }

  public static generateOtpCode(secret: string, digits = 6, stepSeconds = 30): string {
    const counter = Math.floor(Date.now() / 1000 / stepSeconds);
    const counterBuffer = Buffer.alloc(8);

    counterBuffer.writeBigUInt64BE(BigInt(counter));

    const hmac = createHmac('sha1', this.decodeBase32(secret))
      .update(counterBuffer)
      .digest();

    const offset = hmac[hmac.length - 1] & 0x0f;
    const code =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    return String(code % 10 ** digits).padStart(digits, '0');
  }

  private static decodeBase32(secret: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const normalized = secret.toUpperCase().replace(/=+$/g, '').replace(/\s+/g, '');

    let bits = 0;
    let value = 0;
    const output: number[] = [];

    for (const character of normalized) {
      const index = alphabet.indexOf(character);
      if (index === -1) {
        throw new Error(`Invalid base32 character in OTP secret: ${character}`);
      }

      value = (value << 5) | index;
      bits += 5;

      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 0xff);
        bits -= 8;
      }
    }

    return Buffer.from(output);
  }
}
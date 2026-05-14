import { Controller, Get, Logger, Query, Res } from '@nestjs/common';
import type { Response } from 'express';

import { PasswordAccessService } from '../../application/PasswordAccessService';

@Controller('security')
export class SecurityController {
  private readonly logger = new Logger(SecurityController.name);

  public constructor(private readonly passwordAccessService: PasswordAccessService) {}

  @Get('secret')
  public async getSecret(@Query('token') token: string | undefined, @Res() response: Response) {
    this.logger.log(`Security secret endpoint accessed | tokenHint=${this.tokenHint(token)}`);

    const payload = await this.passwordAccessService.consumePassword(token ?? '');

    if (!payload) {
      this.logger.warn(`Security secret endpoint denied | tokenHint=${this.tokenHint(token)}`);
      return response
        .status(404)
        .type('text/plain; charset=utf-8')
        .send('Token inválido o expirado.');
    }

    // payload is a JSON string with username and password
    try {
      const parsed = JSON.parse(payload);
      const username = parsed.username ?? null;
      const password = parsed.password ?? '';

      const body = username ? `usuario: ${username}\ncontraseña: ${password}` : `contraseña: ${password}`;
      this.logger.log(`Security secret endpoint succeeded | tokenHint=${this.tokenHint(token)}`);
      return response.status(200).type('text/plain; charset=utf-8').send(body);
    } catch (e) {
      // fallback: return raw payload
      this.logger.warn(
        `Security secret endpoint returned fallback payload | tokenHint=${this.tokenHint(token)}`,
      );
      return response.status(200).type('text/plain; charset=utf-8').send(String(payload));
    }
  }

  private tokenHint(token: string | undefined): string {
    if (!token) {
      return 'none';
    }

    return `${token.slice(0, 6)}...len${token.length}`;
  }
}
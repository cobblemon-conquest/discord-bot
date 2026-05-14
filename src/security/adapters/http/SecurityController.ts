import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';

import { PasswordAccessService } from '../../application/PasswordAccessService';

@Controller('security')
export class SecurityController {
  public constructor(private readonly passwordAccessService: PasswordAccessService) {}

  @Get('secret')
  public async getSecret(@Query('token') token: string | undefined, @Res() response: Response) {
    const payload = await this.passwordAccessService.consumePassword(token ?? '');

    if (!payload) {
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
      return response.status(200).type('text/plain; charset=utf-8').send(body);
    } catch (e) {
      // fallback: return raw payload
      return response.status(200).type('text/plain; charset=utf-8').send(String(payload));
    }
  }
}
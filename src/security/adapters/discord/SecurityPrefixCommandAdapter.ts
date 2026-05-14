import { Injectable, Logger } from '@nestjs/common';
import { Context, On, type ContextOf } from 'necord';
import type { GuildMember, Message } from 'discord.js';

import { OtpCodeService } from '../../application/OtpCodeService';
import { PasswordAccessService } from '../../application/PasswordAccessService';
import { loadSecurityAllowedRoleIds } from './securityAuthorization';

@Injectable()
export class SecurityPrefixCommandAdapter {
  private readonly logger = new Logger(SecurityPrefixCommandAdapter.name);
  private readonly prefix = '!security';

  public constructor(
    private readonly otpCodeService: OtpCodeService,
    private readonly passwordAccessService: PasswordAccessService,
  ) {}

  @On('messageCreate')
  public async onMessageCreate(@Context() [message]: ContextOf<'messageCreate'>) {
    this.logger.log(
      `messageCreate received | authorId=${message.author.id} isBot=${message.author.bot} isGuild=${message.inGuild()} guildId=${message.guildId ?? 'dm'} contentPreview=${this.previewContent(message.content)}`,
    );

    if (!message.inGuild()) {
      this.logger.debug(
        `Ignoring direct message | authorId=${message.author.id} contentPreview=${this.previewContent(message.content)}`,
      );
      return;
    }

    if (message.author.bot) {
      this.logger.debug(`Ignoring bot author | authorId=${message.author.id}`);
      return;
    }

    const trimmed = message.content.trim();
    const hasSecurityPrefix = trimmed.toLowerCase().startsWith(this.prefix);

    const parsed = this.parseSecurityCommand(message.content);
    if (!parsed) {
      if (hasSecurityPrefix) {
        this.logger.warn(
          `Security command received with invalid format | authorId=${message.author.id} guildId=dm contentPreview=${this.previewContent(message.content)}`,
        );
        await this.safeReply(message, this.buildUsageHelp());
      } else {
        this.logger.debug(
          `Ignoring non-security DM message | authorId=${message.author.id} contentPreview=${this.previewContent(message.content)}`,
        );
      }
      return;
    }

    const { serviceName, action } = parsed;

    this.logger.log(
      `Prefix security command requested | action=${action} service=${serviceName} userId=${message.author.id} guildId=${message.guildId}`,
    );

    if (!(await this.isAuthorizedInGuild(message))) {
      this.logger.warn(
        `Prefix security command denied (unauthorized) | action=${action} service=${serviceName} userId=${message.author.id} guildId=${message.guildId}`,
      );
      await this.safeReply(message, 'No tienes permisos para usar este comando.');
      return;
    }

    if (action === 'otp') {
      await this.sendOtp(message, serviceName);
      return;
    }

    await this.sendCredentialsLink(message, serviceName);
  }

  private parseSecurityCommand(content: string): { serviceName: string; action: 'otp' | 'credentials' } | null {
    const trimmed = content.trim();
    if (!trimmed.toLowerCase().startsWith(this.prefix)) {
      return null;
    }

    const parts = trimmed.split(/\s+/);
    if (parts.length < 3) {
      return null;
    }

    const serviceName = parts[1]?.trim().toLowerCase();
    const action = parts[2]?.trim().toLowerCase();

    if (!serviceName) {
      return null;
    }

    if (action === 'credentials' || action === 'password') {
      return { serviceName, action: 'credentials' };
    }

    if (action === 'otp') {
      return { serviceName, action: 'otp' };
    }

    return null;
  }

  private buildUsageHelp(): string {
    return (
      '**Formato invalido**\n' +
      'Usa uno de estos comandos:\n' +
      '`!security <servicio> otp`\n' +
      '`!security <servicio> credentials`\n\n' +
      '**Ejemplos**\n' +
      '`!security gmail otp`\n' +
      '`!security gmail credentials`'
    );
  }

  private async isAuthorizedInGuild(message: Message<boolean>): Promise<boolean> {
    const allowedRoleIds = loadSecurityAllowedRoleIds();
    if (allowedRoleIds.length === 0) {
      this.logger.warn('No security role ids configured; denying guild security command');
      return false;
    }

    this.logger.log(
      `Checking staff authorization in guild message | userId=${message.author.id} guildId=${message.guildId} allowedRoles=${allowedRoleIds.length}`,
    );

    const member = await this.resolveGuildMember(message);
    if (!member) {
      this.logger.warn(`User member could not be resolved | userId=${message.author.id} guildId=${message.guildId}`);
      return false;
    }

    if (member.roles.cache.some(role => allowedRoleIds.includes(role.id))) {
      this.logger.log(`User authorized in guild | userId=${message.author.id} guildId=${message.guildId}`);
      return true;
    }

    this.logger.warn(`User not authorized in guild | userId=${message.author.id} guildId=${message.guildId}`);
    return false;
  }

  private async sendOtp(message: ContextOf<'messageCreate'>[0], serviceName: string): Promise<void> {
    const otpCode = this.otpCodeService.getOtpCode(serviceName);
    if (!otpCode) {
      this.logger.warn(
        `Prefix security OTP failed (missing config) | service=${serviceName} userId=${message.author.id} guildId=${message.guildId}`,
      );
      await this.safeReply(message, `No hay una OTP configurada para \`${serviceName}\`.`);
      return;
    }

    this.logger.log(
      `Prefix security OTP succeeded | service=${serviceName} userId=${message.author.id} guildId=${message.guildId}`,
    );

    const dmSent = await this.safeDm(
      message,
      `**Codigo OTP — NO compartir**\n` +
        `Servicio: **${serviceName}**\n` +
        `Codigo: \`${otpCode}\`\n\n` +
        `No compartas este codigo con nadie.`,
    );

    if (dmSent) {
      await this.safeReply(message, 'Te envié el código por mensaje privado.');
      return;
    }

    await this.safeReply(message, 'No pude enviarte el mensaje privado con el código.');
  }

  private async sendCredentialsLink(
    message: ContextOf<'messageCreate'>[0],
    serviceName: string,
  ): Promise<void> {
    const accessUrl = await this.passwordAccessService.createPasswordAccessUrl(serviceName);
    if (!accessUrl) {
      this.logger.warn(
        `Prefix security credentials failed (missing config) | service=${serviceName} userId=${message.author.id} guildId=${message.guildId}`,
      );
      await this.safeReply(message, `No hay credenciales configuradas para \`${serviceName}\`.`);
      return;
    }

    this.logger.log(
      `Prefix security credentials succeeded | service=${serviceName} userId=${message.author.id} guildId=${message.guildId}`,
    );

    const dmSent = await this.safeDm(
      message,
      `**Enlace de acceso — NO compartir**\n` +
        `Servicio: **${serviceName}**\n` +
        `Enlace (valido 1 minuto): \`${accessUrl}\`\n\n` +
        `No compartas este enlace con nadie.`,
    );

    if (dmSent) {
      await this.safeReply(message, 'Te envié el enlace por mensaje privado.');
      return;
    }

    await this.safeReply(message, 'No pude enviarte el mensaje privado con el enlace.');
  }

  private async safeReply(message: ContextOf<'messageCreate'>[0], content: string): Promise<void> {
    try {
      await message.reply({ content });
    } catch {
      // Nothing else to do.
    }
  }

  private async safeDm(message: ContextOf<'messageCreate'>[0], content: string): Promise<boolean> {
    try {
      await message.author.send({ content });
      return true;
    } catch {
      this.logger.warn(`Failed to send DM | userId=${message.author.id} guildId=${message.guildId}`);
      return false;
    }
  }

  private async resolveGuildMember(message: Message<boolean>): Promise<GuildMember | null> {
    if (message.member) {
      return message.member;
    }

    if (!message.guild) {
      return null;
    }

    try {
      return await message.guild.members.fetch(message.author.id);
    } catch {
      return null;
    }
  }

  private previewContent(content: string): string {
    const compact = content.replace(/\s+/g, ' ').trim();

    return compact.length > 80 ? `${compact.slice(0, 77)}...` : compact;
  }
}
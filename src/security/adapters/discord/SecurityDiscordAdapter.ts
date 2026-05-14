import { Injectable } from '@nestjs/common';
import {
  ApplicationIntegrationType,
  MessageFlags,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { Context, Subcommand, createCommandGroupDecorator } from 'necord';
import type { SlashCommandContext } from 'necord';

import { OtpCodeService } from '../../application/OtpCodeService';

const SecurityCommands = createCommandGroupDecorator({
  name: 'otp',
  description: 'Retrieve staff OTP codes.',
  integrationTypes: [ApplicationIntegrationType.GuildInstall],
});

@SecurityCommands()
@Injectable()
export class SecurityDiscordAdapter {
  private readonly allowedRoleIds = this.loadAllowedRoleIds();

  public constructor(private readonly otpCodeService: OtpCodeService) {}

  @Subcommand({
    name: 'gmail',
    description: 'Retrieve the Gmail OTP code.',
  })
  public async onGmailOtp(@Context() [interaction]: SlashCommandContext) {
    return this.replyWithOtp(interaction, 'gmail');
  }

  private async replyWithOtp(interaction: ChatInputCommandInteraction, otpName: string) {
    if (!this.isAuthorized(interaction)) {
      return interaction.reply({
        content: 'No tienes permisos para usar este comando.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const otpCode = this.otpCodeService.getOtpCode(otpName);
    if (!otpCode) {
      return interaction.reply({
        content: `No hay una OTP configurada para \`${otpName}\`.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    return interaction.reply({
      content: `OTP de ${otpName}: \`${otpCode}\``,
      flags: MessageFlags.Ephemeral,
    });
  }

  private isAuthorized(interaction: ChatInputCommandInteraction): boolean {
    if (this.allowedRoleIds.length === 0) {
      return false;
    }

    const memberRoles = this.getMemberRoleIds(interaction);
    return memberRoles.some(roleId => this.allowedRoleIds.includes(roleId));
  }

  private getMemberRoleIds(interaction: ChatInputCommandInteraction): string[] {
    const member = interaction.member;

    if (!member) {
      return [];
    }

    if ('roles' in member && Array.isArray(member.roles)) {
      return member.roles;
    }

    if ('roles' in member && member.roles && 'cache' in member.roles) {
      return [...member.roles.cache.keys()];
    }

    return [];
  }

  private loadAllowedRoleIds(): string[] {
    const rawValue =
      process.env.OTP_AUTHORIZED_ROLE_IDS ?? process.env.SECURITY_AUTHORIZED_ROLE_IDS ?? '';

    return rawValue
      .split(/[;,\s]+/)
      .map(roleId => roleId.trim())
      .filter(Boolean);
  }
}
import { Injectable, Logger, type Type } from '@nestjs/common';
import {
  ApplicationIntegrationType,
  MessageFlags,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { Context, Subcommand, createCommandGroupDecorator } from 'necord';
import type { SlashCommandContext } from 'necord';

import { OtpCodeService } from '../../application/OtpCodeService';
import { OtpDefinitionUtility } from '../../application/utils/OtpDefinitionUtility';
import { isSecurityAuthorized } from './securityAuthorization';

const SecurityCommands = createCommandGroupDecorator({
  name: 'security',
  description: 'Obtener códigos OTP de las cuentas.',
  integrationTypes: [ApplicationIntegrationType.GuildInstall],
});

export function createSecurityOtpCommandProviders(): Type<unknown>[] {
  return OtpDefinitionUtility.getConfiguredServiceNames().map(serviceName => {
    @SecurityCommands({
      name: serviceName,
      description: `Obtener el OTP de ${serviceName}.`,
    })
    @Injectable()
    class SecurityOtpCommandProvider {
      public readonly logger = new Logger(SecurityOtpCommandProvider.name);

      public constructor(public readonly otpCodeService: OtpCodeService) {}

      @Subcommand({
        name: 'otp',
        description: 'Obtener el código OTP temporal.',
      })
      public async onOtp(@Context() [interaction]: SlashCommandContext) {
        return this.replyWithOtp(interaction, serviceName);
      }

      public async replyWithOtp(interaction: ChatInputCommandInteraction, otpName: string) {
        this.logger.log(
          `OTP command requested | service=${otpName} userId=${interaction.user.id} guildId=${interaction.guildId ?? 'dm'}`,
        );

        if (!isSecurityAuthorized(interaction)) {
          this.logger.warn(
            `OTP command denied (unauthorized) | service=${otpName} userId=${interaction.user.id} guildId=${interaction.guildId ?? 'dm'}`,
          );
          return interaction.reply({
            content: 'No tienes permisos para usar este comando.',
            flags: MessageFlags.Ephemeral,
          });
        }

        const otpCode = this.otpCodeService.getOtpCode(otpName);
        if (!otpCode) {
          this.logger.warn(
            `OTP command failed (missing config) | service=${otpName} userId=${interaction.user.id} guildId=${interaction.guildId ?? 'dm'}`,
          );
          return interaction.reply({
            content: `No hay una OTP configurada para \`${otpName}\`.`,
            flags: MessageFlags.Ephemeral,
          });
        }

        this.logger.log(
          `OTP command succeeded | service=${otpName} userId=${interaction.user.id} guildId=${interaction.guildId ?? 'dm'}`,
        );

        return interaction.reply({
          content:
            `**Código OTP — NO compartir**\n` +
            `Servicio: **${otpName}**\n` +
            `Código: \`${otpCode}\`\n\n` +
            `⚠️ **No compartas este código con nadie.**`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    return SecurityOtpCommandProvider;
  });
}
import { Injectable } from '@nestjs/common';
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

export function createSecurityOtpCommandProviders() {
  return OtpDefinitionUtility.getConfiguredServiceNames().map(serviceName => {
    @SecurityCommands({
      name: serviceName,
      description: `Obtener el OTP de ${serviceName}.`,
    })
    @Injectable()
    class SecurityOtpCommandProvider {
      public constructor(public readonly otpCodeService: OtpCodeService) {}

      @Subcommand({
        name: 'otp',
        description: 'Obtener el código OTP temporal.',
      })
      public async onOtp(@Context() [interaction]: SlashCommandContext) {
        return this.replyWithOtp(interaction, serviceName);
      }

      public async replyWithOtp(interaction: ChatInputCommandInteraction, otpName: string) {
        if (!isSecurityAuthorized(interaction)) {
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
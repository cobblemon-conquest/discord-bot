import { Injectable, type Type } from '@nestjs/common';
import { Context, Subcommand, createCommandGroupDecorator } from 'necord';
import type { SlashCommandContext } from 'necord';
import { ApplicationIntegrationType, MessageFlags, type ChatInputCommandInteraction } from 'discord.js';

import { PasswordAccessService } from '../../application/PasswordAccessService';
import { PasswordDefinitionUtility } from '../../application/utils/PasswordDefinitionUtility';
import { isSecurityAuthorized } from './securityAuthorization';

const SecurityPasswordRootCommand = createCommandGroupDecorator({
  name: 'security',
  description: 'Obtener contraseñas de cuentas.',
  integrationTypes: [ApplicationIntegrationType.GuildInstall],
});

export function createSecurityPasswordCommandProviders(): Type<unknown>[] {
  return PasswordDefinitionUtility.getConfiguredServiceNames().map(serviceName => {
    @SecurityPasswordRootCommand({
      name: serviceName,
      description: `Obtener la contraseña de ${serviceName}.`,
    })
    @Injectable()
    class SecurityPasswordCommandProvider {
      public constructor(private readonly passwordAccessService: PasswordAccessService) {}

      @Subcommand({
        name: 'credentials',
        description: 'Genera un enlace temporal para revelar las credenciales.',
      })
      public async onPassword(@Context() [interaction]: SlashCommandContext) {
        return this.replyWithPasswordUrl(interaction, serviceName);
      }

      private async replyWithPasswordUrl(
        interaction: ChatInputCommandInteraction,
        normalizedServiceName: string,
      ) {
        if (!isSecurityAuthorized(interaction)) {
          return interaction.reply({
            content: 'No tienes permisos para usar este comando.',
            flags: MessageFlags.Ephemeral,
          });
        }

        const accessUrl = await this.passwordAccessService.createPasswordAccessUrl(
          normalizedServiceName,
        );

        if (!accessUrl) {
          return interaction.reply({
            content: `No hay credenciales configuradas para \`${normalizedServiceName}\`.`,
            flags: MessageFlags.Ephemeral,
          });
        }

        return interaction.reply({
          content:
            `**Enlace de acceso — NO compartir**\n` +
            `Servicio: **${normalizedServiceName}**\n` +
            `Enlace (válido 1 minuto): ${accessUrl}\n\n` +
            `⚠️ **No compartas este enlace con nadie.**`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    return SecurityPasswordCommandProvider;
  });
}
import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApplicationIntegrationType, MessageFlags } from 'discord.js';
import { SlashCommand } from 'necord/dist/commands/slash-commands/decorators/slash-command.decorator';
import { Context } from 'necord/dist/context/decorators/context.decorator';
import { type SlashCommandContext } from 'necord/dist/context/necord-context.interface';
import { StartAccountLinkingCommand } from 'src/members/write/domain/commands/StartAccountLinkingCommand';

@Injectable()
export class MemberDiscordAdapter {
    private readonly logger = new Logger(MemberDiscordAdapter.name);

    constructor(private readonly commandBus: CommandBus) {}

    @SlashCommand({
        name: 'ping',
        description: 'Ping command!',
        integrationTypes: [ApplicationIntegrationType.GuildInstall],
    })
    public async onPing(@Context() [interaction]: SlashCommandContext) {
        return interaction.reply({
            content: 'Pong!',
            flags: MessageFlags.Ephemeral,
        });
    }

    @SlashCommand({
        name: 'linkmc',
        description:
            'Enlaza tu cuenta de Minecraft de Cobblemon Conquest con tu cuenta de Discord.',
        integrationTypes: [ApplicationIntegrationType.GuildInstall],
    })
    public async onLinkMinecraft(
        @Context() [interaction]: SlashCommandContext,
    ) {
        try {
            const linkingCode = await this.commandBus.execute(
                new StartAccountLinkingCommand(
                    interaction.user.id,
                    interaction.user.username,
                ),
            );

            return interaction.reply({
                content: `Para enlazar tu cuenta de Minecraft, ejecuta el siguiente comando en el servidor de Minecraft: \n\`/link ${linkingCode}\``,
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            const errorMessage = this.catchDomainErrors(error as Error);
            return interaction.reply({
                content: errorMessage,
                flags: MessageFlags.Ephemeral,
            });
        }
    }

    private catchDomainErrors(error: Error): string {
        this.logger.error(`Error during account linking: ${error.message}`);
        switch (error.name) {
            case 'DiscordAccountAlreadyLinked':
                return 'Tu cuenta de Discord ya está enlazada con una cuenta de Minecraft.';
            default:
                return 'Ha ocurrido un error al intentar enlazar tu cuenta. Por favor, avisa y proporciona detalles del error al staff.';
        }
    }
}

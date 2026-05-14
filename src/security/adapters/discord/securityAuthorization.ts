import { ApplicationIntegrationType, type ChatInputCommandInteraction } from 'discord.js';

export const SECURITY_ALLOWED_ROLE_IDS_ENV_KEYS = [
  'OTP_AUTHORIZED_ROLE_IDS',
  'SECURITY_AUTHORIZED_ROLE_IDS',
];

export function loadSecurityAllowedRoleIds(): string[] {
  const rawValue = SECURITY_ALLOWED_ROLE_IDS_ENV_KEYS.map(key => process.env[key] ?? '')
    .find(value => value.trim().length > 0)
    ?? '';

  return rawValue
    .split(/[;,\s]+/)
    .map(roleId => roleId.trim())
    .filter(Boolean);
}

export function isSecurityAuthorized(interaction: ChatInputCommandInteraction): boolean {
  const allowedRoleIds = loadSecurityAllowedRoleIds();

  if (allowedRoleIds.length === 0) {
    return false;
  }

  const memberRoles = getMemberRoleIds(interaction);
  return memberRoles.some(roleId => allowedRoleIds.includes(roleId));
}

function getMemberRoleIds(interaction: ChatInputCommandInteraction): string[] {
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

export const SECURITY_GUILD_INSTALL = ApplicationIntegrationType.GuildInstall;
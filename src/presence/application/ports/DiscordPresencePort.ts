export const DiscordPresencePortToken = Symbol('DiscordPresencePort');

export interface DiscordPresencePort {
  setOnlinePlayers(onlinePlayers: number): Promise<boolean>;
  setOffline(): Promise<boolean>;
}

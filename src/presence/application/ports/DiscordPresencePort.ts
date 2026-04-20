export const DiscordPresencePortToken = Symbol('DiscordPresencePort');

export interface DiscordPresencePort {
  setOnlinePlayers(onlinePlayers: number): Promise<void>;
  setOffline(): Promise<void>;
}

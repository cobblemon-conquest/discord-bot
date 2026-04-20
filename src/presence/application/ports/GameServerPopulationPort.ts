export const GameServerPopulationPortToken = Symbol('GameServerPopulationPort');

export interface GameServerPopulationPort {
  getOnlinePlayers(): Promise<number>;
}

export interface PresenceState {
  readonly isOffline: boolean;
  readonly consecutiveFailures: number;
  readonly lastOnlinePlayers?: number;
}

export const INITIAL_PRESENCE_STATE: PresenceState = {
  isOffline: false,
  consecutiveFailures: 0,
  lastOnlinePlayers: undefined,
};

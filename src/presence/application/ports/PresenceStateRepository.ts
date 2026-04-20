import type { PresenceState } from 'src/presence/domain/models/PresenceState';

export const PresenceStateRepositoryToken = Symbol('PresenceStateRepository');

export interface PresenceStateRepository {
  getState(): Promise<PresenceState>;
  saveState(state: PresenceState): Promise<void>;
}

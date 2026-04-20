import { Injectable } from '@nestjs/common';
import { type PresenceStateRepository } from 'src/presence/application/ports/PresenceStateRepository';
import {
  INITIAL_PRESENCE_STATE,
  type PresenceState,
} from 'src/presence/domain/models/PresenceState';

@Injectable()
export class InMemoryPresenceStateRepository implements PresenceStateRepository {
  private state: PresenceState = INITIAL_PRESENCE_STATE;

  async getState(): Promise<PresenceState> {
    return this.state;
  }

  async saveState(state: PresenceState): Promise<void> {
    this.state = state;
  }
}

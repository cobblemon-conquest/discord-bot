import { Injectable } from '@nestjs/common';

import { PasswordDefinition } from '../../domain/models/PasswordDefinition';
import { PasswordDefinitionUtility } from '../../application/utils/PasswordDefinitionUtility';
import { PasswordDefinitionRepository } from '../../application/ports/PasswordDefinitionRepository';

@Injectable()
export class PasswordEnvironmentRepositoryAdapter implements PasswordDefinitionRepository {
  private readonly passwordDefinitions = this.loadPasswordDefinitions();

  public findByName(serviceName: string): PasswordDefinition | null {
    return this.passwordDefinitions.get(PasswordDefinitionUtility.normalizeServiceName(serviceName)) ?? null;
  }

  private loadPasswordDefinitions(): Map<string, PasswordDefinition> {
    const definitions = new Map<string, PasswordDefinition>();

    // We need username + password; scan env directly to gather both
    const entries = new Map<string, { username?: string; password?: string }>();
    for (const [key, value] of Object.entries(process.env)) {
      if (!value) continue;

      let m = key.match(/^(?:ACCOUNT|SECURITY)_PASSWORD_([A-Z0-9_]+)$/);
      if (m) {
        const service = PasswordDefinitionUtility.normalizeServiceName(m[1]);
        const cur = entries.get(service) ?? {};
        cur.password = value;
        entries.set(service, cur);
        continue;
      }

      m = key.match(/^(?:ACCOUNT|SECURITY)_USERNAME_([A-Z0-9_]+)$/);
      if (m) {
        const service = PasswordDefinitionUtility.normalizeServiceName(m[1]);
        const cur = entries.get(service) ?? {};
        cur.username = value;
        entries.set(service, cur);
        continue;
      }
    }

    for (const [service, data] of entries) {
      if (data.password) {
        definitions.set(service, new PasswordDefinition(service, data.username ?? null, data.password));
      }
    }

    return definitions;
  }
}
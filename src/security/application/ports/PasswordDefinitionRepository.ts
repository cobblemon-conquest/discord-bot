import { PasswordDefinition } from '../../domain/models/PasswordDefinition';

export const PasswordDefinitionRepositoryToken = Symbol('PasswordDefinitionRepository');

export interface PasswordDefinitionRepository {
  findByName(serviceName: string): PasswordDefinition | null;
}
import { OtpDefinition } from '../../domain/models/OtpDefinition';

export const OtpDefinitionRepositoryToken = Symbol('OtpDefinitionRepository');

export interface OtpDefinitionRepository {
  findByName(otpName: string): OtpDefinition | null;
}
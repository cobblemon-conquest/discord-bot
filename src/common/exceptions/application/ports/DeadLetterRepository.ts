import { UnhandledExceptionInfo } from "@nestjs/cqrs";

export interface DeadLetterRepository {
    saveDeadLetter(unhandledExceptionInfo: UnhandledExceptionInfo): Promise<number>;
    findById(id: number): Promise<UnhandledExceptionInfo | null>;
}

export const DeadLetterRepositoryToken = Symbol('DeadLetterRepository');

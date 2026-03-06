import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import {
    EventBus,
    UnhandledExceptionBus,
    UnhandledExceptionInfo,
} from '@nestjs/cqrs';
import {
    type DeadLetterRepository,
    DeadLetterRepositoryToken,
} from '../ports/DeadLetterRepository';
import { CQRS_REGISTRY } from '../../utils/DeadLetterRegistry';

@Injectable()
export class EventExceptionHandler implements OnModuleInit {
    private readonly logger = new Logger(EventExceptionHandler.name);

    constructor(
        private readonly unhandledExceptionBus: UnhandledExceptionBus,
        private readonly eventBus: EventBus,
        @Inject(DeadLetterRepositoryToken)
        private readonly deadLetterRepository: DeadLetterRepository,
    ) {}

    onModuleInit() {
        this.unhandledExceptionBus.subscribe((info: UnhandledExceptionInfo) => {
            const { exception, cause } = info;
            
            // Only handle exceptions from commands/events that are registered in the CQRS_REGISTRY
            if (!CQRS_REGISTRY.has(cause?.constructor?.name)) {
                return;
            }

            this.logger.error(
                `Unhandled exception in ${cause?.constructor?.name}`,
                exception.stack,
            );

            this.deadLetterRepository.saveDeadLetter(info);
        });
    }

    async retryDeadLetter(id: number): Promise<void> {
        const deadLetter = await this.deadLetterRepository.findById(id);

        if (!deadLetter) {
            this.logger.warn(`Dead letter with ID ${id} not found.`);
            return;
        }

        const { cause } = deadLetter;

        if (!cause) {
            this.logger.warn(`Dead letter with ID ${id} has no associated cause.`);
            return;
        }

        this.logger.log(`Retrying dead letter with ID ${id} for ${cause.constructor.name}.`);
        this.eventBus.publish(cause);
    }
}

import { Injectable } from "@nestjs/common";
import { ICommand, IEvent, UnhandledExceptionInfo } from "@nestjs/cqrs";
import { DeadLetterRepository } from "../../application/ports/DeadLetterRepository";
import { PrismaService } from "src/common/prisma/PrismaService";
import { Prisma } from "src/common/generated/prisma/browser";
import { CQRS_REGISTRY } from "../../utils/DeadLetterRegistry";

@Injectable()
export class PrismaDeadLetterRepository implements DeadLetterRepository {
    
    constructor(private readonly prisma: PrismaService) {}
    
    async saveDeadLetter({cause, exception}: UnhandledExceptionInfo): Promise<number> {
        return this.prisma.deadLetter.create({
            data: {
                id: undefined,
                type: cause?.constructor?.name || 'UnknownEvent',
                payload: cause as Prisma.JsonObject,
                error: exception.message + '\n' + exception.stack,
                createdAt: new Date(),
            }
        }).then(record => record.id);
    }

    async findById(id: number): Promise<UnhandledExceptionInfo | null> {
        const record = await this.prisma.deadLetter.findUnique({
            where: { id }
        });

        if (!record) {
            return null;
        }

        return {
            cause: record.payload as IEvent | ICommand,
            exception: new Error(record.error),
        };
    }

    hydrate(type: string, data: any) {
        const Ctor = CQRS_REGISTRY.get(type);
        if (!Ctor) throw new Error(`Unknown CQRS type: ${type}`);
        return Object.assign(new Ctor(), data);
    }
}
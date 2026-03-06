import { Module } from "@nestjs/common";
import { MemberRepositoryImpl as MemberRepositoryPrismaImpl } from "./adapters/database/repositories/MemberRepositoryImpl";
import { MemberController } from "./adapters/rest/controllers/MemberController";
import { InMemoryLinkingCodeRepository as LinkingCodeRepositoryInMemoryImpl } from "./adapters/memory-database/InMemoryLinkingCodeRepository";
import { MemberDiscordAdapter } from "./adapters/discord/MemberDiscordAdapter";
import { StartAccountLinkingHandler } from "./write/application/handlers/StartAccountLinkingHandler";
import { EndAccountLinkingHandler } from "./write/application/handlers/EndAccountLinkingHandler";
import { LinkingCodeRepositoryToken } from "./write/application/ports/LinkingCodeRepository";
import { MemberRepositoryToken } from "./write/application/ports/MemberRepository";

@Module({
    imports: [],
    controllers: [MemberController],
    providers: [
        MemberDiscordAdapter,
        StartAccountLinkingHandler,
        EndAccountLinkingHandler,
        {
            provide: MemberRepositoryToken,
            useClass: MemberRepositoryPrismaImpl,
        },
        {
            provide: LinkingCodeRepositoryToken,
            useClass: LinkingCodeRepositoryInMemoryImpl
        },
    ],
})
export class MemberModule { }
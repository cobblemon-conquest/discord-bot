# AGENTS.md

## Scope
- This file defines how AI agents and contributors should evolve `discord-bot/`.
- The project is a NestJS service with CQRS, EventEmitter, Necord (Discord), and Prisma/PostgreSQL.
- Keep all architecture decisions aligned with Hexagonal Architecture, Domain-Driven Design (DDD), and Event-Driven Architecture (EDA).

## Current Architecture Snapshot
- App bootstrap and top-level wiring are in `src/main.ts` and `src/RootModule.ts`.
- Main bounded context is `members`, organized into:
  - `src/members/write/domain` (entities, domain events, domain commands, domain errors)
  - `src/members/write/application` (use cases/handlers, ports)
  - `src/members/adapters` (REST, Discord, database, in-memory)
- Cross-cutting event exception handling and dead-letter persistence live in `src/common/exceptions`.
- Prisma schema and persistence models are in `prisma/schema.prisma`.

## Architecture Principles (Non-Negotiable)
- Domain code must not depend on frameworks (`@nestjs/*`, Prisma, Discord SDK).
- Application layer orchestrates use cases and depends only on domain + port interfaces.
- Adapters implement ports and may depend on frameworks, transport, or persistence details.
- Dependency direction is always inbound: adapters -> application ports -> domain.
- Never call Prisma/Discord directly from domain models or application handlers.

## Hexagonal Architecture Guide
- Treat each feature area as a hexagon (starting with `members`; `guilds` can be completed similarly).
- Place new code as follows:
  - Domain: invariants, business rules, domain errors, domain events.
  - Application: command/query handlers, transaction/use-case orchestration, port contracts.
  - Inbound adapters: REST controllers, Discord slash command adapters, schedulers, event listeners.
  - Outbound adapters: Prisma repositories, API clients, cache implementations, message publishers.
- Use DI tokens for ports (as already done with `MemberRepositoryToken`, `LinkingCodeRepositoryToken`, and `DeadLetterRepositoryToken`).
- Keep adapters replaceable: no adapter-specific types in domain/application signatures.

## DDD Guide
- Use bounded contexts by folder/module (`members`, `guilds`, future contexts).
- Keep aggregate roots authoritative for invariants (example pattern: `Member` extends `AggregateRoot`).
- Prefer domain methods that express intent (`linkMinecraftAccount`, `joinGuild`, `leaveGuild`) over setter-style updates.
- Raise domain-specific errors from domain/application; map them to transport-specific responses in inbound adapters.
- Model references across aggregates by identity (IDs), not object graphs.
- Add value objects when primitive obsession appears (UUIDs, names, linking codes, guild identifiers).

## Event-Driven Architecture Guide
- Emit domain events from aggregates via `this.apply(...)`; publish with `aggregate.commit()` in application handlers.
- Use commands for intent and events for facts that happened.
- Event handlers must be idempotent when writing externally visible state.
- Handle asynchronous failures through the dead-letter flow in `src/common/exceptions`.
- Register retry/replayable CQRS messages in the dead-letter registry when needed.
- Avoid event payloads that contain framework-specific classes; use serializable domain data.

## Implementation Rules For New Features
- Add one module per bounded context (e.g., `GuildModule`) when the context has inbound + outbound wiring.
- For each command use case:
  - Define command in domain.
  - Implement handler in application.
  - Call aggregate behavior in domain.
  - Persist through repository port.
  - Commit aggregate events.
- For each query use case (if introduced), keep read models separate from aggregate mutation logic.
- Keep Discord interactions in Discord adapters and HTTP concerns in REST controllers.
- Persist dead letters for unhandled command/event failures and expose controlled retries.

## Testing Strategy Expectations
- Domain tests: pure unit tests for aggregate invariants and domain errors.
- Application tests: handler tests with mocked ports.
- Adapter tests: integration tests for Prisma repositories and transport adapters.
- E2E tests: critical flows (account-link start/finish, error mapping, dead-letter retry path).

## Naming and Structure Conventions
- Keep folder semantics explicit: `domain`, `application`, `adapters`.
- Suffixes:
  - `*Command`, `*Handler`, `*Event`, `*Repository`, `*Adapter`, `*Module`.
- Keep transport DTOs out of domain/application layers.
- Keep generated Prisma client under `src/common/generated/prisma` as configured; do not hand-edit generated files.

## Known Risks and Improvement Targets
- `guilds` currently has domain elements but no complete module wiring; finish it using the same hexagonal pattern as `members`.
- Ensure all replay-critical messages are covered by dead-letter registration and retry tooling.
- Introduce outbox or broker-backed delivery if cross-service event guarantees become required.
- Add stronger idempotency and deduplication strategy for retries/replays.

## Build and Validation Workflow
- Install dependencies: `pnpm install`
- Run app in dev: `pnpm run start:dev`
- Run tests: `pnpm run test` and `pnpm run test:e2e`
- Lint/format before merging: `pnpm run lint` and `pnpm run format`

## Existing AI Instructions Scan
- Additional instruction files found in the repository root include:
  - `conquest-mod/AGENTS.md`
  - `conquest-mod-server/AGENTS.md`
- This `discord-bot/AGENTS.md` is the authoritative architecture guide for `discord-bot/`.

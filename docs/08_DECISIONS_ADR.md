# 08. Architecture Decision Records (ADRs)

An ADR records **context → decision → alternatives → consequences → revisit trigger**. Current statuses are `proposed` until tech spike/implementation validates them.

## ADR-001: Browser SPA over native/game engine

- **Status:** Validated locally in M1, 05.11.2026; awaiting author review.
- **Context:** Need a visually strong, shareable recruiter demo with short development cycle.
- **Decision:** React + TypeScript + Vite; isometric 2D scene via layered images/CSS/HTML hit-areas.
- **Alternatives:** Phaser, Unity, pure canvas, native mobile.
- **Why:** Browser URL without install; easier forms, accessibility, dashboards and integration with REST. Current user does not know React well — learning cost accepted.
- **Consequence:** Visual fidelity needs asset preparation; very free-form map mechanics become awkward.
- **Revisit if:** Tile map navigation, pathfinding or heavy animations exceed layered React capability.

## ADR-002: FastAPI + PostgreSQL, no Supabase in MVP

- **Status:** Proposed.
- **Decision:** Python FastAPI + SQLAlchemy + Alembic with direct PostgreSQL; no Supabase.
- **Why:** Aligns with Python/SQL experience and demonstrates API + backend logic directly.
- **Tradeoff:** Need our own migrations, connection and hosting config; no managed auth convenience.
- **Revisit if:** Auth/managed DB operations dominate the scope more than product code.

## ADR-003: Modular monolith, no microservices

- **Status:** Proposed.
- **Decision:** One backend with separated `api/domain/services/persistence/ai` modules.
- **Why:** A two-person-sized pet project does not need distributed systems.
- **Tradeoff:** Less architecture theatrics, simpler local environment and transaction boundaries.
- **Revisit if:** Independent agent workers or substantial scaling needs appear.

## ADR-004: One real AI Planner, LangGraph deferred

- **Status:** Proposed.
- **Decision:** One validated LLM-call workflow with explicit user acceptance; job status persisted.
- **Alternatives:** Several autonomous agents, LangGraph multi-step graph, direct client LLM.
- **Why:** Real functionality over fake multi-agent screen; smaller cost and security surface.
- **Tradeoff:** Agent visualizations intentionally simpler than mockup 06.
- **Revisit if:** Need branching tools, multi-step stateful actions or external agents.

## ADR-005: Server-authoritative economy + ledger

- **Status:** Proposed.
- **Decision:** Quest reward and building purchase are server transactions, with unique event keys.
- **Why:** Client-only counters are trivial to break, and duplicates undermine trust.
- **Tradeoff:** Slightly more backend work; valuable testable technical case.
- **Revisit if:** Never — authoritative domain state stays server-side.

## ADR-006: Anonymous per-visitor demo before account system

- **Status:** Proposed.
- **Decision:** Isolated guest session, initial demo content, TTL; no sign-in needed to try.
- **Why:** Recruiter should be able to demo in a minute without giving an email.
- **Tradeoff:** No cross-device persistence; cleanup and abuse protection needed.
- **Revisit if:** Actual user adoption suggests durable accounts are valuable.

## ADR-007: No fake delivery claims

- **Status:** Accepted — process rule.
- **Decision:** Screens are marked `concept`; roadmap items `planned`; metrics `not collected`; unbuilt features never called shipped.
- **Why:** Portfolio credibility depends on evidence, not inflated claims.
- **Consequence:** README/status must change with each real milestone.

## Decision log / changelog

| Date | ID | Status | Owner | Evidence |
|---|---|---|---|---|
| 2026-11-05 | 001–006 | Proposed | Author | Design discussion, docs v0.1 |
| 2026-11-05 | 007 | Accepted | Author | Transparency rule |

Before implementation, add concrete results of tech spikes and update proposal statuses.

## M1 implementation evidence — 05.11.2026

ADR-001 проверен локальным React/Vite build: SVG-здания и HTML-hotspots, формы, адаптивная навигация, browser screenshots. [Evidence](19_M1_EVIDENCE.md). SVG-геометрия выбрана как обратимое решение для первого спринта; исходные PNG-концепты не включены в приложение. ADR-002–006 остаются Proposed до backend-этапа.

## ADR-008: GigaChat для внутреннего планировщика

- **Status:** Accepted as provider choice by user,05.11.2026; live integration verification pending credentials.
- **Decision:** GigaChat через серверный OAuth/access token и JSON schema; без внешних tools. TLS всегда проверяется, дополнительный CA задаётся явно.
- **Evidence:** PostgreSQL+MockTransport tests, real approval UI. Ключей и живых вызовов в сессии не было.
- **Limits:** Дневной бюджет ограничивает число вызовов, а не рубли; денежный лимит уточняется по модели/тарифу перед публикацией.

## ADR-009: Наблюдение за внешними агентами через события

- **Status:** Proposed; implementation deferred.
- **Decision:** Пользовательский агент работает вне GuildLife, присылает аутентифицированные события; UI показывает источник, состояние и время последнего сообщения.
- **Consequence:** Команды запуска/остановки и реальные проценты не изображаются без отдельного контракта. Завершение агента не выдаёт награды.
- **Open:** Первый поддерживаемый источник и долговечное владение подключением после гостевого TTL; [details](20_EXTERNAL_AGENTS.md).

## M2 validation

ADR-002/003/005/006 проверены локально: PostgreSQL, миграции, гостевая изоляция, конкурентное завершение/строительство и reload. Это не production audit или окончательная приёмка автором. [Evidence](22_M2_EVIDENCE.md).

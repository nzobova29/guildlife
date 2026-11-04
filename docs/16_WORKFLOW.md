# 16. Working agreement — professional delivery without theater

## Roles and accountability

| Responsibility | Accountable party |
|---|---|
| Vision, scope, backlog, acceptance, final product decisions | Project author |
| Coding, integrations, tests, review, demo | Project author supported by AI tools |
| AI drafts/implementation suggestions | AI assistant; outputs require verification |
| User feedback | Invited testers, if/when recruited |

**Do not invent a 6-person team**. For the portfolio, owning an end-to-end solo project with transparent AI collaboration is stronger than fake management experience.

## Workflow

`Idea → issue (why/what/AC) → Ready → branch → small PR → review + tests → merge → demo/update doc`. 1–2 concurrent issues maximum.

### Git conventions

- Branch: `feat/GL-013-quest-rewards` / `fix/GL-024-ai-timeout`.
- Commit: `feat(quests): award XP once on completion`.
- PR: title `GL-013: Server-authoritative quest rewards`; description contains linked issue, tests, screenshots/contract change, rollback risk.
- Separate product/technical decisions into docs rather than leaving them only in chat.

## Definition of Ready (DoR)

- User/system outcome clear; acceptance criteria testable.
- Dependency resolved; affected frontend/backend/data boundaries named.
- P0 issue small enough for 1–2 focused sessions or split.
- Mockup link if UI; API/schema reference if backend.

## Definition of Done (DoD)

- Acceptance criteria met **in running app**.
- Tests for happy path and failure mode; CI green once configured.
- Edge cases: empty/loading/error, double click, permissions.
- Code readable enough author can explain; secrets absent.
- API/migration documented as needed, UI screenshot attached.
- Issue closed and demo path stays working.

## AI-assisted coding policy

- For each implementation request, provide context, target file/contract, non-goals, acceptance criteria and test instructions.
- No unreviewed giant diff; prefer small composable modules and typed interfaces.
- Read proposed dependencies/licenses; do not execute arbitrary install scripts blindly.
- Ask AI for tests and failure analysis but run and inspect results personally.
- Never claim a test passed because the assistant said so. Record command/output in PR.
- Credentials: `.env.example` with placeholders, `.env` ignored, no hardcoded secrets or real user data.

## Weekly mini-ceremony (10 minutes, not theater)

1. What milestone moved closer to demonstrable completion?
2. What is blocked and why?
3. Which P0 risks changed?
4. What should we **cut**, not add, next week?
5. Capture one real screenshot or test artifact.

## Decisions & scope changes

- Product behavior change → update PRD/acceptance tests.
- Important tech choice or reversal → ADR.
- Deadline threatened → cut P1/P2 before weakening P0 quality.
- Any external API cost or license risk → check before merging.

## GitHub Project fields (suggested)

`Status` (Backlog/Ready/In progress/Review/Done), `Priority` (P0/P1/P2), `Epic`, `Estimate` (S/M/L), `Milestone` (M0–M4). Labels: `frontend`, `backend`, `ai`, `gameplay`, `design`, `docs`, `bug`, `security`, `P0`, `P1`, `P2`.

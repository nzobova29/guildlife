# 09. Delivery roadmap, sequencing and scope control

**Estimate:** ~16–20 focused sessions over **3–5 weeks** if progress is regular; not a promise. Session = 2–4 hours of focused work. AI-generated code still needs review, integration, debugging and tests.

## Release target

A **polished working vertical slice**: enter demo → create campaign → AI plan → confirm → finish quest → receive reward → build → reload → see persistent state. Not a feature-complete RPG.

## Phase plan

| Phase | Sessions | Deliverables | Gate (definition of phase complete) |
|---|---:|---|---|
| **0. Scope & UX** | 1–2 | Approved PRD, one critical path, 4 buildings, design rules | MVP scope frozen; no blocker question on first journey |
| **1. Visual shell** | 2–3 | City scene, side nav, HUD, quest/campaign panels with fixture data | Looks coherent at 1440px and mobile fallback; clickable hotspots |
| **2. Real task engine** | 3–4 | FastAPI, Postgres, migrations, guest sessions, campaigns/quests | Create, complete, reload; idempotent rewards tests |
| **3. Economy & building** | 2–3 | Wallet, ledger, building UI/API, city state sync | First-build walkthrough end to end works |
| **4. AI Planner** | 2–3 | Real provider call, schema validation, approval, failure fallback | User can accept/edit plan; rate limits & invalid JSON handled |
| **5. Hardening & release** | 3–5 | E2E tests, CI, bugfix, accessibility, deploy, README/GIF/case | Release checklist passes, demo accessible |

### Milestone gates

- **M0 — PRD approved:** core loop & non-goals agreed, stories prioritized.
- **M1 — Visual demo:** convincing map + UI; clearly labeled fixture/mock mode.
- **M2 — Vertical slice without AI:** quest → reward → building persisted.
- **M3 — AI enabled:** one real planner + safe approval/fallback.
- **M4 — Public showcase:** link, GIF, reproducible local run, tests, honest case study.

## Critical path

Architecture decision → DB/game state → Quest completion + ledger → Building transaction → frontend integration → AI plan acceptance → E2E → deploy. Visual assets and documentation work run alongside, but never block the core path for more than one session.

## Scope control

**Timebox rule:** after M2, no new mechanics until basic flow is green. After M3, every new feature must replace an existing item or be placed post-release. Visual polishing has a fixed budget, not unlimited aesthetic perfection.

## Risk buffers

- Visual consistency: reuse coherent asset kit; do not regenerate every building separately without a style guide.
- React learning: keep components simple; use code review to learn `props/state/hooks` not build a custom engine.
- AI instability: a manual fallback keeps the game useful and demoable.
- Hosting: choose provider after a deployment spike; do not assume free tier or unlimited LLM credits.

## Definition of launch-ready

- Critical user path complete, no P0 bugs, documented local startup, reviewable PRs, working deployed URL.
- Database isolation and replay tests pass.
- Staging secrets not in repo; guest quota configured.
- Accessibility sanity check; screenshot/video match current app.
- Open issues and limitations honestly listed.

## Decision point if time runs short

Ship **manual campaigns + quests + city + rewards** first, as v0.1; AI follows as v0.2 with its own release note. Never label a scripted fake agent as live AI just to meet a date.

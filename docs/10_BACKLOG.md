# 10. Delivery backlog / prioritization

Source of truth before creating GitHub Issues: [`../planning/backlog.csv`](../planning/backlog.csv).

## Priority language

- **P0:** required for the demo core loop; blockers to MVP release.
- **P1:** improves experience, but releasable without it.
- **P2:** future idea, not a delivery promise.

## Epic map

| Epic | Outcome | Key tickets |
|---|---|---|
| E0 Product foundations | Scope and testable UX | GL-001–GL-004 |
| E1 Visual city | Recognizable world and navigation | GL-005–GL-009 |
| E2 Quest & persistence | Reliable daily core loop | GL-010–GL-017 |
| E3 Buildings | Visible conversion of progress | GL-018–GL-021 |
| E4 AI Planner | Safe actual AI functionality | GL-022–GL-026 |
| E5 Quality/release | Usable public proof | GL-027–GL-032 |
| E6 Stretch features | Only when core is done | GL-033–GL-036 |

## Ready-to-work standard for an Issue

Title `[GL-013] API — complete quest exactly once`; user or system outcome; scope; acceptance criteria; dependencies; test cases; priority. No vague issue «сделать красиво» without expected behavior.

## Example story / acceptance criteria

**GL-013 — Server-side idempotent quest completion (P0, E2)**

**Story:** Как пользователь, я хочу видеть, что один выполненный квест даёт ровно одну награду, независимо от двойного клика/плохой сети.

**Given** quest is `open` and owned by session, **when** `POST /quests/{id}/complete` is submitted twice concurrently, **then** quest is `done`, one `reward_ledger` entry exists and balance grew exactly once.

**Negative:** another session receives `404` or safe `403` without leaking data; invalid quest ID never alters balance; transaction rollback after error.

**Dependency:** GL-010, GL-011, GL-012, GL-014.

## Board columns

`Backlog` → `Ready` → `In progress` → `Review` → `Done` (+ `Blocked` label, not a column). Single WIP limit: maximum 2 issues `In progress`; avoid multitasking and visual rabbit holes.

## Size / estimation

`S` ~ up to one session; `M` ~1–2; `L` ~2–3 and should be split before starting. Estimates are rough effort guidance, not hourly guarantees. The CSV is a **planning model**, not logged historical velocity.

## Release tracking

Each merged PR links a `GL-...` issue, uses PR checklist, and changes relevant docs if behavior/architecture shifted. Milestone gates in Roadmap decide release, not the percentage of backlog checked off.

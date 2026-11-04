# 11. QA strategy, acceptance and release gates

## Quality is a product feature

Игровой UI может быть красивым и при этом ненадёжным. Для GuildLife главное: **один квест → одна награда → одно изменение города**, даже при сбоях, повторных запросах и перезагрузке.

## Testing pyramid (для масштаба проекта)

| Layer | Tools (proposed) | Test scope |
|---|---|---|
| Python unit | pytest | XP/coins, level, quest state, AI response validation |
| DB integration | pytest + temporary PostgreSQL | Guest ownership, race conditions, transactions, ledger constraints |
| API | FastAPI TestClient/httpx | HTTP validation, status, error responses, rate limiting |
| UI | Vitest + React Testing Library | Forms, disabled states, reward display, navigation |
| E2E | Playwright | First-session user journey at 1440px and mobile viewport |
| Manual visual | Browser screenshots | Isometric assets, stacking/z-index, readability, loading states |

## Test matrix — P0

| ID | Area | Expected result |
|---|---|---|
| QA-01 | Fresh visitor | Isolated demo and visible quest CTA |
| QA-02 | Create campaign | All valid fields stored; invalid ones rejected |
| QA-03 | Generate AI plan | Valid structured draft, no auto-save |
| QA-04 | Edit AI plan | User can remove/rename steps before accept |
| QA-05 | AI failure | Clear error and manual creation still works |
| QA-06 | Quest complete | Server reward exactly once |
| QA-07 | Concurrency | Parallel completion does not double-credit |
| QA-08 | Cross-session access | Can't fetch/edit another guest's data |
| QA-09 | Insufficient coins | No negative balance/building |
| QA-10 | Double build | No duplicate building; coins deducted once |
| QA-11 | Reload browser | Previous state persists |
| QA-12 | Empty state | Helpful CTA, not empty broken panel |
| QA-13 | Mobile fallback | UI accessible without horizontal overflow on 390px viewport (map may be simplified) |
| QA-14 | Keyboard | Primary flow possible via keyboard with visible focus |
| QA-15 | Security | No API key bundled in frontend/static artifacts |
| QA-16 | README honesty | No fake deployed link; feature statuses current |

Detailed acceptance cases: [`planning/acceptance_tests.csv`](../planning/acceptance_tests.csv).

## Quality gates for PR

1. Clear linked issue and acceptance conditions.
2. Lint/types/tests passed for affected components.
3. For UI: before/after screenshot, responsive check, loading/error/empty state.
4. For API: contract, validation, authorization and failure cases.
5. For AI: eval samples, malformed output and provider timeout.
6. README/PRD/ADR updated if public behavior or decision changed.

## Bug priority

- **P0 Critical:** data leak, API key leak, unlimited spend, reward duplication, broken first journey.
- **P1 High:** campaign can't save, building fails, game state lost, AI failure blocks manual tasks.
- **P2 Medium:** confusing panel, awkward layout, incorrect badges.
- **P3 Polish:** animation timing, minor spacing, nonblocking visual detail.

MVP cannot release with open P0/P1. P2/P3 may be listed transparently.

## Release rehearsal (manual, on deployed URL)

Use fresh browser profile → launch → create campaign via AI → edit draft → accept → finish task → verify coin change → build → refresh → see building → reopen from another guest session and confirm isolation. Simulate AI unavailable and ensure manual creation succeeds. Record actual result, tester/date and screenshot; **do not pre-check** these cases.

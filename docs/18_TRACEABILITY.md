# 18. Requirements traceability matrix — PRD → backlog → QA

**Purpose:** prove that important product promises turn into buildable tickets and testable acceptance cases. This is the full-MVP planning baseline. M1 frontend evidence now exists in [19_M1_EVIDENCE](19_M1_EVIDENCE.md); API, DB and AI acceptance cases remain pending.

| PRD requirement | Priority | Backlog owner issues | Acceptance / test evidence |
|---|---|---|---|
| FR-01 Guest demo & isolation | P0 | GL-011, GL-016 | QA-01, QA-08 |
| FR-02 City with hotspots | P0 | GL-006, GL-007 | QA-13, manual first-visit review |
| FR-03 Campaign create | P0 | GL-008, GL-012 | QA-02 |
| FR-04 Quest CRUD & completion | P0 | GL-009, GL-012, GL-013 | QA-06, QA-11 |
| FR-05 XP, wallet, ledger | P0 | GL-013, GL-014 | QA-06, QA-07 |
| FR-06 Building & spending | P0 | GL-018–GL-021 | QA-09, QA-10, QA-11 |
| FR-07 AI planning with approval | P0 | GL-022, GL-024 | QA-03, QA-04, QA-05 |
| FR-08 AI status & fallback | P0 | GL-023, GL-025, GL-026 | QA-05 and AI eval cases E-04/E-06 |
| FR-09 Persistent progress | P0 | GL-010, GL-012, GL-021 | QA-11 |
| FR-10 Home screen HUD | P0 | GL-006, GL-007, GL-015 | QA-01, QA-12, QA-13 |
| FR-11 Weekly recap | P1 | GL-036 | Add QA case if P1 promoted to P0 |
| FR-12 Seeded demo data | P0 | GL-016 | QA-01, QA-12 |

## Change-control rule

When promoting a P1 feature to MVP, add a backlog issue and a QA case **before** coding. If a P0 requirement has no implementation issue or acceptance test, M0 is not complete.

## Known gaps (intentionally tracked)

- Pixel-level building consistency and mobile layouts need a visual acceptance checklist after first browser prototype.
- AI outputs need golden test fixtures, provider configuration and recorded eval results before M3.
- Deployment platform choice and actual operational limits require a spike before M4.

## M1 evidence only

GL-005–009 реализованы локально и находятся в Review. `frontend/src/App.test.tsx` проверяет навигацию, локальную валидацию/подтверждение/отмену, квесты без наград и доступность ручного режима. Эти тесты **не закрывают** FR-01/FR-03/FR-04 в полном объёме: серверное сохранение и изоляция ещё отсутствуют. QA-13 проверен на 390px, QA-14 частично проверен для форм M1.

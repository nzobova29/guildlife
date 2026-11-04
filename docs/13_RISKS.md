# 13. RAID register (Risks / Assumptions / Issues / Dependencies)

Current structured register: [`planning/risk_register.csv`](../planning/risk_register.csv). Scores below are estimates **before implementation**.

## Rating model

Likelihood L = 1 (rare) to 5 (likely); Impact I = 1 (minor) to 5 (critical). `Score=L×I`; highest risks get owner, trigger, mitigation and check-in.

## Top risks

| ID | Risk | L×I | Mitigation |
|---|---|---:|---|
| R-01 | Art style inconsistent across generated assets | 4×4=16 | Freeze style guide; cohesive sprite/asset set; limited palette |
| R-02 | Scope grows to 8 fully functional screens | 5×4=20 | P0 gate, WIP limit, P1/P2 parking lot |
| R-03 | React learning + AI code mistakes slows debugging | 4×3=12 | Small typed components, short PRs, explain generated code |
| R-04 | AI provider returns invalid outputs / charges too much | 3×4=12 | Schema validation, global budget, rate limits, manual fallback |
| R-05 | Anonymous public demo abused / data leaked | 3×5=15 | Isolated guest IDs, limits, access tests, secret hygiene |
| R-06 | Reward duplication from parallel requests | 3×4=12 | DB uniqueness, transaction/locking, concurrency test |
| R-07 | Hosting difficulties close to launch | 3×4=12 | Deploy spike by milestone M2, not on final night |
| R-08 | Concept looks polished but no working core loop | 4×5=20 | Milestone M2 before extra cosmetic scope |

## Assumptions to validate

- User can understand a sparse city map and the reward loop without explanation.
- One AI Planner is enough to demonstrate usefulness; third-party agent integration is not required.
- 4 buildings + 1 plot give a credible first visual impression.
- A guest-only demo is enough for recruiters.
- Free/low-cost hosting capacity fits demo traffic — **must confirm before deploy**.

## External dependencies

LLM provider account/budget, hosting platform and DB instance, original/licensable UI art assets, GitHub access, time available for focused sessions. None should be reported «connected» until actually configured.

## Issues vs risks

Risk = may happen; Issue = already happened. When a risk triggers, create linked GitHub Issue, record actual impact and re-plan. This document is not a decorative risk list.

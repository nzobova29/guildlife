# GitHub Project setup (manual checklist)

1. Create repo `guildlife` (availability/name check first), default branch `main`.
2. Add all documentation from this package; keep status aligned with `README.md` (currently M1 local prototype, no backend).
3. Create GitHub Project Board with **Backlog → Ready → In progress → Review → Done**.
4. Add custom fields: Priority (P0,P1,P2), Epic (E0–E6), Milestone (M0–M4), Estimate (S/M/L).
5. Convert rows in `backlog.csv` to GitHub issues manually or with a verified import/script; **CSV is not guaranteed to be a one-click native GitHub Issues import**.
6. Attach labels, acceptance conditions, dependencies and the internal GL-IDs.
7. Adopt WIP=2, use the PR template, and move issues only when evidence exists.
8. Protect main after CI exists; require reviews/checks appropriate for a personal repo.
9. First issues: GL-001 → GL-004; do not begin the AI screen before the backend loop works.

Local repository already exists. No remote Project Board or Issues were created in the M1 implementation session. `backlog.csv` remains the local source of truth; Review means locally implemented, not merged or accepted by the author.

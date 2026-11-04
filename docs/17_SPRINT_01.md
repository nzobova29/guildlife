# 17. First sprint / first focused sessions

**Goal:** reach a convincing, navigable, non-functional **visual shell** while preserving a clear route to real logic. No fake claims of implemented AI, backend or working tasks.

## Sprint 0 / pre-coding — 1 session

- [ ] Review PRD / product brief and approve P0 list (GL-001).
- [ ] Choose **one** default camera frame and export separate city/building assets (GL-003).
- [ ] Freeze one top-priority 5-step journey (GL-002).
- [ ] Create GitHub repo; add these docs, set up Project Board and labels (GL-004).

**Exit:** M0 (scope agreed). Only then begin implementation.

## Sprint 1 — visual frontend, 2–3 sessions

**Session A:** create Vite+React+TS project; integrate theme tokens, routing/AppShell, side nav and resource bar. Prove build runs; no backend dependencies.

**Session B:** isometric map with separate tappable building hotspots; modal for Academy/Guild/Laboratory; stub data visibly labeled demo placeholders.

**Session C:** quests list panel and creation form; keyboard focus, empty/error placeholders; responsive fallback. Record screenshot at 1440×900.

**Exit:** M1 visual demo: buildings clickable, layout coherent, no illegible baked-in UI text. Test through keyboard and resize.

## Sprint 2 preview — server foundation

After M1: create FastAPI skeleton, PostgreSQL via Compose, DB migrations and a guest profile. Implement campaigns/quests and server idempotent rewards; pass a first DB integration test. **Do not jump to external AI until M2.**

## Session-level check-in template

```text
Date / session:
Goal (one demoable outcome):
Issues planned:
Done / screenshots / test evidence:
Blocked:
Decision/ADR needed:
Next single priority:
```

## End-of-sprint demo

Open the app, click at least 3 buildings, open Quest panel, navigate a form and back. Explain which controls are real versus placeholders. If it does not work reliably, don't start the next sprint just to check the box.

## Фактическое выполнение — 05.11.2026

Сессии A–C реализованы локально в ветке `feat/GL-005-visual-shell`; GL-005–009 переведены в Review. [Доказательства](19_M1_EVIDENCE.md): 6 тестов, lint/build, браузерные проверки и скриншоты. Панели зданий открываются отдельными разделами; формы — нативными диалогами. Серверные loading/error состояния перенесены в M2, поскольку M1 не делает сетевых операций. Внешняя доска, интервью и формальная приёмка автором не отмечены завершёнными.

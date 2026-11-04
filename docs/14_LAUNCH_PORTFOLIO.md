# 14. Launch plan & Technical PM portfolio case study

## Why this case is valuable

Not «I invented React», but: **I led a small AI-assisted product from concept through scope, solution design, implementation supervision, quality gates and a public demo**, understanding key backend/frontend/AI tradeoffs. In a solo/pet project, describe roles accurately: **product owner / project lead / hands-on builder**, not fabricated cross-functional team management.

## GitHub front page checklist

- [ ] Hero screenshot of **actual working application** (concepts clearly marked until then).
- [ ] Short GIF/video: add quest → reward → building → persist.
- [ ] Working demo link + limitations; no login requirement if guest flow is ready.
- [ ] Architecture diagram; rationale for stack and no Supabase/LangGraph.
- [ ] Feature status table with genuinely shipped vs planned.
- [ ] Clear local run after code exists (`compose up`, env example, migrations, tests).
- [ ] Brief screenshot index and docs navigator.
- [ ] Honest AI-assisted development statement.
- [ ] License/copyright decision before distributing assets publicly.

## Demo script (2–3 minutes)

1. **00:00–00:20:** What problem: task lists don't make long-term progress visible; GuildLife turns tasks into a world.
2. **00:20–00:50:** Show city, create a goal; AI suggests a campaign and human reviews it.
3. **00:50–01:20:** Finish a real quest, XP/coins added by API; show one reward ledger event.
4. **01:20–01:45:** Build on an empty plot; reload and show persistence.
5. **01:45–02:20:** Architecture/ADR: React vs game engine, Python domain logic, Postgres transactions, AI outputs validated.
6. **02:20–02:40:** Explain known limitations and next roadmap item; what you personally learned.

## Case study outline (STAR / problem–decision–result)

**Challenge:** Build a visually compelling productivity game without spending months on features.

**Ownership:** Product concept, target scenario, MVP prioritization, user journeys, architecture tradeoffs, backlog, acceptance criteria, test gates, release narrative.

**Technical decisions:** Why FastAPI, Postgres, React; why no complex agent stack; how server rules stop duplicated reward and keep costs bounded.

**Results:** Fill only after actual release: URL, screenshots, automated tests passed, feedback counts, issues resolved, features shipped, time spent. If no external users, say so.

**What I'd improve:** Genuine postmortem, not just successes. Example prompts: «Where did UI fidelity slow delivery?», «Which AI outputs were brittle?», «Which MVP assumptions were invalidated?».

## Evidence you should retain

- GitHub Projects screenshots from start/mid/end, not staged at the last minute.
- PRs with code review comments, before/after screenshots, test results.
- Small ADR log showing decisions and reversals.
- Release tags and changes; regression findings.
- Usability feedback with consent, anonymized.

## Interview talking points (no inflated claims)

- «Я выделила один основной игровой цикл и убрала мультиплеер, платежи и сложных агентов из MVP — иначе срок бы вырос».
- «Решила хранить кошелёк на сервере и вести ledger, потому что UI может отправить запрос дважды».
- «Ограничила модель только формированием черновика, чтобы её текст не менял игровые правила».
- «Использовала AI для генерации частей кода, но проверяла соответствие контрактам и тестировала критические сценарии».

## Release channels

Primary: public GitHub repo (only with rights-cleared assets), deployed demo link, optional short demo clip for portfolio/CV. No paid subscriptions or unsupported market promises.

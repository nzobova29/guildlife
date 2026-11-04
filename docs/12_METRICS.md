# 12. Metrics & observability plan

**Important:** никаких активных пользователей, retention, conversion или экономии времени у нас пока **нет**. Ниже — только план измерений.

## North Star (для тестов продукта)

**Meaningful weekly quest completions per active demo user** — число реально завершённых квестов, а не число запусков приложения или AI. Пока «meaningful» = вручную подтверждённая пользователем задача; это несовершенный proxy и его следует интерпретировать осторожно.

## Основная продуктовая воронка

`demo_started` → `campaign_create_started` → `campaign_created` → `quest_completed` → `building_constructed`

| Metric | Definition | Decision it informs |
|---|---|---|
| Activation | % demo_started → 1 quest_completed в первом сеансе | Понятен ли игровой цикл? |
| First value time | Время от старта до первого завершённого квеста | Насколько сложный онбординг? |
| Build conversion | % активированных, построивших хотя бы объект | Работает ли связь награды и города? |
| AI plan acceptance | % валидных черновиков, принятых после review | Дает ли агент полезный план? |
| AI failures | Число `failed / all AI jobs` | Надежность интеграции |
| Cost/job | Примерная стоимость обработки одного запроса | Можно ли оставлять бесплатный демо-доступ? |
| D7 return | Вернулся ли через 7 дней (только при наличии согласованной аналитики и достаточной выборки) | Первые сигналы удержания |

Не ставим публичные «целевые 80% retention» без основания. На раннем этапе записываем **наблюдения по 3–5 usability-тестам**, а не имитируем статистику.

## Event taxonomy (proposed)

| Event | Minimal fields | Never store |
|---|---|---|
| `demo_started` | anon session, ts, app_version | email / address |
| `campaign_created` | id, quest_count, source=manual/ai | full campaign text by default |
| `ai_job_started` | job_id, model_alias, ts | provider key |
| `ai_job_finished` | job_id, status, duration_ms, tokens if available | raw prompt without consent |
| `quest_completed` | quest_id, difficulty, xp, coins | sensitive task description |
| `building_constructed` | building_type, cost, ts | irrelevant user notes |
| `ui_error` | component, error_code, ts | personally identifying data |

**Storage policy:** logs for errors/system health; product event analytics opt-in or minimal consent-aware collection with documented retention. Never publish session-level raw events.

## Engineering telemetry

- HTTP status and latency by route; failed AI jobs; provider cost; DB transaction errors.
- Health check and availability from deployment platform, not invented SLA.
- Use request IDs for debugging; never expose full prompt or guest cookie in logs.

## Evidence log after each milestone

Record: date, git commit/tag, test suite result, screenshot, known issue, manual demo result. Portfolio claims must point to evidence, e.g., «интеграционные тесты подтвердили idempotency», not «надёжность 99.9%» without monitoring.

# 21. Запуск и подготовка публичного демо

## Локально — Docker Compose

Требуются Docker Desktop/Engine и Compose. Из корня `GuildLife`:

```sh
cp .env.example .env
# При повторном запуске сохрани свой существующий .env, не перезаписывай ключи.
docker compose up --build -d
```

Открой **http://127.0.0.1:8080**. Frontend nginx проксирует `/api` к FastAPI, PostgreSQL хранится в named volume. Backend и база не опубликованы на host-портах. `docker compose down` останавливает приложение, сохраняя volume; `down -v` удалит данные — не используй его для обычной остановки.

```sh
docker compose ps
docker compose logs --tail 50 backend
curl http://127.0.0.1:8080/api/v1/health
```

Выполнены реальные `docker compose build`, запуск и health check. Изменения фронтенда после запуска контейнеров требуют `docker compose up --build -d`; Vite для разработки работает отдельно на 5173. Cookies одного hostname не разделяются портами: при одновременной работе двух независимых баз лучше открывать Compose через `localhost:8080`, а Vite через `127.0.0.1:5173` либо использовать разные профили браузера. Иначе одинаковое имя гостевого cookie может переключать сессии между двумя локальными экземплярами.

## Разработка без Docker

Backend: Python 3.12+, PostgreSQL 17. Создай свою БД и пользователя; задай `DATABASE_URL`.

```sh
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
export DATABASE_URL='postgresql+psycopg://guildlife:YOUR_PASSWORD@127.0.0.1:5432/guildlife'
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
```

В другом терминале:

```sh
cd frontend
npm ci --ignore-scripts
npm run dev
```

`backend/.env.example` — шаблон переменных, **не автоматически загружаемый файл**. Передай переменные через окружение процесса/секреты хостинга. Никогда не помещай GigaChat credentials в `VITE_*`.

Во время разработки этого этапа использован отдельный локальный PostgreSQL на 55432: `guildlife_dev` и `guildlife_test`, пользователь `guildlife`. Эти базы не связаны с контейнерным volume. Данные каталога PostgreSQL расположены в `/private/tmp/guildlife-pg-m2`; это временная среда разработки, а не резервная копия или production storage.

## GigaChat

Выбран пользователем как единственный внутренний AI-провайдер. Для подключения на сервере задай:

- `GIGACHAT_AUTH_KEY` — authorization key для OAuth **или** `GIGACHAT_ACCESS_TOKEN` — действующий краткоживущий access token.
- `GIGACHAT_SCOPE` — scope своей учётной записи; пример в env: `GIGACHAT_API_PERS`.
- `GIGACHAT_MODEL` — доступная этой учётной записи модель.
- `AI_DAILY_CALL_BUDGET` — положительный **глобальный лимит количества запросов в сутки**, не денежный баланс. По умолчанию 0: реальные вызовы выключены.
- `AI_TIMEOUT_SECONDS` — общий timeout OAuth+генерации, по умолчанию 30, максимум 90 секунд. На гостя дополнительно максимум 2 вызова в сутки.

Секреты вводятся в `.env` или secret store, не в чате. При отсутствии настройки интерфейс честно показывает недоступность GigaChat, а ручные кампании работают.

TLS-проверка всегда включена. Если в среде нужен дополнительный доверенный CA, укажи `GIGACHAT_CA_BUNDLE` на проверенный PEM. В Docker для этого требуется явный read-only mount и env, например локальный `compose.override.yaml`:

```yaml
services:
  backend:
    environment:
      GIGACHAT_CA_BUNDLE: /certificates/gigachat-ca.pem
    volumes:
      - ./local-certificates/gigachat-ca.pem:/certificates/gigachat-ca.pem:ro
```

Не отключай проверку TLS. Получение доверенного сертификата и разрешённой модели проверяй по официальной документации [GigaChat API](https://developers.sber.ru/docs/ru/gigachat/api/reference/rest/gigachat-api) и [структурированного вывода](https://developers.sber.ru/docs/ru/gigachat/guides/structured-output).

Адаптер и ошибки проверены HTTP doubles. Живой вызов, качество планирования E-01…E-03 и тарифный бюджет **ещё не проверены**: учётные данные не предоставлены.

## Проверки

```sh
cd frontend
npm test
npm run lint
npm run build
```

Backend-тесты очищают данные **только выделенной тестовой PostgreSQL**, имя которой обязано заканчиваться `_test`. Никогда не передавай рабочую базу:

```sh
cd backend
TEST_DATABASE_URL='postgresql+psycopg://guildlife:YOUR_PASSWORD@127.0.0.1:5432/guildlife_test' .venv/bin/python -m pytest -q
.venv/bin/ruff check app tests alembic
.venv/bin/ruff format --check app tests alembic
```

CI frontend и PostgreSQL backend настроен в `.github/workflows/`; remote CI не запускался в этой сессии.

## До публикации

Подготовка контейнеров завершена, **публичного URL пока нет**. Для релиза нужны:

- Выбор hosting/домена, HTTPS reverse proxy и резервируемая PostgreSQL; текущий Compose намеренно доступен только на loopback.
- Сильный пароль БД, production secrets, точный `ALLOWED_ORIGINS` и `COOKIE_SECURE=true`.
- Настроенные ограничения входящего трафика/создания гостевых сессий, очистка истёкших гостевых данных с учётом append-only ledger, политика хранения и восстановления из backup. TTL сейчас запрещает доступ к истёкшему гостю, но не удаляет строки автоматически.
- Живой GigaChat eval с заданным лимитом и проверкой стоимости, либо выпуск ручного режима с честной маркировкой недоступного AI.
- Проверка сценария на опубликованном адресе, реальный CI, визуальная приёмка автором и проверка прав на публичные материалы.

Внешние пользовательские агенты — отдельный этап, см. [контракт событий](20_EXTERNAL_AGENTS.md).

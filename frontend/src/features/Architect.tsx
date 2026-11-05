import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, FlaskConical, Info, Plus, Trash2 } from "lucide-react";
import { gameApi, errorMessage, type AiJob, type Plan } from "../api/game";
import { difficultyLabels } from "../data/demo";

const statusNames: Record<AiJob["status"], string> = {
  queued: "В очереди",
  running: "Выполняется",
  awaiting_approval: "Ждёт проверки",
  done: "План принят",
  failed: "Не удалось составить план",
};
const failureNames: Record<string, string> = {
  provider_timeout: "GigaChat не успел ответить. Можно повторить позже.",
  provider_auth_error:
    "Не удалось подключиться к GigaChat. Проверь серверную настройку доступа.",
  provider_error: "GigaChat временно недоступен.",
  invalid_response:
    "GigaChat вернул некорректный план. Уточни цель и попробуй снова.",
  invalid_plan: "План не прошёл проверку структуры или доступного времени.",
  interrupted: "Запрос был прерван перезапуском сервера.",
  ai_tls_config: "Нужно проверить серверную настройку сертификата GigaChat.",
};

export function Architect({
  preview,
  available,
  onManual,
  onAccept,
}: {
  preview: boolean;
  available: boolean;
  onManual: () => void;
  onAccept: (id: string, plan: Plan) => Promise<void>;
}) {
  const [goal, setGoal] = useState("");
  const [hours, setHours] = useState("4");
  const [deadline, setDeadline] = useState("");
  const [context, setContext] = useState("");
  const [consent, setConsent] = useState(false);
  const [jobs, setJobs] = useState<AiJob[]>([]);
  const [selected, setSelected] = useState<AiJob | null>(null);
  const [draft, setDraft] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(!preview);
  const [error, setError] = useState("");
  useEffect(() => {
    let current = true;
    if (!preview)
      gameApi
        .listJobs()
        .then((items) => {
          if (current) setJobs(items);
        })
        .catch((cause) => {
          if (current) setError(errorMessage(cause));
        })
        .finally(() => {
          if (current) setLoading(false);
        });
    return () => {
      current = false;
    };
  }, [preview]);
  function select(job: AiJob) {
    setSelected(job);
    setDraft(job.draft ? structuredClone(job.draft) : null);
    setError("");
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (goal.trim().length < 3) {
      setError("Опиши цель хотя бы тремя символами.");
      return;
    }
    if (!consent) {
      setError("Подтверди передачу цели и контекста в GigaChat.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const job = await gameApi.plan({
        goal: goal.trim(),
        hours: Number(hours),
        deadline: deadline || null,
        context: context.trim(),
      });
      setJobs((items) => [job, ...items]);
      select(job);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  function edit(update: (next: Plan) => void) {
    if (!draft) return;
    const next = structuredClone(draft);
    update(next);
    setDraft(next);
  }
  const editable = selected?.status === "awaiting_approval" && draft;
  return (
    <section className="content-panel architect-panel">
      <span className="eyebrow">ЛАБОРАТОРИЯ · GIGACHAT</span>
      <h2>Архитектор</h2>
      <p className="muted">
        Планировщик предложит шаги, а окончательное решение останется за тобой.
      </p>
      {!available && (
        <div className="availability">
          <Info size={20} />
          <div>
            <strong>AI ещё не подключён</strong>
            <p>
              Для GigaChat нужно настроить серверный доступ и лимит запросов. Ты
              можешь создавать кампании вручную.
            </p>
          </div>
        </div>
      )}
      <button className="button secondary" onClick={onManual}>
        Создать кампанию вручную
        <ArrowRight size={16} />
      </button>
      <form className="planner-form" onSubmit={submit}>
        <label htmlFor="ai-goal">Твоя цель</label>
        <input
          id="ai-goal"
          value={goal}
          maxLength={2000}
          onChange={(event) => setGoal(event.target.value)}
          placeholder="Подготовиться к экзамену по физике"
          required
          disabled={busy}
        />
        <div className="form-columns">
          <div>
            <label htmlFor="ai-hours">Часов в неделю</label>
            <input
              id="ai-hours"
              type="number"
              required
              min="1"
              max="40"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
              disabled={busy}
            />
          </div>
          <div>
            <label htmlFor="ai-deadline">Дедлайн · необязательно</label>
            <input
              id="ai-deadline"
              type="date"
              value={deadline}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(event) => setDeadline(event.target.value)}
              disabled={busy}
            />
          </div>
        </div>
        <label htmlFor="ai-context">Что важно учесть?</label>
        <textarea
          id="ai-context"
          rows={3}
          value={context}
          maxLength={4000}
          onChange={(event) => setContext(event.target.value)}
          placeholder="Что уже знаешь, что сложнее всего, каким должен быть результат"
          disabled={busy}
        />
        <label className="consent-label">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            disabled={busy}
          />
          Разрешаю передать эту цель и контекст в GigaChat для составления
          плана.
        </label>
        <p className="form-note">
          Не добавляй пароли и другие секреты. План не изменяет город и не
          создаёт квесты до твоего подтверждения.
        </p>
        <button
          className="button primary"
          disabled={!available || preview || busy || !consent}
          type="submit"
        >
          <FlaskConical size={17} />
          {busy ? "Ожидаем ответ сервера…" : "Предложить AI-план"}
        </button>
        {busy && (
          <p role="status" className="muted">
            Запрос выполняется. Ответ может занять до полутора минут.
          </p>
        )}
      </form>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {loading && <p role="status">Загружаем сохранённые запросы…</p>}
      {!preview && !loading && jobs.length === 0 && (
        <p className="form-note">
          Здесь появятся реальные запросы планировщика. Сейчас их нет.
        </p>
      )}
      {jobs.length > 0 && (
        <div className="job-history">
          <h3>Твои запросы</h3>
          {jobs.map((job) => (
            <button
              className="button secondary"
              key={job.id}
              onClick={() => select(job)}
              disabled={busy}
            >
              {job.draft?.title || "Запрос планировщика"} ·{" "}
              {statusNames[job.status]}
            </button>
          ))}
        </div>
      )}
      {selected && (
        <div className="plan-review">
          <div className="section-title">
            <h3>{statusNames[selected.status]}</h3>
            <span className="pill">GigaChat</span>
          </div>
          {selected.status === "failed" && (
            <p className="form-error" role="alert">
              {failureNames[selected.error_code || ""] ||
                "План не готов. Можно продолжить вручную или попробовать позже."}
            </p>
          )}
          {selected.status === "done" && (
            <p>
              Эта кампания уже сохранена. Повторное принятие не создаёт
              дубликаты.
            </p>
          )}
          {(selected.status === "running" || selected.status === "queued") && (
            <button
              className="button secondary"
              onClick={async () => {
                try {
                  const items = await gameApi.listJobs();
                  setJobs(items);
                  const job = items.find((j) => j.id === selected.id);
                  if (job) select(job);
                } catch (cause) {
                  setError(errorMessage(cause));
                }
              }}
            >
              Обновить статус
            </button>
          )}
          {editable && (
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                if (!draft || !selected) return;
                setBusy(true);
                setError("");
                try {
                  await onAccept(selected.id, draft);
                } catch (cause) {
                  setError(errorMessage(cause));
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label htmlFor="plan-title">Название плана</label>
              <input
                id="plan-title"
                value={draft.title}
                required
                minLength={3}
                maxLength={140}
                disabled={busy}
                onChange={(event) =>
                  edit((next) => {
                    next.title = event.target.value;
                  })
                }
              />
              {draft.milestones.map((milestone, mi) => (
                <fieldset key={mi} disabled={busy} className="milestone">
                  <legend>Этап {mi + 1}</legend>
                  <label htmlFor={`milestone-${mi}`}>Название этапа</label>
                  <input
                    id={`milestone-${mi}`}
                    value={milestone.title}
                    required
                    minLength={3}
                    maxLength={140}
                    onChange={(event) =>
                      edit((next) => {
                        next.milestones[mi].title = event.target.value;
                      })
                    }
                  />
                  {milestone.quests.map((quest, qi) => (
                    <div className="plan-quest" key={qi}>
                      <label htmlFor={`pq-${mi}-${qi}`}>Квест {qi + 1}</label>
                      <input
                        id={`pq-${mi}-${qi}`}
                        value={quest.title}
                        minLength={3}
                        maxLength={140}
                        required
                        onChange={(event) =>
                          edit((next) => {
                            next.milestones[mi].quests[qi].title =
                              event.target.value;
                          })
                        }
                      />
                      <label htmlFor={`pd-${mi}-${qi}`}>
                        Результат действия
                      </label>
                      <textarea
                        id={`pd-${mi}-${qi}`}
                        value={quest.description}
                        required
                        minLength={3}
                        maxLength={1000}
                        onChange={(event) =>
                          edit((next) => {
                            next.milestones[mi].quests[qi].description =
                              event.target.value;
                          })
                        }
                      />
                      <div className="form-columns">
                        <div>
                          <label htmlFor={`pm-${mi}-${qi}`}>Минут</label>
                          <input
                            id={`pm-${mi}-${qi}`}
                            type="number"
                            value={quest.estimated_minutes}
                            required
                            min={5}
                            max={180}
                            onChange={(event) =>
                              edit((next) => {
                                next.milestones[mi].quests[
                                  qi
                                ].estimated_minutes = Number(
                                  event.target.value,
                                );
                              })
                            }
                          />
                        </div>
                        <div>
                          <label htmlFor={`ps-${mi}-${qi}`}>Размер шага</label>
                          <select
                            id={`ps-${mi}-${qi}`}
                            value={quest.difficulty}
                            onChange={(event) =>
                              edit((next) => {
                                next.milestones[mi].quests[qi].difficulty =
                                  event.target.value as typeof quest.difficulty;
                              })
                            }
                          >
                            {Object.entries(difficultyLabels).map(
                              ([key, label]) => (
                                <option value={key} key={key}>
                                  {label}
                                </option>
                              ),
                            )}
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-button"
                        disabled={milestone.quests.length === 1}
                        onClick={() =>
                          edit((next) => {
                            next.milestones[mi].quests.splice(qi, 1);
                          })
                        }
                      >
                        <Trash2 size={14} />
                        Убрать квест
                      </button>
                    </div>
                  ))}
                  {draft.milestones.length > 2 && (
                    <button
                      type="button"
                      className="text-button"
                      onClick={() =>
                        edit((next) => {
                          next.milestones.splice(mi, 1);
                        })
                      }
                    >
                      <Trash2 size={14} />
                      Убрать этап
                    </button>
                  )}
                </fieldset>
              ))}
              {draft.assumptions.length > 0 && (
                <div className="availability">
                  <Info size={18} />
                  <div>
                    <strong>Предположения планировщика</strong>
                    <ul>
                      {draft.assumptions.map((value, index) => (
                        <li key={index}>{value}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              <p className="form-note">{draft.disclaimer}</p>
              <div className="form-actions">
                <button
                  type="button"
                  className="button secondary"
                  disabled={busy}
                  onClick={() => {
                    setSelected(null);
                    setDraft(null);
                  }}
                >
                  Закрыть без сохранения
                </button>
                <button className="button primary" disabled={busy}>
                  <Plus size={17} />
                  {busy ? "Сохраняем…" : "Принять план"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </section>
  );
}

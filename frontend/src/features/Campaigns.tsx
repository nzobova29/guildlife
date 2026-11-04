import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Plus,
  Flag,
  Clock3,
} from "lucide-react";
import { Dialog } from "../components/Dialog";
import type { Campaign, Quest } from "../data/demo";

export function Campaigns({
  campaigns,
  quests,
  onNew,
  onQuests,
}: {
  campaigns: Campaign[];
  quests: Quest[];
  onNew: () => void;
  onQuests: () => void;
}) {
  return (
    <section className="content-panel">
      <div className="section-title">
        <div>
          <span className="eyebrow">АКАДЕМИЯ</span>
          <h2>Твои кампании</h2>
        </div>
        <button className="button primary" onClick={onNew}>
          <Plus size={17} />
          Новая кампания
        </button>
      </div>
      <p className="muted">
        Большие цели становятся ближе, когда у них есть первый шаг.
      </p>
      <div className="campaign-grid">
        {campaigns.map((campaign) => {
          const tasks = quests.filter((q) => q.campaignId === campaign.id);
          const done = tasks.filter((q) => q.done).length;
          return (
            <article className="campaign-card" key={campaign.id}>
              <div className="card-top">
                <span className="feature-icon">
                  <BookOpen size={23} />
                </span>
                <span className="pill">Демокампания</span>
              </div>
              <h3>{campaign.title}</h3>
              <p>{campaign.description || "Начни с одного небольшого дела."}</p>
              <div className="campaign-meta">
                <span>
                  <Clock3 size={14} /> {campaign.hours} ч / неделю
                </span>
                <span>
                  <CalendarDays size={14} />
                  {campaign.deadline || "Без дедлайна"}
                </span>
              </div>
              <div className="progress-label">
                <span>Квесты кампании</span>
                <strong>
                  {done} / {tasks.length}
                </strong>
              </div>
              <progress
                value={done}
                max={tasks.length || 1}
                aria-label={`Прогресс: ${campaign.title}`}
              />
              <button className="text-button" onClick={onQuests}>
                {tasks.length ? "Открыть квесты" : "Добавить первый квест"}
                <ArrowRight size={16} />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function CampaignForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (campaign: Campaign) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [hours, setHours] = useState("4");
  const [review, setReview] = useState(false);
  const [error, setError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (review) headingRef.current?.focus();
  }, [review]);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (title.trim().length < 3 || title.trim().length > 140) {
      setError("Введи название от 3 до 140 символов.");
      return;
    }
    if (
      !Number.isFinite(Number(hours)) ||
      Number(hours) < 1 ||
      Number(hours) > 40
    ) {
      setError("Укажи от 1 до 40 часов в неделю.");
      return;
    }
    setError("");
    setReview(true);
  }
  return (
    <Dialog title="Новая кампания" onClose={onClose}>
      <span className="feature-icon large">
        <Flag size={28} />
      </span>
      <h2 ref={headingRef} tabIndex={-1}>{review ? "Проверь свою цель" : "С чего начнётся твоя история?"}</h2>
      <p className="muted">
        {review
          ? "Кампания появится только после твоего подтверждения."
          : "Одна цель. Посильный темп. Твой собственный путь."}
      </p>
      <div className="step-track">
        <span className={!review ? "active" : ""}>01 · Цель</span>
        <i />
        <span className={review ? "active" : ""}>02 · Проверка</span>
      </div>
      {review ? (
        <>
          <div className="review-card">
            <h3>{title.trim()}</h3>
            <p>{description.trim() || "Без описания"}</p>
            <dl>
              <dt>Дедлайн</dt>
              <dd>{deadline || "Без дедлайна"}</dd>
              <dt>Время на цель</dt>
              <dd>{hours} ч / неделю</dd>
            </dl>
          </div>
          <p className="form-note">
            Это локальный пример. AI не используется, данные не отправляются на
            сервер.
          </p>
          <div className="form-actions">
            <button
              className="button secondary"
              onClick={() => setReview(false)}
            >
              Изменить
            </button>
            <button
              className="button primary"
              onClick={() =>
                onSave({
                  id: crypto.randomUUID(),
                  title: title.trim(),
                  description: description.trim(),
                  deadline,
                  hours: Number(hours),
                })
              }
            >
              Добавить в демо
              <ArrowRight size={16} />
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={submit}>
          <label htmlFor="campaign-title">Название кампании</label>
          <input
            id="campaign-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Например, подготовиться к экзамену"
            maxLength={140}
            aria-invalid={!!error}
            aria-describedby={error ? "campaign-error" : undefined}
            autoFocus
          />
          <label htmlFor="campaign-description">Что хочешь изменить?</label>
          <textarea
            id="campaign-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Опиши, каким будет результат"
            maxLength={2000}
            rows={3}
          />
          <div className="form-columns">
            <div>
              <label htmlFor="campaign-deadline">Дедлайн · необязательно</label>
              <input
                id="campaign-deadline"
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="campaign-hours">Часов в неделю</label>
              <input
                id="campaign-hours"
                type="number"
                min="1"
                max="40"
                required
                value={hours}
                onChange={(event) => setHours(event.target.value)}
              />
            </div>
          </div>
          {error && (
            <p id="campaign-error" className="form-error" role="alert">
              {error}
            </p>
          )}
          <p className="form-note">
            Ручное планирование · изменения исчезнут после перезагрузки.
          </p>
          <div className="form-actions">
            <button
              type="button"
              className="button secondary"
              onClick={onClose}
            >
              Отмена
            </button>
            <button className="button primary" type="submit">
              Проверить кампанию
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

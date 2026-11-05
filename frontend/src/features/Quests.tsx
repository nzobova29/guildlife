import { useState, type FormEvent } from "react";
import {
  Check,
  CheckCheck,
  Coins,
  Pencil,
  Plus,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import { Dialog } from "../components/Dialog";
import {
  difficultyLabels,
  rewardPreview,
  type Quest,
  type Campaign,
  type Difficulty,
} from "../data/demo";

export function Quests({
  quests,
  campaigns,
  onSave,
  onComplete,
  busy = false,
  preview = true,
}: {
  quests: Quest[];
  campaigns: Campaign[];
  onSave: (quest: Quest, isNew: boolean) => Promise<void>;
  onComplete: (id: string) => Promise<void>;
  busy?: boolean;
  preview?: boolean;
}) {
  const [filter, setFilter] = useState<"open" | "done" | "all">("open");
  const [editing, setEditing] = useState<Quest | "new" | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const shown = quests.filter(
    (q) => filter === "all" || q.done === (filter === "done"),
  );
  return (
    <section className="content-panel">
      <div className="section-title">
        <div>
          <span className="eyebrow">ГИЛЬДИЯ</span>
          <h2>Гильдия квестов</h2>
        </div>
        <button className="button primary" onClick={() => setEditing("new")}>
          <Plus size={17} />
          Новый квест
        </button>
      </div>
      <p className="muted">
        Здесь начинается прогресс. Одно реальное дело за раз.
      </p>
      <div className="quest-toolbar">
        <div className="tabs" aria-label="Фильтр квестов">
          {(
            [
              ["open", "Впереди"],
              ["done", "Готово"],
              ["all", "Все"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              aria-pressed={filter === value}
              className={filter === value ? "selected" : ""}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="muted">
          {quests.filter((q) => q.done).length} / {quests.length} выполнено
        </span>
      </div>
      <p className="form-note">
        {preview
          ? "Демоквесты · завершение меняет только карточку. Награды пока не начисляются."
          : "Отмечай сделанное в реальности. Награду за каждый квест сервер начислит один раз."}
      </p>
      <div className="quest-list">
        {shown.map((quest) => (
          <article
            className={`quest-card ${quest.done ? "is-done" : ""}`}
            key={quest.id}
          >
            <button
              className="quest-check"
              aria-label={`${quest.done ? "Завершено" : "Завершить"}: ${quest.title}`}
              disabled={quest.done || busy}
              onClick={async () => {
                setError("");
                setNotice("");
                try {
                  await onComplete(quest.id);
                  setNotice(
                    preview
                      ? "Квест отмечен в демо. XP и монеты не начислены."
                      : "Квест завершён. Награда подтверждена сервером.",
                  );
                } catch (cause) {
                  setError(
                    cause instanceof Error
                      ? cause.message
                      : "Не удалось завершить квест.",
                  );
                }
              }}
            >
              {quest.done && <Check size={17} />}
            </button>
            <div className="quest-copy">
              <h3>{quest.title}</h3>
              <p>
                {campaigns.find((c) => c.id === quest.campaignId)?.title ||
                  "Личный квест"}
                <span> · {difficultyLabels[quest.difficulty]}</span>
              </p>
            </div>
            <div
              className="quest-reward"
              aria-label={
                preview ? "Пример будущей награды" : "Награда за выполнение"
              }
            >
              <span>
                <Sparkles size={13} />
                {rewardPreview[quest.difficulty].xp} XP
              </span>
              <small>
                <Coins size={12} />
                {rewardPreview[quest.difficulty].coins}
              </small>
            </div>
            {!quest.done && (
              <button
                className="icon-button"
                aria-label={`Изменить: ${quest.title}`}
                onClick={() => setEditing(quest)}
              >
                <Pencil size={16} />
              </button>
            )}
          </article>
        ))}
      </div>
      {!shown.length && (
        <div className="empty-state">
          <CheckCheck size={40} />
          <h3>
            {filter === "done"
              ? "Пока нет завершённых квестов"
              : "Можно выдохнуть"}
          </h3>
          <p>
            {filter === "done"
              ? "Отметь первое выполненное дело — оно появится здесь."
              : "Все текущие дела закончены. Добавь следующий небольшой шаг."}
          </p>
          <button
            className="button secondary"
            onClick={() => setEditing("new")}
          >
            <Plus size={16} />
            Новый квест
          </button>
        </div>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <p className="inline-status" role="status">
        {notice}
      </p>
      {editing && (
        <QuestForm
          quest={editing === "new" ? undefined : editing}
          campaigns={campaigns}
          onClose={() => setEditing(null)}
          preview={preview}
          onSave={async (quest) => {
            await onSave(quest, editing === "new");
            setEditing(null);
            setFilter("open");
            setNotice(
              preview
                ? "Изменения сохранены только в этом демо."
                : "Квест сохранён.",
            );
          }}
        />
      )}
    </section>
  );
}

function QuestForm({
  preview,
  quest,
  campaigns,
  onSave,
  onClose,
}: {
  quest?: Quest;
  campaigns: Campaign[];
  onSave: (quest: Quest) => Promise<void>;
  preview: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(quest?.title || "");
  const [difficulty, setDifficulty] = useState<Difficulty>(
    quest?.difficulty || "medium",
  );
  const [campaignId, setCampaignId] = useState(quest?.campaignId || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (title.trim().length < 3) {
      setError("Введи название от 3 до 140 символов.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({
        id: quest?.id || crypto.randomUUID(),
        title: title.trim(),
        difficulty,
        done: false,
        campaignId,
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Не удалось сохранить квест.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog
      title={quest ? "Изменить квест" : "Новый квест"}
      onClose={() => {
        if (!saving) onClose();
      }}
    >
      <span className="feature-icon large">
        <ClipboardList size={27} />
      </span>
      <h2>{quest ? "Уточни следующий шаг" : "Одно дело — один квест"}</h2>
      <p className="muted">
        Выбери действие, которое можно сделать в реальности.
      </p>
      <form onSubmit={submit}>
        <label htmlFor="quest-title">Название квеста</label>
        <input
          id="quest-title"
          value={title}
          maxLength={140}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Например, прочитать первую главу"
          aria-invalid={!!error}
          aria-describedby={error ? "quest-error" : undefined}
          autoFocus
        />
        <label htmlFor="quest-campaign">Кампания</label>
        <select
          id="quest-campaign"
          value={campaignId}
          onChange={(event) => setCampaignId(event.target.value)}
        >
          <option value="">Личный квест</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <label htmlFor="quest-difficulty">Размер шага</label>
        <select
          id="quest-difficulty"
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value as Difficulty)}
        >
          {Object.entries(difficultyLabels).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
        <div className="reward-example">
          <span>
            {preview ? "Пример будущей награды" : "Награда за выполнение"}
          </span>
          <strong>
            {rewardPreview[difficulty].xp} XP ·{" "}
            {rewardPreview[difficulty].coins} монет
          </strong>
        </div>
        {error && (
          <p id="quest-error" className="form-error" role="alert">
            {error}
          </p>
        )}
        <p className="form-note">
          {preview
            ? "Деморежим: без сохранения на сервере и начисления наград."
            : "Квест сохранится в твоём гостевом сеансе."}
        </p>
        <div className="form-actions">
          <button
            type="button"
            className="button secondary"
            onClick={onClose}
            disabled={saving}
          >
            Отмена
          </button>
          <button className="button primary" type="submit" disabled={saving}>
            {saving
              ? "Сохраняем…"
              : quest
                ? "Сохранить изменения"
                : "Добавить квест"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

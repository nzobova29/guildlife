import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Compass,
  FlaskConical,
  Plus,
  Sprout,
} from "lucide-react";
import { CityMap } from "./CityMap";
import type { GameState } from "../api/game";
import type { Page } from "../data/demo";

export function Home({
  state,
  preview,
  onNavigate,
  onCampaign,
}: {
  state: GameState;
  preview: boolean;
  onNavigate: (page: Page) => void;
  onCampaign: () => void;
}) {
  const completed = state.quests.filter((q) => q.done).length;
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">МАЛЕНЬКИЕ ШАГИ. БОЛЬШОЙ МИР.</span>
          <h1>Твой город начинается с тебя.</h1>
          <p>Превращай реальные дела в квесты. Строй то, что важно.</p>
        </div>
        <button className="button primary" onClick={onCampaign}>
          <Plus size={18} />
          Новая кампания
        </button>
      </div>
      <div className="world-layout">
        <div className="world-column">
          <CityMap onNavigate={onNavigate} constructed={state.buildings} />
          <div className="journey-strip">
            <div>
              <span className="journey-icon">
                <Compass size={21} />
              </span>
              <span>
                <strong>От цели — к своему городу</strong>
                <small>Один понятный шаг запускает большую историю.</small>
              </span>
            </div>
            <ol>
              <li>
                <span>01</span>Цель
              </li>
              <li>
                <span>02</span>Квест
              </li>
              <li>
                <span>03</span>Город
              </li>
            </ol>
          </div>
        </div>
        <aside className="today-panel" aria-label="С чего начать">
          <div className="section-title">
            <span className="eyebrow">ТВОЙ СЛЕДУЮЩИЙ ШАГ</span>
            <Sprout size={18} />
          </div>
          <h2>
            Всё начинается
            <br />с малого.
          </h2>
          <p className="muted">
            Не нужен идеальный план.
            <br />
            Достаточно первого квеста.
          </p>
          <div className="today-progress">
            <span>{preview ? "Квесты в демо" : "Твои квесты"}</span>
            <strong>
              {completed}
              <span> / {state.quests.length}</span>
            </strong>
            <progress
              value={completed}
              max={state.quests.length || 1}
              aria-label="Выполненные квесты"
            />
          </div>
          <div className="mini-quests">
            {state.quests
              .filter((q) => !q.done)
              .slice(0, 3)
              .map((q, index) => (
                <button key={q.id} onClick={() => onNavigate("quests")}>
                  <span className="mini-number">0{index + 1}</span>
                  <span>{q.title}</span>
                  <ChevronRight size={15} />
                </button>
              ))}
            {state.quests.every((q) => q.done) && (
              <p className="muted">
                Все текущие квесты завершены. Можно добавить новый.
              </p>
            )}
          </div>
          <button
            className="button secondary full-width"
            onClick={() => onNavigate("quests")}
          >
            Открыть квесты
            <ArrowRight size={16} />
          </button>
          <div className="planner-teaser">
            <span className="feature-icon">
              <FlaskConical size={21} />
            </span>
            <div>
              <strong>Знакомься, Архитектор</strong>
              <p>
                {state.ai_available
                  ? "Планировщик целей на GigaChat."
                  : "Планировщик на GigaChat. Подключение ещё настраивается."}
              </p>
            </div>
            <button
              className="icon-button"
              aria-label="Открыть Архитектора"
              onClick={() => onNavigate("architect")}
            >
              <ArrowUpRight size={18} />
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}

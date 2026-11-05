import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  Coins,
  Info,
  Layers3,
  Map,
  Sparkles,
  CheckCheck,
  BookOpen,
  Landmark,
  Leaf,
  ArrowRight,
} from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { Home } from "./components/Home";
import { CampaignForm, Campaigns } from "./features/Campaigns";
import { Quests } from "./features/Quests";
import { BuildPanel } from "./features/BuildPanel";
import { Architect } from "./features/Architect";
import { useGame } from "./api/useGame";
import { gameApi } from "./api/game";
import type { Page } from "./data/demo";

const titles: Record<Page, string> = {
  city: "Город",
  quests: "Квесты",
  campaigns: "Кампании",
  architect: "Архитектор",
  build: "Строительство",
  progress: "Прогресс",
};
const headings: Partial<Record<Page, string>> = {
  quests: "Реальные дела. Видимый прогресс.",
  campaigns: "У каждой цели есть начало.",
  architect: "Большая цель — понятный маршрут.",
  build: "Место для будущих достижений.",
  progress: "Каждый шаг имеет значение.",
};
function currentPage(): Page {
  const hash = window.location.hash.slice(1);
  return Object.hasOwn(titles, hash) ? (hash as Page) : "city";
}

export default function App({ mode }: { mode?: "preview" | "server" } = {}) {
  const [preview, setPreview] = useState(
    mode === "preview" ||
      (!mode &&
        new URLSearchParams(window.location.search).get("preview") === "1"),
  );
  const [page, setPage] = useState<Page>(currentPage);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const game = useGame(preview);
  useEffect(() => {
    const update = () => {
      setPage(currentPage());
      mainRef.current?.focus({ preventScroll: true });
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  function navigate(next: Page) {
    window.location.hash = next;
    setPage(next);
  }
  const state = game.state;
  const completed = state?.quests.filter((q) => q.done).length || 0;
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Перейти к содержимому
      </a>
      <Sidebar page={page} totalXp={state?.wallet.total_xp || 0} />
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Мой мир</span>
            <ChevronRight size={14} />
            <strong>{titles[page]}</strong>
          </div>
          <div className="resources">
            <span aria-label={preview ? "Демонстрационный баланс" : "Баланс"}>
              <Coins size={17} />
              <strong>{state?.wallet.coins ?? "—"}</strong>
              <small>монет</small>
            </span>
            <span aria-label={preview ? "Демонстрационный опыт" : "Опыт"}>
              <Sparkles size={16} />
              <strong>{state ? `${state.wallet.total_xp} XP` : "—"}</strong>
            </span>
            <span className="demo-tag">{preview ? "МАКЕТ" : "ГОСТЬ"}</span>
          </div>
        </header>
        <main id="main-content" ref={mainRef} tabIndex={-1}>
          <div className="demo-notice">
            <Info size={15} />
            <p>
              {preview ? (
                <>
                  <strong>Интерактивный прототип.</strong> Данные примерные;
                  изменения исчезнут после перезагрузки.
                </>
              ) : (
                <>
                  <strong>Твой гостевой город.</strong> Прогресс сохраняется в
                  этом браузерном сеансе на сервере. Сохраняй cookie, чтобы
                  вернуться.
                </>
              )}
            </p>
            <span>{preview ? "M1" : "M2"}</span>
          </div>
          {!state ? (
            <section
              className="content-panel connection-state"
              aria-live="polite"
            >
              <h1>
                {game.loading
                  ? "Открываем твой город…"
                  : "Не удалось открыть город"}
              </h1>
              <p className="muted">
                {game.error ||
                  "Подключаем гостевой сеанс и загружаем сохранённый прогресс."}
              </p>
              {!game.loading && (
                <div className="feature-actions">
                  <button
                    className="button primary"
                    onClick={() => void game.refresh()}
                  >
                    Попробовать снова
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => setPreview(true)}
                  >
                    Открыть макет без сохранения
                  </button>
                </div>
              )}
            </section>
          ) : (
            <>
              {game.error && (
                <div className="form-error" role="alert">
                  {game.error}
                  <button
                    className="button secondary"
                    disabled={game.loading || game.busy}
                    onClick={() => void game.refresh()}
                  >
                    Обновить данные
                  </button>
                </div>
              )}
              {page === "city" ? (
                <Home
                  state={state}
                  preview={preview}
                  onNavigate={navigate}
                  onCampaign={() => setCampaignOpen(true)}
                />
              ) : (
                <>
                  <div className="page-heading compact">
                    <div>
                      <span className="eyebrow">
                        ТВОЙ МИР / {titles[page].toUpperCase()}
                      </span>
                      <h1>{headings[page]}</h1>
                    </div>
                    <a className="text-button" href="#city">
                      <Map size={16} />
                      Вернуться в город
                    </a>
                  </div>
                  {page === "quests" && (
                    <Quests
                      quests={state.quests}
                      campaigns={state.campaigns}
                      preview={preview}
                      busy={game.busy}
                      onSave={game.saveQuest}
                      onComplete={game.completeQuest}
                    />
                  )}
                  {page === "campaigns" && (
                    <Campaigns
                      campaigns={state.campaigns}
                      quests={state.quests}
                      preview={preview}
                      onNew={() => setCampaignOpen(true)}
                      onQuests={() => navigate("quests")}
                    />
                  )}
                  {page === "architect" && (
                    <Architect
                      preview={preview}
                      available={state.ai_available}
                      onManual={() => setCampaignOpen(true)}
                      onAccept={async (id, draft) => {
                        await game.mutate(() => gameApi.acceptPlan(id, draft));
                        navigate("campaigns");
                      }}
                    />
                  )}
                  {page === "build" && (
                    <BuildPanel
                      state={state}
                      preview={preview}
                      busy={game.busy}
                      onBuild={game.build}
                      onCity={() => navigate("city")}
                    />
                  )}
                  {page === "progress" && (
                    <section className="content-panel">
                      <span className="eyebrow">РАТУША</span>
                      <h2>Твой прогресс</h2>
                      <p className="muted">
                        {preview
                          ? "Изменения текущего демосеанса."
                          : "Достижения, сохранённые в твоём гостевом городе."}
                      </p>
                      <div className="stats-grid">
                        <article>
                          <CheckCheck />
                          <strong>{completed}</strong>
                          <span>Квестов завершено</span>
                        </article>
                        <article>
                          <BookOpen />
                          <strong>{state.campaigns.length}</strong>
                          <span>Кампаний</span>
                        </article>
                        <article>
                          <Landmark />
                          <strong>{4 + state.buildings.length}</strong>
                          <span>Зданий и объектов</span>
                        </article>
                      </div>
                      <div className="availability">
                        <Leaf size={23} />
                        <div>
                          <strong>Продолжай в своём темпе</strong>
                          <p>
                            {preview
                              ? "XP и монеты в макете не начисляются."
                              : `Уровень ${state.wallet.level} · ${state.wallet.total_xp} XP. За паузы нет штрафов.`}
                          </p>
                        </div>
                      </div>
                      <button
                        className="button primary"
                        onClick={() => navigate("quests")}
                      >
                        К следующему квесту
                        <ArrowRight size={16} />
                      </button>
                    </section>
                  )}
                </>
              )}
            </>
          )}
          <footer className="page-footer">
            <span>
              <Layers3 size={13} />
              Твои усилия обретают форму.
            </span>
            <span>Город растёт вместе с тобой</span>
          </footer>
        </main>
      </div>
      {campaignOpen && (
        <CampaignForm
          preview={preview}
          onClose={() => setCampaignOpen(false)}
          onSave={async (campaign) => {
            await game.saveCampaign(campaign);
            setCampaignOpen(false);
            navigate("campaigns");
          }}
        />
      )}
    </div>
  );
}

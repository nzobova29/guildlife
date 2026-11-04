import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCheck,
  ChevronRight,
  Coins,
  Compass,
  FlaskConical,
  Hammer,
  Info,
  Landmark,
  Layers3,
  Leaf,
  Map,
  Plus,
  Shield,
  Sparkles,
  Sprout,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { CityMap } from "./components/CityMap";
import { BuildingArt } from "./components/BuildingArt";
import { CampaignForm, Campaigns } from "./features/Campaigns";
import { Quests } from "./features/Quests";
import { initialCampaigns, initialQuests, type Page } from "./data/demo";

const navigation: { id: Page; title: string; icon: LucideIcon }[] = [
  { id: "city", title: "Город", icon: Map },
  { id: "quests", title: "Квесты", icon: CheckCheck },
  { id: "campaigns", title: "Кампании", icon: BookOpen },
  { id: "architect", title: "Архитектор", icon: FlaskConical },
  { id: "build", title: "Строительство", icon: Hammer },
  { id: "progress", title: "Прогресс", icon: Trophy },
];
function currentPage(): Page {
  return (
    navigation.find((item) => item.id === window.location.hash.slice(1))?.id ||
    "city"
  );
}

export default function App() {
  const [page, setPage] = useState<Page>(currentPage);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [quests, setQuests] = useState(initialQuests);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const completed = quests.filter((q) => q.done).length;
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
  const title = navigation.find((item) => item.id === page)!.title;
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
      <aside className="sidebar">
        <a className="brand" href="#city" aria-label="GuildLife — главная">
          <span className="brand-mark">
            <Landmark size={23} />
          </span>
          <span>
            <strong>GuildLife</strong>
            <small>PLAY YOUR PROGRESS</small>
          </span>
        </a>
        <div className="nav-label">ТВОЙ МИР</div>
        <nav aria-label="Основная навигация">
          {navigation.map(({ id, title: label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={page === id ? "page" : undefined}
              className={page === id ? "nav-item active" : "nav-item"}
            >
              <Icon size={19} />
              <span>{label}</span>
              {page === id && <span className="nav-dot" />}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="calm-note">
            <Leaf size={18} />
            <p>
              В своём темпе.
              <br />
              <span>Без штрафов за паузы.</span>
            </p>
          </div>
          <div className="player-card">
            <span className="avatar">
              <Shield size={23} />
            </span>
            <div>
              <strong>Путешественник</strong>
              <small>Уровень 1 · Новый житель</small>
            </div>
            <div className="player-xp">
              <span>Начало большой истории</span>
              <strong>0 / 500 XP</strong>
            </div>
            <progress
              value="0"
              max="500"
              aria-label="Демонстрационный уровень"
            />
          </div>
          <span className="version">GUILDLIFE · ПРОТОТИП 0.1</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Мой мир</span>
            <ChevronRight size={14} />
            <strong>{title}</strong>
          </div>
          <div className="resources">
            <span aria-label="Демонстрационный баланс">
              <Coins size={17} />
              <strong>40</strong>
              <small>монет</small>
            </span>
            <span aria-label="Демонстрационный опыт">
              <Sparkles size={16} />
              <strong>0 XP</strong>
            </span>
            <span className="demo-tag">ДЕМО</span>
          </div>
        </header>
        <main id="main-content" ref={mainRef} tabIndex={-1}>
          <div className="demo-notice">
            <Info size={15} />
            <p>
              <strong>Интерактивный прототип.</strong> Данные примерные;
              изменения исчезнут после перезагрузки.
            </p>
            <span>M1</span>
          </div>
          {page === "city" ? (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">МАЛЕНЬКИЕ ШАГИ. БОЛЬШОЙ МИР.</span>
                  <h1>Твой город начинается с тебя.</h1>
                  <p>Превращай реальные дела в квесты. Строй то, что важно.</p>
                </div>
                <button
                  className="button primary"
                  onClick={() => setCampaignOpen(true)}
                >
                  <Plus size={18} />
                  Новая кампания
                </button>
              </div>
              <div className="world-layout">
                <div className="world-column">
                  <CityMap onNavigate={navigate} />
                  <div className="journey-strip">
                    <div>
                      <span className="journey-icon">
                        <Compass size={21} />
                      </span>
                      <span>
                        <strong>От цели — к своему городу</strong>
                        <small>
                          Один понятный шаг запускает большую историю.
                        </small>
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
                    <span>Квесты в демо</span>
                    <strong>
                      {completed}
                      <span> / {quests.length}</span>
                    </strong>
                    <progress
                      value={completed}
                      max={quests.length || 1}
                      aria-label="Выполненные демоквесты"
                    />
                  </div>
                  <div className="mini-quests">
                    {quests
                      .filter((q) => !q.done)
                      .slice(0, 3)
                      .map((q, index) => (
                        <button key={q.id} onClick={() => navigate("quests")}>
                          <span className="mini-number">0{index + 1}</span>
                          <span>{q.title}</span>
                          <ChevronRight size={15} />
                        </button>
                      ))}
                    {quests.every((q) => q.done) && (
                      <p className="muted">
                        Все демоквесты завершены. Можно добавить новый.
                      </p>
                    )}
                  </div>
                  <button
                    className="button secondary full-width"
                    onClick={() => navigate("quests")}
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
                      <p>Будущий помощник для твоих больших целей.</p>
                    </div>
                    <button
                      className="icon-button"
                      aria-label="Открыть Архитектора"
                      onClick={() => navigate("architect")}
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                </aside>
              </div>
            </>
          ) : (
            <>
              <div className="page-heading compact">
                <div>
                  <span className="eyebrow">
                    ТВОЙ МИР / {title.toUpperCase()}
                  </span>
                  <h1>
                    {page === "quests"
                      ? "Реальные дела. Видимый прогресс."
                      : page === "campaigns"
                        ? "У каждой цели есть начало."
                        : page === "architect"
                          ? "Большая цель — понятный маршрут."
                          : page === "build"
                            ? "Место для будущих достижений."
                            : "Каждый шаг имеет значение."}
                  </h1>
                </div>
                <a className="text-button" href="#city">
                  <Map size={16} />
                  Вернуться в город
                </a>
              </div>
              {page === "quests" && (
                <Quests
                  quests={quests}
                  campaigns={campaigns}
                  onChange={setQuests}
                />
              )}
              {page === "campaigns" && (
                <Campaigns
                  campaigns={campaigns}
                  quests={quests}
                  onNew={() => setCampaignOpen(true)}
                  onQuests={() => navigate("quests")}
                />
              )}
              {page === "architect" && (
                <section className="feature-panel">
                  <div className="feature-illustration">
                    <BuildingArt kind="lab" />
                    <span className="pill">ЛАБОРАТОРИЯ</span>
                  </div>
                  <div>
                    <span className="eyebrow">
                      ОДИН ПОМОЩНИК. ТВОИ РЕШЕНИЯ.
                    </span>
                    <h2>Архитектор</h2>
                    <p className="feature-lead">
                      Поможет превратить большую цель в несколько посильных
                      шагов.
                    </p>
                    <div className="availability">
                      <Info size={19} />
                      <div>
                        <strong>AI ещё не подключён</strong>
                        <p>
                          В этом прототипе можно создать кампанию вручную. В
                          будущем каждый AI-план будет ждать твоей проверки.
                        </p>
                      </div>
                    </div>
                    <ol className="simple-steps">
                      <li>Расскажи о цели и свободном времени</li>
                      <li>Проверь и измени предложенные шаги</li>
                      <li>Подтверди план — только тогда появятся квесты</li>
                    </ol>
                    <div className="feature-actions">
                      <button
                        className="button primary"
                        onClick={() => setCampaignOpen(true)}
                      >
                        Создать кампанию вручную
                        <ArrowRight size={16} />
                      </button>
                      <button className="button secondary" disabled>
                        Предложить AI-план
                      </button>
                    </div>
                  </div>
                </section>
              )}
              {page === "build" && (
                <section className="feature-panel">
                  <div className="feature-illustration plot-art">
                    <Hammer size={64} strokeWidth={1} />
                    <span className="pill">СВОБОДНЫЙ УЧАСТОК</span>
                  </div>
                  <div>
                    <span className="eyebrow">РАЗВИТИЕ ГОРОДА</span>
                    <h2>Место для нового</h2>
                    <p className="feature-lead">
                      Твои реальные достижения однажды изменят этот квартал.
                    </p>
                    <div className="build-options">
                      <article>
                        <span className="feature-icon">
                          <Sprout size={24} />
                        </span>
                        <div>
                          <h3>Городской сад</h3>
                          <p>Небольшая зелёная награда за первые шаги.</p>
                        </div>
                        <strong>
                          <Coins size={15} />
                          60
                        </strong>
                      </article>
                      <article>
                        <span className="feature-icon">
                          <Hammer size={24} />
                        </span>
                        <div>
                          <h3>Мастерская</h3>
                          <p>Новое здание для твоего растущего города.</p>
                        </div>
                        <strong>
                          <Coins size={15} />
                          100
                        </strong>
                      </article>
                    </div>
                    <p className="form-note">
                      В демо показан баланс 40 монет. Для сада нужно ещё 20.
                      Строительство станет доступно после подключения сохранения
                      прогресса.
                    </p>
                    <button className="button primary" disabled>
                      Строительство ещё недоступно
                    </button>
                  </div>
                </section>
              )}
              {page === "progress" && (
                <section className="content-panel">
                  <span className="eyebrow">РАТУША</span>
                  <h2>Твой прогресс</h2>
                  <p className="muted">
                    Здесь видны только изменения текущего демосеанса.
                  </p>
                  <div className="stats-grid">
                    <article>
                      <CheckCheck />
                      <strong>{completed}</strong>
                      <span>Демоквестов завершено</span>
                    </article>
                    <article>
                      <BookOpen />
                      <strong>{campaigns.length}</strong>
                      <span>Кампаний в демо</span>
                    </article>
                    <article>
                      <Landmark />
                      <strong>4</strong>
                      <span>Базовых здания</span>
                    </article>
                  </div>
                  <div className="availability">
                    <Leaf size={23} />
                    <div>
                      <strong>Продолжай в своём темпе</strong>
                      <p>
                        XP и монеты в прототипе не начисляются. История
                        достижений появится вместе с сохранением прогресса.
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
          <footer className="page-footer">
            <span>
              <Layers3 size={13} /> Твои усилия обретают форму.
            </span>
            <span>Город растёт вместе с тобой</span>
          </footer>
        </main>
      </div>
      {campaignOpen && (
        <CampaignForm
          onClose={() => setCampaignOpen(false)}
          onSave={(campaign) => {
            setCampaigns((items) => [...items, campaign]);
            setCampaignOpen(false);
            navigate("campaigns");
          }}
        />
      )}
    </div>
  );
}

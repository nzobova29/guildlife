import {
  BookOpen,
  CheckCheck,
  FlaskConical,
  Hammer,
  Landmark,
  Leaf,
  Map,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { Page } from "../data/demo";
import { PlayerProfile } from "./PlayerProfile";

const navigation: { id: Page; title: string; icon: LucideIcon }[] = [
  { id: "city", title: "Город", icon: Map },
  { id: "quests", title: "Квесты", icon: CheckCheck },
  { id: "campaigns", title: "Кампании", icon: BookOpen },
  { id: "architect", title: "Архитектор", icon: FlaskConical },
  { id: "build", title: "Строительство", icon: Hammer },
  { id: "progress", title: "Прогресс", icon: Trophy },
];

export function Sidebar({ page, totalXp }: { page: Page; totalXp?: number }) {
  return (
    <aside
      className="sidebar personal-sidebar"
      aria-label="Профиль и навигация"
      tabIndex={0}
    >
      <a className="brand" href="#city" aria-label="GuildLife — главная">
        <span className="brand-mark">
          <Landmark size={23} />
        </span>
        <span>
          <strong>GuildLife</strong>
          <small>PLAY YOUR PROGRESS</small>
        </span>
      </a>
      <PlayerProfile totalXp={totalXp} />
      <div className="nav-label">ТВОЙ МИР</div>
      <nav aria-label="Основная навигация">
        {navigation.map(({ id, title, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={page === id ? "page" : undefined}
            className={page === id ? "nav-item active" : "nav-item"}
          >
            <Icon size={19} aria-hidden="true" />
            <span>{title}</span>
            {page === id && <span className="nav-dot" />}
          </a>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="calm-note">
          <Leaf size={18} aria-hidden="true" />
          <p>
            В своём темпе.
            <br />
            <span>Без штрафов за паузы.</span>
          </p>
        </div>
        <span className="version">GUILDLIFE · ТВОЙ ГОРОД</span>
      </div>
    </aside>
  );
}

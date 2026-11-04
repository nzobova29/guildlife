export type Page =
  "city" | "quests" | "campaigns" | "architect" | "build" | "progress";
export type Difficulty = "small" | "medium" | "large";
export type BuildingKind = "academy" | "guild" | "lab" | "hall";
export interface Campaign {
  id: string;
  title: string;
  description: string;
  deadline: string;
  hours: number;
}
export interface Quest {
  id: string;
  title: string;
  difficulty: Difficulty;
  done: boolean;
  campaignId: string;
}
export const difficultyLabels: Record<Difficulty, string> = {
  small: "Небольшой · 5–20 мин",
  medium: "Средний · 20–60 мин",
  large: "Большой · от 60 мин",
};
// Reward previews only. Never use this data to credit the wallet.
export const rewardPreview: Record<Difficulty, { xp: number; coins: number }> =
  {
    small: { xp: 25, coins: 10 },
    medium: { xp: 50, coins: 20 },
    large: { xp: 80, coins: 30 },
  };
export const initialCampaigns: Campaign[] = [
  {
    id: "demo-study",
    title: "Маленькие шаги к большой цели",
    description:
      "Познакомься с городом и наметь свой первый шаг. Это пример кампании.",
    deadline: "",
    hours: 4,
  },
];
export const initialQuests: Quest[] = [
  {
    id: "q1",
    title: "Выбрать одну цель на эту неделю",
    difficulty: "small",
    done: false,
    campaignId: "demo-study",
  },
  {
    id: "q2",
    title: "Разбить цель на понятные шаги",
    difficulty: "medium",
    done: false,
    campaignId: "demo-study",
  },
  {
    id: "q3",
    title: "Посвятить полчаса первому шагу",
    difficulty: "medium",
    done: false,
    campaignId: "demo-study",
  },
];
export const buildings: {
  kind: BuildingKind;
  name: string;
  purpose: string;
  page: Page;
  x: number;
  y: number;
}[] = [
  {
    kind: "academy",
    name: "Академия",
    purpose: "Твои кампании",
    page: "campaigns",
    x: 32,
    y: 43,
  },
  {
    kind: "lab",
    name: "Лаборатория",
    purpose: "AI-планировщик",
    page: "architect",
    x: 67,
    y: 43,
  },
  {
    kind: "guild",
    name: "Гильдия",
    purpose: "Твои квесты",
    page: "quests",
    x: 28,
    y: 68,
  },
  {
    kind: "hall",
    name: "Ратуша",
    purpose: "Твой прогресс",
    page: "progress",
    x: 57,
    y: 65,
  },
];

import type { Campaign, Difficulty, Quest } from "../data/demo";

export interface Wallet {
  coins: number;
  total_xp: number;
  level: number;
}
export interface CityBuilding {
  plot_id: string;
  building_type: "garden" | "workshop";
}
export interface GameState {
  guest: { id: string };
  wallet: Wallet;
  campaigns: Campaign[];
  quests: Quest[];
  buildings: CityBuilding[];
  catalog: {
    building_type: "garden" | "workshop";
    title: string;
    cost: number;
  }[];
  ai_available: boolean;
}
interface ServerState extends Omit<GameState, "campaigns" | "quests"> {
  campaigns: (Omit<Campaign, "deadline"> & { deadline: string | null })[];
  quests: (Omit<Quest, "campaignId"> & { campaign_id: string | null })[];
}
export interface PlanQuest {
  title: string;
  description: string;
  difficulty: Difficulty;
  estimated_minutes: number;
}
export interface Plan {
  title: string;
  milestones: { title: string; quests: PlanQuest[] }[];
  assumptions: string[];
  disclaimer: string;
}
export interface AiJob {
  id: string;
  status: "queued" | "running" | "awaiting_approval" | "done" | "failed";
  draft: Plan | null;
  error_code: string | null;
  campaign_id: string | null;
}
const messages: Record<string, string> = {
  insufficient_funds: "Не хватает монет. Заверши ещё один квест.",
  already_built: "На этом участке уже есть постройка. Обнови город.",
  ai_not_configured: "AI пока не подключён. Можно создать кампанию вручную.",
  provider_timeout:
    "Планировщик не успел ответить. Попробуй позже или создай кампанию вручную.",
  provider_error:
    "Провайдер AI недоступен. Ручное планирование продолжает работать.",
  invalid_response: "AI вернул некорректный план. Попробуй уточнить цель.",
  quota_exceeded: "Лимит AI-запросов исчерпан. Можно продолжить вручную.",
};
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 100_000);
  try {
    const response = await fetch(`/api/v1${path}`, {
      method,
      credentials: "same-origin",
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const detail = data?.detail ?? data?.error;
      const code =
        typeof detail?.code === "string"
          ? detail.code
          : `http_${response.status}`;
      const message =
        messages[code] ||
        (response.status === 401
          ? "Гостевой сеанс закончился. Обнови страницу, чтобы начать новый."
          : response.status === 422
            ? "Проверь поля: название, время и выбранную кампанию."
            : response.status === 429
              ? "Слишком много запросов. Попробуй позже."
              : response.status === 503
                ? "Сервис временно недоступен. Попробуй позже."
                : response.status === 409
                  ? "Состояние уже изменилось. Обнови данные и попробуй снова."
                  : "Не удалось выполнить действие. Попробуй ещё раз.");
      throw new ApiError(response.status, code, message);
    }
    if (data === null)
      throw new ApiError(
        502,
        "invalid_json",
        "Сервер вернул непонятный ответ. Попробуй обновить данные.",
      );
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      0,
      "network",
      "Нет связи с сервером. Проверь подключение и попробуй ещё раз.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
let sessionRequest: Promise<unknown> | null = null;
export async function startSession() {
  // StrictMode may mount twice; share the handshake so cookies cannot race.
  if (!sessionRequest)
    sessionRequest = request("/guest-session", "POST").finally(() => {
      sessionRequest = null;
    });
  await sessionRequest;
}
export async function loadGame(): Promise<GameState> {
  const state = await request<ServerState>("/game-state");
  return {
    ...state,
    campaigns: state.campaigns.map((c) => ({
      ...c,
      deadline: c.deadline || "",
    })),
    quests: state.quests.map((q) => ({
      ...q,
      campaignId: q.campaign_id || "",
    })),
  };
}
export const gameApi = {
  saveCampaign: (campaign: Campaign) =>
    request("/campaigns", "POST", {
      title: campaign.title,
      description: campaign.description,
      deadline: campaign.deadline || null,
      hours: campaign.hours,
    }),
  saveQuest: (quest: Quest, isNew: boolean) =>
    request(
      isNew ? "/quests" : `/quests/${quest.id}`,
      isNew ? "POST" : "PATCH",
      {
        title: quest.title,
        difficulty: quest.difficulty,
        campaign_id: quest.campaignId || null,
      },
    ),
  completeQuest: (id: string) =>
    request<{ quest: unknown; wallet: Wallet }>(
      `/quests/${id}/complete`,
      "POST",
    ),
  build: (buildingType: CityBuilding["building_type"]) =>
    request("/buildings/build", "POST", {
      plot_id: "plot-1",
      building_type: buildingType,
    }),
  listJobs: () => request<AiJob[]>("/ai/jobs"),
  plan: (input: {
    goal: string;
    deadline: string | null;
    hours: number;
    context: string;
  }) => request<AiJob>("/ai/plan-drafts", "POST", input),
  acceptPlan: (id: string, draft: Plan) =>
    request<AiJob>(`/ai/jobs/${id}/accept`, "POST", draft),
};
export function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Не удалось выполнить действие.";
}

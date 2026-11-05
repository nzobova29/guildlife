import { afterEach, describe, expect, it, vi } from "vitest";
import { gameApi, loadGame, request, startSession } from "./game";

afterEach(() => vi.unstubAllGlobals());
describe("server API boundary", () => {
  it("sends a manual quest with campaign ownership ID and no client rewards", async () => {
    let body: unknown;
    vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
      body = JSON.parse(init.body as string);
      return Response.json({ id: "server-id" });
    });
    await gameApi.saveQuest(
      {
        id: "local-id",
        title: "Сделать первый шаг",
        done: false,
        difficulty: "medium",
        campaignId: "campaign-1",
      },
      true,
    );
    expect(body).toEqual({
      title: "Сделать первый шаг",
      difficulty: "medium",
      campaign_id: "campaign-1",
    });
  });
  it("maps persisted server IDs into frontend state, preserving authoritative wallet", async () => {
    vi.stubGlobal("fetch", async () =>
      Response.json({
        guest: { id: "g" },
        wallet: { coins: 60, total_xp: 50, level: 1 },
        campaigns: [
          {
            id: "c",
            title: "Кампания",
            description: "",
            deadline: null,
            hours: 4,
          },
        ],
        quests: [
          {
            id: "q",
            title: "Первый шаг",
            difficulty: "medium",
            done: true,
            campaign_id: "c",
          },
        ],
        buildings: [],
        catalog: [],
        ai_available: false,
      }),
    );
    const state = await loadGame();
    expect(state.quests[0].campaignId).toBe("c");
    expect(state.campaigns[0].deadline).toBe("");
    expect(state.wallet).toEqual({ coins: 60, total_xp: 50, level: 1 });
  });
  it("shares concurrent guest handshakes instead of creating competing cookies", async () => {
    let calls = 0;
    vi.stubGlobal("fetch", async () => {
      calls++;
      return Response.json({ id: "g" });
    });
    await Promise.all([startSession(), startSession()]);
    expect(calls).toBe(1);
  });
  it("shows safe errors, never arbitrary server exception text", async () => {
    vi.stubGlobal("fetch", async () =>
      Response.json({ detail: "private stack / secret" }, { status: 500 }),
    );
    await expect(request("/quests")).rejects.toThrow(
      "Не удалось выполнить действие",
    );
  });
  it("reports network failure without claiming success", async () => {
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("fetch failed");
    });
    await expect(gameApi.completeQuest("q")).rejects.toThrow(
      "Нет связи с сервером",
    );
  });
});

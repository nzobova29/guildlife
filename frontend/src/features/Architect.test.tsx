import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import App from "../App";

afterEach(() => {
  vi.unstubAllGlobals();
  window.location.hash = "";
});
it("keeps a provider draft separate from campaigns until edited plan is explicitly accepted", async () => {
  const plan = {
    title: "Учебная цель",
    milestones: [
      {
        title: "Подготовка",
        quests: [
          {
            title: "Собрать материалы",
            description: "Составить список источников",
            difficulty: "small",
            estimated_minutes: 15,
          },
        ],
      },
      {
        title: "Практика",
        quests: [
          {
            title: "Решить задачи",
            description: "Проверить решения",
            difficulty: "medium",
            estimated_minutes: 45,
          },
        ],
      },
    ],
    assumptions: ["Материалы доступны"],
    disclaimer: "Проверь план перед принятием",
  };
  let accepted: typeof plan | null = null;
  const guestState = () => ({
    guest: { id: "g" },
    wallet: { coins: 40, total_xp: 0, level: 1 },
    campaigns: accepted
      ? [
          {
            id: "c",
            title: accepted.title,
            description: "",
            deadline: null,
            hours: 4,
          },
        ]
      : [],
    quests: [],
    buildings: [],
    catalog: [],
    ai_available: true,
  });
  vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
    if (url.endsWith("/ai/jobs")) return Response.json([]);
    if (url.endsWith("/ai/plan-drafts"))
      return Response.json({
        id: "job",
        status: "awaiting_approval",
        draft: plan,
        error_code: null,
        campaign_id: null,
      });
    if (url.endsWith("/ai/jobs/job/accept")) {
      accepted = JSON.parse(init.body as string);
      return Response.json({
        id: "job",
        status: "done",
        draft: accepted,
        error_code: null,
        campaign_id: "c",
      });
    }
    return Response.json(guestState());
  });
  const user = userEvent.setup();
  render(<App mode="server" />);
  await screen.findByRole("button", { name: "Новая кампания" });
  await user.click(screen.getByRole("link", { name: "Архитектор" }));
  await user.type(
    await screen.findByLabelText("Твоя цель"),
    "Подготовиться к экзамену",
  );
  expect(
    screen.getByRole("button", { name: "Предложить AI-план" }),
  ).toBeDisabled();
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "Предложить AI-план" }));
  await screen.findByLabelText("Название плана");
  expect(accepted).toBeNull();
  await user.clear(screen.getByLabelText("Название плана"));
  await user.type(
    screen.getByLabelText("Название плана"),
    "Мой проверенный план",
  );
  const first = screen.getAllByRole("group")[0];
  await user.clear(within(first).getByLabelText("Квест 1"));
  await user.type(within(first).getByLabelText("Квест 1"), "Выбрать учебник");
  expect(accepted).toBeNull();
  await user.click(screen.getByRole("button", { name: "Принять план" }));
  expect(
    await screen.findByRole("heading", { name: "Мой проверенный план" }),
  ).toBeVisible();
  expect(accepted).toMatchObject({
    title: "Мой проверенный план",
    milestones: [
      { title: "Подготовка", quests: [{ title: "Выбрать учебник" }] },
      { title: "Практика" },
    ],
  });
});

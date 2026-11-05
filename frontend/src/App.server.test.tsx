import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

afterEach(() => vi.unstubAllGlobals());
const state = {
  guest: { id: "g" },
  wallet: { coins: 40, total_xp: 0, level: 1 },
  campaigns: [],
  quests: [],
  buildings: [],
  catalog: [],
  ai_available: false,
};
describe("connected application", () => {
  it("does not disguise an unavailable server as a working persisted city", async () => {
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("offline");
    });
    const user = userEvent.setup();
    render(<App mode="server" />);
    expect(
      await screen.findByRole("heading", { name: "Не удалось открыть город" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Открыть: Академия" }),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Открыть макет без сохранения" }),
    );
    expect(
      await screen.findByRole("button", { name: "Открыть: Академия" }),
    ).toBeVisible();
    expect(
      screen.getByText(/изменения исчезнут после перезагрузки/),
    ).toBeVisible();
  });
  it("retains a campaign draft after a failed save, then retries without losing input", async () => {
    let attempts = 0;
    vi.stubGlobal("fetch", async (url: string) => {
      if (url.endsWith("/campaigns")) {
        attempts++;
        return attempts === 1
          ? Response.json({ detail: "unavailable" }, { status: 503 })
          : Response.json({ id: "c" }, { status: 201 });
      }
      return Response.json({
        ...state,
        campaigns:
          attempts > 1
            ? [
                {
                  id: "c",
                  title: "Моя сохранённая цель",
                  description: "",
                  deadline: null,
                  hours: 4,
                },
              ]
            : [],
      });
    });
    const user = userEvent.setup();
    render(<App mode="server" />);
    await user.click(
      await screen.findByRole("button", { name: "Новая кампания" }),
    );
    await user.type(
      screen.getByLabelText("Название кампании"),
      "Моя сохранённая цель",
    );
    await user.click(
      screen.getByRole("button", { name: "Проверить кампанию" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Сохранить кампанию" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Сервис временно недоступен",
    );
    expect(
      within(screen.getByRole("dialog")).getByText("Моя сохранённая цель"),
    ).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Сохранить кампанию" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Моя сохранённая цель" }),
    ).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

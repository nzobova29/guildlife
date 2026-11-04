import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("M1 visual demo", () => {
  it("moves keyboard focus to the review step and preserves inputs when returning", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Новая кампания" }));
    await user.type(screen.getByLabelText("Название кампании"), "Проверить фокус");
    await user.click(screen.getByRole("button", { name: "Проверить кампанию" }));
    expect(screen.getByRole("heading", { name: "Проверь свою цель" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Изменить" }));
    expect(screen.getByLabelText("Название кампании")).toHaveValue("Проверить фокус");
    expect(screen.getByLabelText("Название кампании")).toHaveFocus();
  });
  it("opens the correct destinations from all four buildings and the plot", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(
      screen.getByText(/изменения исчезнут после перезагрузки/i),
    ).toBeVisible();
    for (const [building, heading] of [
      ["Академия", "Твои кампании"],
      ["Гильдия", "Гильдия квестов"],
      ["Лаборатория", "Архитектор"],
      ["Ратуша", "Твой прогресс"],
      ["Свободный участок", "Место для нового"],
    ]) {
      await user.click(
        screen.getByRole("button", { name: `Открыть: ${building}` }),
      );
      expect(screen.getByRole("heading", { name: heading })).toBeVisible();
      await user.click(screen.getByRole("link", { name: "Город" }));
      await waitFor(() =>
        expect(
          screen.getByRole("heading", {
            name: "Твой город начинается с тебя.",
          }),
        ).toBeVisible(),
      );
    }
  });

  it("rejects whitespace and saves a campaign only after explicit review", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Новая кампания" }));
    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText("Название кампании"), "   ");
    await user.click(
      within(dialog).getByRole("button", { name: "Проверить кампанию" }),
    );
    expect(within(dialog).getByRole("alert")).toBeVisible();
    await user.clear(within(dialog).getByLabelText("Название кампании"));
    await user.type(
      within(dialog).getByLabelText("Название кампании"),
      "Изучить TypeScript",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Проверить кампанию" }),
    );
    expect(
      within(dialog).getByRole("heading", { name: "Проверь свою цель" }),
    ).toBeVisible();
    await user.click(
      within(dialog).getByRole("button", { name: "Добавить в демо" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Изучить TypeScript" }),
    ).toBeVisible();
  });

  it("cancels a reviewed campaign without adding it and returns keyboard focus", async () => {
    const user = userEvent.setup();
    render(<App />);
    const trigger = screen.getByRole("button", { name: "Новая кампания" });
    await user.click(trigger);
    await user.type(
      screen.getByLabelText("Название кампании"),
      "Отменённая цель",
    );
    await user.click(
      screen.getByRole("button", { name: "Проверить кампанию" }),
    );
    await user.click(screen.getByRole("button", { name: "Закрыть диалог" }));
    expect(screen.queryByText("Отменённая цель")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("creates, edits and completes a demo quest without changing the wallet", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("link", { name: "Квесты" }));
    await user.click(
      await screen.findByRole("button", { name: "Новый квест" }),
    );
    await user.type(screen.getByLabelText("Название квеста"), "Написать тест");
    await user.click(screen.getByRole("button", { name: "Добавить квест" }));
    await user.click(
      screen.getByRole("button", { name: "Изменить: Написать тест" }),
    );
    await user.clear(screen.getByLabelText("Название квеста"));
    await user.type(
      screen.getByLabelText("Название квеста"),
      "Проверить форму",
    );
    await user.click(
      screen.getByRole("button", { name: "Сохранить изменения" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Завершить: Проверить форму" }),
    );
    expect(
      screen.queryByRole("heading", { name: "Проверить форму" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Готово" }));
    expect(
      screen.getByRole("button", { name: "Завершено: Проверить форму" }),
    ).toBeDisabled();
    expect(screen.getByLabelText("Демонстрационный баланс")).toHaveTextContent(
      "40",
    );
    expect(screen.getByLabelText("Демонстрационный опыт")).toHaveTextContent(
      "0 XP",
    );
    await user.click(screen.getByRole("button", { name: "Готово" }));
    expect(
      screen.getByRole("heading", { name: "Проверить форму" }),
    ).toBeVisible();
  });

  it("shows an actionable empty quest state and never implies AI is running", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("link", { name: "Квесты" }));
    await user.click(await screen.findByRole("button", { name: "Готово" }));
    expect(screen.getByText("Пока нет завершённых квестов")).toBeVisible();
    await user.click(screen.getByRole("link", { name: "Архитектор" }));
    expect(await screen.findByText("AI ещё не подключён")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Предложить AI-план" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Создать кампанию вручную" }),
    ).toBeEnabled();
  });
});

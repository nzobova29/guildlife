import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlayerProfile } from "./PlayerProfile";

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("local player profile", () => {
  it("saves a trimmed personal name across remounts without persisting server XP", async () => {
    const user = userEvent.setup();
    const view = render(<PlayerProfile totalXp={75} />);
    await user.click(screen.getByRole("button", { name: "Настроить профиль" }));
    await user.clear(screen.getByLabelText("Имя в городе"));
    await user.type(screen.getByLabelText("Имя в городе"), "  Анна Зобова  ");
    await user.click(screen.getByRole("button", { name: "Сохранить профиль" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Анна Зобова")).toBeVisible();
    view.unmount();
    render(<PlayerProfile totalXp={110} />);
    expect(screen.getByText("Анна Зобова")).toBeVisible();
    expect(screen.getByText("110 XP")).toBeVisible();
    expect(localStorage.getItem("guildlife.profile.v1")).not.toMatch(
      /75|110|totalXp|wallet/,
    );
  });

  it("cancels changes and restores focus to the profile button", async () => {
    const user = userEvent.setup();
    render(<PlayerProfile />);
    const trigger = screen.getByRole("button", { name: "Настроить профиль" });
    await user.click(trigger);
    await user.clear(screen.getByLabelText("Имя в городе"));
    await user.type(screen.getByLabelText("Имя в городе"), "Не сохранять");
    await user.click(screen.getByRole("button", { name: "Отмена" }));
    expect(screen.queryByText("Не сохранять")).not.toBeInTheDocument();
    expect(localStorage.length).toBe(0);
    expect(trigger).toHaveFocus();
  });

  it("rejects blank names without overwriting a saved identity", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      "guildlife.profile.v1",
      JSON.stringify({ name: "Анна", avatar: null }),
    );
    render(<PlayerProfile />);
    await user.click(screen.getByRole("button", { name: "Настроить профиль" }));
    await user.clear(screen.getByLabelText("Имя в городе"));
    await user.type(screen.getByLabelText("Имя в городе"), "   ");
    await user.click(screen.getByRole("button", { name: "Сохранить профиль" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/имя/i);
    expect(JSON.parse(localStorage.getItem("guildlife.profile.v1")!).name).toBe(
      "Анна",
    );
  });

  it.each([
    ["photo.svg", "image/svg+xml", 20],
    ["photo.png", "image/png", 2 * 1024 * 1024 + 1],
  ])("rejects unsupported or oversized avatar %s", async (name, type, size) => {
    const user = userEvent.setup({ applyAccept: false });
    render(<PlayerProfile />);
    await user.click(screen.getByRole("button", { name: "Настроить профиль" }));
    await user.upload(
      screen.getByLabelText("Фото или аватар"),
      new File([new Uint8Array(size)], name, { type }),
    );
    expect(screen.getByRole("alert")).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(localStorage.length).toBe(0);
  });

  it("keeps the editor and old identity when browser storage rejects saving", async () => {
    const user = userEvent.setup();
    render(<PlayerProfile />);
    await user.click(screen.getByRole("button", { name: "Настроить профиль" }));
    await user.clear(screen.getByLabelText("Имя в городе"));
    await user.type(screen.getByLabelText("Имя в городе"), "Анна");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Full", "QuotaExceededError");
    });
    await user.click(screen.getByRole("button", { name: "Сохранить профиль" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/сохранить/i);
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByText("Путешественник")).toBeVisible();
  });

  it("recovers from malformed stored data and never loads external avatar URLs", async () => {
    localStorage.setItem(
      "guildlife.profile.v1",
      JSON.stringify({
        name: "Анна",
        avatar: "https://tracking.example/photo.png",
      }),
    );
    const view = render(<PlayerProfile />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    view.unmount();
    localStorage.setItem("guildlife.profile.v1", "{broken");
    render(<PlayerProfile />);
    await waitFor(() =>
      expect(screen.getByText("Путешественник")).toBeVisible(),
    );
  });
});

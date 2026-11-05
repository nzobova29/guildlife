import { useCallback, useEffect, useRef, useState } from "react";
import {
  initialCampaigns,
  initialQuests,
  type Campaign,
  type Quest,
} from "../data/demo";
import {
  gameApi,
  loadGame,
  startSession,
  errorMessage,
  type GameState,
  type CityBuilding,
} from "./game";

const previewState: GameState = {
  guest: { id: "preview" },
  wallet: { coins: 40, total_xp: 0, level: 1 },
  campaigns: initialCampaigns,
  quests: initialQuests,
  buildings: [],
  catalog: [
    { building_type: "garden", title: "Городской сад", cost: 60 },
    { building_type: "workshop", title: "Мастерская", cost: 100 },
  ],
  ai_available: false,
};

export function useGame(preview: boolean) {
  const [state, setState] = useState<GameState | null>(
    preview ? previewState : null,
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!preview);
  const [busy, setBusy] = useState(false);
  const mutation = useRef(false);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await startSession();
      setState(await loadGame());
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    let current = true;
    if (preview) {
      Promise.resolve().then(() => {
        if (current) {
          setState(previewState);
          setLoading(false);
          setError("");
        }
      });
    } else {
      startSession()
        .then(loadGame)
        .then((data) => {
          if (current) setState(data);
        })
        .catch((cause) => {
          if (current) setError(errorMessage(cause));
        })
        .finally(() => {
          if (current) setLoading(false);
        });
    }
    return () => {
      current = false;
    };
  }, [preview]);
  async function mutate(action: () => Promise<unknown>) {
    if (mutation.current)
      throw new Error("Дождись завершения предыдущего действия.");
    mutation.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
      // A confirmed write must not become a failed write just because refresh failed.
      try {
        setState(await loadGame());
      } catch {
        setError(
          "Действие сохранено, но обновить экран не удалось. Нажми «Обновить данные».",
        );
      }
    } finally {
      mutation.current = false;
      setBusy(false);
    }
  }
  async function saveCampaign(campaign: Campaign) {
    if (preview) {
      setState((s) => s && { ...s, campaigns: [...s.campaigns, campaign] });
      return;
    }
    await mutate(() => gameApi.saveCampaign(campaign));
  }
  async function saveQuest(quest: Quest, isNew: boolean) {
    if (preview) {
      setState(
        (s) =>
          s && {
            ...s,
            quests: isNew
              ? [...s.quests, quest]
              : s.quests.map((q) => (q.id === quest.id ? quest : q)),
          },
      );
      return;
    }
    await mutate(() => gameApi.saveQuest(quest, isNew));
  }
  async function completeQuest(id: string) {
    if (preview) {
      setState(
        (s) =>
          s && {
            ...s,
            quests: s.quests.map((q) =>
              q.id === id ? { ...q, done: true } : q,
            ),
          },
      );
      return;
    }
    await mutate(() => gameApi.completeQuest(id));
  }
  async function build(type: CityBuilding["building_type"]) {
    await mutate(() => gameApi.build(type));
  }
  return {
    state,
    error,
    loading,
    busy,
    refresh,
    saveCampaign,
    saveQuest,
    completeQuest,
    build,
    mutate,
  };
}

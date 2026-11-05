import { useState } from "react";
import { ArrowRight, Coins, Hammer, Sprout, Check } from "lucide-react";
import { errorMessage, type GameState, type CityBuilding } from "../api/game";

export function BuildPanel({
  state,
  preview,
  busy,
  onBuild,
  onCity,
}: {
  state: GameState;
  preview: boolean;
  busy: boolean;
  onBuild: (type: CityBuilding["building_type"]) => Promise<void>;
  onCity: () => void;
}) {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const occupied = state.buildings.some((b) => b.plot_id === "plot-1");
  return (
    <section className="content-panel">
      <span className="eyebrow">РАЗВИТИЕ ГОРОДА</span>
      <h2>Место для нового</h2>
      <p className="muted">
        Один свободный участок, одна выбранная награда. Покупка сохраняется в
        твоём городе.
      </p>
      <div className="build-options">
        {state.catalog.map((item) => (
          <article key={item.building_type}>
            <span className="feature-icon">
              {item.building_type === "garden" ? (
                <Sprout size={24} />
              ) : (
                <Hammer size={24} />
              )}
            </span>
            <div className="build-copy">
              <h3>{item.title}</h3>
              <p>
                {item.building_type === "garden"
                  ? "Небольшой зелёный сад в честь первых шагов."
                  : "Мастерская — визуальная награда за твою работу."}
              </p>
              <strong>
                <Coins size={15} />
                {item.cost}
              </strong>
              <p>
                {occupied
                  ? "Участок уже занят."
                  : state.wallet.coins < item.cost
                    ? `Нужно ещё ${item.cost - state.wallet.coins} монет.`
                    : "Монет хватает. Стоимость спишется один раз."}
              </p>
            </div>
            <button
              className="button primary"
              disabled={
                preview || busy || occupied || state.wallet.coins < item.cost
              }
              onClick={async () => {
                setError("");
                try {
                  await onBuild(item.building_type);
                  setNotice(`${item.title}: постройка сохранена.`);
                } catch (cause) {
                  setError(errorMessage(cause));
                }
              }}
            >
              {busy ? "Строим…" : occupied ? "Участок занят" : "Построить"}
            </button>
          </article>
        ))}
      </div>
      {preview && (
        <p className="form-note">
          Строительство ещё недоступно в макете. Открой приложение с сервером,
          чтобы сохранить город.
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <p className="inline-status" role="status">
        {notice}
      </p>
      {occupied && (
        <div className="availability">
          <Check />
          <div>
            <strong>В твоём городе появился новый объект</strong>
            <p>Он останется здесь после обновления страницы.</p>
          </div>
        </div>
      )}
      <button className="button secondary" onClick={onCity}>
        Посмотреть город
        <ArrowRight size={16} />
      </button>
    </section>
  );
}

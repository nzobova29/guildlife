import { useRef, useState } from "react";
import { Camera, Pencil, UserRound } from "lucide-react";
import { Dialog } from "./Dialog";

type Profile = { name: string; avatar: string | null };
const storageKey = "guildlife.profile.v1";
const maxBytes = 2 * 1024 * 1024;
const defaultProfile: Profile = { name: "Путешественник", avatar: null };
const localImage = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

function readProfile(): Profile {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(storageKey) || "null",
    );
    if (
      !value ||
      typeof value !== "object" ||
      !("name" in value) ||
      typeof value.name !== "string" ||
      !value.name.trim() ||
      value.name.length > 40
    )
      return defaultProfile;
    const avatar =
      "avatar" in value &&
      typeof value.avatar === "string" &&
      value.avatar.length <= Math.ceil((maxBytes * 4) / 3) + 50 &&
      localImage.test(value.avatar)
        ? value.avatar
        : null;
    return { name: value.name.trim(), avatar };
  } catch {
    return defaultProfile;
  }
}

function readAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      reject(new Error("Выбери изображение PNG, JPEG или WebP."));
      return;
    }
    if (file.size > maxBytes || file.size === 0) {
      reject(new Error("Фото должно быть непустым и не больше 2 МБ."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () =>
      reject(new Error("Не удалось прочитать фото. Попробуй другой файл."));
    reader.onload = () => {
      const data = reader.result;
      if (typeof data !== "string" || !localImage.test(data)) {
        reject(new Error("Не удалось прочитать фото. Попробуй другой файл."));
        return;
      }
      const image = new Image();
      image.onerror = () =>
        reject(
          new Error(
            "Файл не удалось открыть как изображение. Выбери другое фото.",
          ),
        );
      image.onload = () => {
        if (
          image.naturalWidth > 4096 ||
          image.naturalHeight > 4096 ||
          !image.naturalWidth ||
          !image.naturalHeight
        ) {
          reject(
            new Error(
              "Размер фото должен быть не больше 4096 × 4096 пикселей.",
            ),
          );
        } else resolve(data);
      };
      image.src = data;
    };
    reader.readAsDataURL(file);
  });
}

function Avatar({
  profile,
  large = false,
}: {
  profile: Profile;
  large?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const initials = profile.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => Array.from(part)[0])
    .join("")
    .toLocaleUpperCase();
  return (
    <span className={`profile-avatar${large ? " profile-avatar-large" : ""}`}>
      {profile.avatar && failedSource !== profile.avatar ? (
        <img
          src={profile.avatar}
          alt={`Аватар: ${profile.name}`}
          onError={() => setFailedSource(profile.avatar)}
        />
      ) : profile.name !== defaultProfile.name ? (
        <span aria-hidden="true">{initials}</span>
      ) : (
        <UserRound size={large ? 30 : 24} aria-hidden="true" />
      )}
    </span>
  );
}

export function PlayerProfile({ totalXp }: { totalXp?: number }) {
  const [profile, setProfile] = useState(readProfile);
  const [editing, setEditing] = useState(false);
  return (
    <>
      <section className="local-profile" aria-label="Твой профиль">
        <button
          className="profile-trigger"
          aria-label="Настроить профиль"
          onClick={() => setEditing(true)}
        >
          <Avatar profile={profile} />
          <span className="profile-copy">
            <strong>{profile.name}</strong>
            <small>
              Твой профиль <Pencil size={11} aria-hidden="true" />
            </small>
          </span>
        </button>
        <div className="profile-meta">
          <span>На этом устройстве</span>
          {totalXp !== undefined && (
            <strong>{totalXp.toLocaleString("ru-RU")} XP</strong>
          )}
        </div>
      </section>
      {editing && (
        <ProfileEditor
          profile={profile}
          onClose={() => setEditing(false)}
          onSave={(next) => {
            setProfile(next);
            setEditing(false);
          }}
        />
      )}
    </>
  );
}

function ProfileEditor({
  profile,
  onSave,
  onClose,
}: {
  profile: Profile;
  onSave: (profile: Profile) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(profile);
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const fileVersion = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  function close() {
    fileVersion.current += 1;
    onClose();
  }
  async function selectAvatar(file: File | undefined) {
    if (!file) return;
    const version = ++fileVersion.current;
    setReading(true);
    setError("");
    try {
      const avatar = await readAvatar(file);
      if (version === fileVersion.current)
        setDraft((current) => ({ ...current, avatar }));
    } catch (cause) {
      if (version === fileVersion.current)
        setError(
          cause instanceof Error ? cause.message : "Не удалось открыть фото.",
        );
    } finally {
      if (version === fileVersion.current) setReading(false);
    }
  }
  return (
    <Dialog title="Настроить профиль" onClose={close}>
      <h2>Это твой город.</h2>
      <p className="muted">
        Добавь имя и своё фото — или оставь аватар с инициалами.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (reading) return;
          const name = draft.name.trim();
          if (!name || name.length > 40) {
            setError("Введи имя от 1 до 40 символов.");
            return;
          }
          const next = { name, avatar: draft.avatar };
          try {
            localStorage.setItem(storageKey, JSON.stringify(next));
          } catch {
            setError(
              "Не удалось сохранить профиль в браузере. Освободи место или разреши локальное хранилище и повтори попытку.",
            );
            return;
          }
          onSave(next);
        }}
      >
        <div className="profile-preview">
          <Avatar profile={draft} large />
          <Camera size={18} aria-hidden="true" />
          <span>Твоё фото или инициалы</span>
        </div>
        <label htmlFor="profile-name">Имя в городе</label>
        <input
          id="profile-name"
          autoFocus
          maxLength={40}
          autoComplete="nickname"
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
        <label htmlFor="profile-avatar">Фото или аватар</label>
        <input
          ref={fileInput}
          id="profile-avatar"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          aria-describedby="profile-image-note"
          onChange={(event) => {
            void selectAvatar(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <p id="profile-image-note" className="form-note">
          PNG, JPEG или WebP · до 2 МБ · до 4096 × 4096 пикселей.
        </p>
        {(draft.avatar || reading) && (
          <button
            className="text-button"
            type="button"
            onClick={() => {
              fileVersion.current += 1;
              setReading(false);
              setDraft({ ...draft, avatar: null });
              setError("");
              if (fileInput.current) fileInput.current.value = "";
            }}
          >
            Убрать фото
          </button>
        )}
        <p className="form-note">
          Имя и фото сохраняются только в локальном хранилище этого браузера.
          Они не отправляются на сервер и не синхронизируются. Очистка данных
          браузера удалит профиль.
        </p>
        {reading && (
          <p role="status" className="form-note">
            Проверяем изображение…
          </p>
        )}
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="button secondary" onClick={close}>
            Отмена
          </button>
          <button className="button primary" type="submit" disabled={reading}>
            Сохранить профиль
          </button>
        </div>
      </form>
    </Dialog>
  );
}

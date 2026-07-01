import { FormEvent, useState } from "react";
import { ApiError } from "@/types";
import { loginAdmin } from "@/api/client";
import shared from "@/styles/shared.module.scss";

interface Props {
  onClose: () => void;
  onLoggedIn: (token: string) => void;
}

export default function AdminLoginModal({ onClose, onLoggedIn }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { access_token } = await loginAdmin(username, password);
      onLoggedIn(access_token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось войти");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={shared.overlay} onClick={onClose}>
      <div className={shared.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Вход для администратора</h2>
        {error && <div className={shared.errorBanner}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={shared.formField}>
            <label htmlFor="username">Логин</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className={shared.formField}>
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className={shared.modalActions}>
            <button type="button" className={shared.btn} onClick={onClose}>
              Отмена
            </button>
            <button
              type="submit"
              className={`${shared.btn} ${shared.btnPrimary}`}
              disabled={submitting}
            >
              {submitting ? "Вход…" : "Войти"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

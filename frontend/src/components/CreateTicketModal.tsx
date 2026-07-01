import { FormEvent, useState } from "react";
import { ApiError, TicketPriority } from "@/types";
import { createTicket } from "@/api/client";
import { PRIORITY_OPTIONS } from "@/components/Badges/Badges";
import shared from "@/styles/shared.module.scss";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateTicketModal({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descError, setDescError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    let ok = true;
    const trimmed = title.trim();
    if (trimmed.length < 3 || trimmed.length > 120) {
      setTitleError("Заголовок должен содержать от 3 до 120 символов");
      ok = false;
    } else {
      setTitleError(null);
    }
    if (description.length > 1000) {
      setDescError("Описание не может быть длиннее 1000 символов");
      ok = false;
    } else {
      setDescError(null);
    }
    return ok;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await createTicket({
        title: title.trim(),
        description: description.trim() ? description.trim() : undefined,
        priority,
      });
      onCreated();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Не удалось создать заявку");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={shared.overlay} onClick={onClose}>
      <div className={shared.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Новая заявка</h2>
        {submitError && <div className={shared.errorBanner}>{submitError}</div>}
        <form onSubmit={handleSubmit}>
          <div className={shared.formField}>
            <label htmlFor="title">Заголовок *</label>
            <input
              id="title"
              type="text"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            {titleError && <span className={shared.fieldError}>{titleError}</span>}
          </div>

          <div className={shared.formField}>
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              value={description}
              maxLength={1000}
              onChange={(e) => setDescription(e.target.value)}
            />
            <span className={shared.charCount}>{description.length} / 1000</span>
            {descError && <span className={shared.fieldError}>{descError}</span>}
          </div>

          <div className={shared.formField}>
            <label htmlFor="priority">Приоритет</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
            >
              {PRIORITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
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
              {submitting ? "Создание…" : "Создать заявку"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

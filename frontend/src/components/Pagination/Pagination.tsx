import styles from "./Pagination.module.scss";
import shared from "@/styles/shared.module.scss";

interface Props {
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function Pagination({
  page,
  pages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: Props) {
  if (total === 0) return null;

  return (
    <div className={styles.pagination}>
      <span>
        Всего заявок: {total} · Страница {page} из {pages}
      </span>
      <div className={styles.controls}>
        <select
          aria-label="Размер страницы"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          <option value={5}>5 / стр.</option>
          <option value={10}>10 / стр.</option>
          <option value={20}>20 / стр.</option>
          <option value={50}>50 / стр.</option>
        </select>
        <button
          className={`${shared.btn} ${shared.btnSm}`}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ← Назад
        </button>
        <button
          className={`${shared.btn} ${shared.btnSm}`}
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Вперёд →
        </button>
      </div>
    </div>
  );
}

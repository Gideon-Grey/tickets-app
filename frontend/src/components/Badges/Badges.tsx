import { TicketPriority, TicketStatus } from "@/types";
import styles from "./Badges.module.scss";

const STATUS_LABELS: Record<TicketStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Выполнена",
};

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Низкий",
  normal: "Обычный",
  high: "Высокий",
};

const STATUS_DOT_CLASS: Record<TicketStatus, string> = {
  new: styles.statusDotNew,
  in_progress: styles.statusDotInProgress,
  done: styles.statusDotDone,
};

const PRIORITY_CLASS: Record<TicketPriority, string> = {
  low: styles.priorityLow,
  normal: styles.priorityNormal,
  high: styles.priorityHigh,
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={styles.status}>
      <span className={`${styles.statusDot} ${STATUS_DOT_CLASS[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span className={`${styles.priority} ${PRIORITY_CLASS[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "new", label: STATUS_LABELS.new },
  { value: "in_progress", label: STATUS_LABELS.in_progress },
  { value: "done", label: STATUS_LABELS.done },
];

export const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: "low", label: PRIORITY_LABELS.low },
  { value: "normal", label: PRIORITY_LABELS.normal },
  { value: "high", label: PRIORITY_LABELS.high },
];

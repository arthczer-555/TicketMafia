import type { TicketCategory, TicketStatus } from "@/lib/slack/types";

export const STATUS_LABEL: Record<TicketStatus, string> = {
  todo: "À faire",
  doing: "En cours",
  waiting: "En attente",
  done: "Terminé",
};

export const STATUS_ORDER: TicketStatus[] = ["todo", "doing", "waiting", "done"];

const STATUS_CLASS: Record<TicketStatus, string> = {
  todo: "bg-slate-100 text-slate-700 border-slate-200",
  doing: "bg-blue-50 text-blue-700 border-blue-200",
  waiting: "bg-amber-50 text-amber-800 border-amber-200",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

const CATEGORY_LABEL: Record<TicketCategory, string> = {
  bugs: "Bug",
  features: "Feature",
};

const CATEGORY_CLASS: Record<TicketCategory, string> = {
  bugs: "bg-red-50 text-red-700 border-red-200",
  features: "bg-violet-50 text-violet-700 border-violet-200",
};

export function CategoryBadge({ category }: { category: TicketCategory }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${CATEGORY_CLASS[category]}`}
    >
      {CATEGORY_LABEL[category]}
    </span>
  );
}

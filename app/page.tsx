import Link from "next/link";
import { listTickets } from "@/lib/db/queries";
import { KanbanBoard } from "@/components/KanbanBoard";
import { STATUS_LABEL, STATUS_ORDER } from "@/components/badges";
import type { TicketCategory, TicketStatus } from "@/lib/slack/types";
import { signOut } from "./login/actions";

const CATEGORY_FILTERS: { key: "all" | TicketCategory; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "bugs", label: "Bugs" },
  { key: "features", label: "Features" },
  { key: "super_admin", label: "Super-admin" },
];

const VALID_CATEGORIES: TicketCategory[] = ["bugs", "features", "super_admin"];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categoryParam } = await searchParams;
  const category: "all" | TicketCategory =
    VALID_CATEGORIES.includes(categoryParam as TicketCategory)
      ? (categoryParam as TicketCategory)
      : "all";

  const tickets = await listTickets({ category });
  const counts: Record<TicketStatus, number> = { todo: 0, doing: 0, waiting: 0, done: 0 };
  for (const t of tickets) counts[t.status]++;

  return (
    <main className="mx-auto max-w-7xl p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">TicketMafia</h1>
        <div className="flex items-center gap-4">
          <nav className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
            {CATEGORY_FILTERS.map((f) => (
              <Link
                key={f.key}
                href={f.key === "all" ? "/" : `/?category=${f.key}`}
                className={`rounded px-3 py-1 text-sm transition ${
                  category === f.key
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/settings"
            className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
          >
            Settings
          </Link>
          <form action={signOut}>
            <button className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100">
              Déconnexion
            </button>
          </form>
        </div>
      </header>

      {tickets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-600">
            Aucun ticket pour le moment. Envoie un message dans{" "}
            <code className="rounded bg-slate-100 px-1">#00-bugs-and-changes</code>,{" "}
            <code className="rounded bg-slate-100 px-1">#01-features-and-ideation</code>{" "}
            ou{" "}
            <code className="rounded bg-slate-100 px-1">#super-admin-dashboards</code>{" "}
            pour en créer.
          </p>
        </div>
      ) : (
        <KanbanBoard tickets={tickets} />
      )}

      <p className="mt-6 text-xs text-slate-400">
        {tickets.length} ticket{tickets.length > 1 ? "s" : ""} —{" "}
        {STATUS_ORDER.map((s) => `${STATUS_LABEL[s]}: ${counts[s]}`).join(" · ")}
      </p>
    </main>
  );
}

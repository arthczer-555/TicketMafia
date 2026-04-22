import Link from "next/link";
import { listArchivedTickets } from "@/lib/db/queries";
import { ArchiveButton } from "@/components/ArchiveButton";
import { CategoryBadge, StatusBadge } from "@/components/badges";
import { slackToPlainText } from "@/lib/slack/text";

export const dynamic = "force-dynamic";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ArchivePage() {
  const tickets = await listArchivedTickets();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-4">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
          ← Tous les tickets
        </Link>
      </div>

      <h1 className="mb-1 text-2xl font-semibold">Archive</h1>
      <p className="mb-6 text-sm text-slate-500">
        Tickets retirés du kanban. Tu peux les restaurer à tout moment.
      </p>

      {tickets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          Aucun ticket archivé pour l'instant.
        </div>
      ) : (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {tickets.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/tickets/${t.id}`}
                  className="block truncate text-sm font-medium text-slate-900 hover:underline"
                >
                  {slackToPlainText(t.title)}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <CategoryBadge category={t.category} />
                  <StatusBadge status={t.status} />
                  {t.owner && <span className="capitalize">👤 {t.owner}</span>}
                  <span>
                    Archivé le {t.archived_at ? formatDateTime(t.archived_at) : "—"}
                  </span>
                </div>
              </div>
              <ArchiveButton ticketId={t.id} archived={true} />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-slate-400">
        {tickets.length} ticket{tickets.length > 1 ? "s" : ""} archivé{tickets.length > 1 ? "s" : ""}.
      </p>
    </main>
  );
}

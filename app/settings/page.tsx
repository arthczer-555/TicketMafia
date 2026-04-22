import Link from "next/link";
import { listOwners } from "@/lib/db/queries";
import { addOwner, deleteOwner } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const owners = await listOwners();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-4">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
          ← Tous les tickets
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-semibold">Settings</h1>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-slate-900">Owners</h2>
        <p className="mb-4 text-sm text-slate-500">
          Les personnes qui peuvent être assignées comme owner d'un ticket. Apparaissent dans le
          dropdown sur chaque ticket.
        </p>

        <form action={addOwner} className="mb-6 flex gap-2">
          <input
            type="text"
            name="name"
            required
            placeholder="prénom (ex: thomas)"
            maxLength={40}
            className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Ajouter
          </button>
        </form>

        {owners.length === 0 ? (
          <p className="rounded border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
            Aucun owner pour l'instant.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {owners.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2">
                <span className="text-sm capitalize text-slate-800">{o.name}</span>
                <form action={deleteOwner}>
                  <input type="hidden" name="id" value={o.id} />
                  <button
                    type="submit"
                    className="text-xs text-slate-400 hover:text-red-600"
                    aria-label="Supprimer"
                  >
                    Supprimer
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

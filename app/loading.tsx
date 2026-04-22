import { STATUS_LABEL, STATUS_ORDER } from "@/components/badges";

// Skeleton shown during real fetches (1st visit / hard reload). Cached navigations
// served from the router cache bypass this entirely.
export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
        <div className="flex gap-2">
          <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-24 animate-pulse rounded bg-slate-200" />
        </div>
      </header>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_ORDER.map((s) => (
          <div key={s} className="flex min-w-[260px] flex-1 flex-col rounded-lg bg-slate-100 p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="h-5 w-20 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-transparent">
                {STATUS_LABEL[s]}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

import type { TicketStatus } from "@/lib/slack/types";
import { STATUS_LABEL, STATUS_ORDER } from "@/components/badges";

export const STATUS_COLOR: Record<TicketStatus, string> = {
  todo: "#94a3b8",
  doing: "#3b82f6",
  waiting: "#f59e0b",
  done: "#10b981",
};

function polar(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function arcPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number
): string {
  const large = endAngle - startAngle > Math.PI ? 1 : 0;
  const o1 = polar(cx, cy, rOuter, startAngle);
  const o2 = polar(cx, cy, rOuter, endAngle);
  const i1 = polar(cx, cy, rInner, endAngle);
  const i2 = polar(cx, cy, rInner, startAngle);
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${i2.x} ${i2.y}`,
    "Z",
  ].join(" ");
}

export function StatusDonut({ byStatus }: { byStatus: Record<TicketStatus, number> }) {
  const total = STATUS_ORDER.reduce((n, s) => n + byStatus[s], 0);
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 64;
  const rInner = 42;

  let cursor = -Math.PI / 2;
  const segments = STATUS_ORDER.map((s) => {
    const value = byStatus[s];
    if (total === 0 || value === 0) return null;
    const sweep = (value / total) * Math.PI * 2;
    const start = cursor;
    const end = cursor + sweep;
    cursor = end;
    const safeEnd = end - start >= Math.PI * 2 ? end - 0.0001 : end;
    return { status: s, d: arcPath(cx, cy, rOuter, rInner, start, safeEnd) };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        aria-label="Répartition par statut"
      >
        {total === 0 ? (
          <circle
            cx={cx}
            cy={cy}
            r={(rOuter + rInner) / 2}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={rOuter - rInner}
          />
        ) : (
          segments.map(
            (seg) =>
              seg && <path key={seg.status} d={seg.d} fill={STATUS_COLOR[seg.status]} />
          )
        )}
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          className="fill-slate-900 text-2xl font-semibold"
        >
          {total}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="fill-slate-500 text-[10px]">
          tickets
        </text>
      </svg>
      <ul className="w-full flex flex-col gap-1.5 text-sm">
        {STATUS_ORDER.map((s) => {
          const value = byStatus[s];
          const pct = total === 0 ? 0 : Math.round((value / total) * 100);
          return (
            <li key={s} className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: STATUS_COLOR[s] }}
              />
              <span className="truncate text-slate-700">{STATUS_LABEL[s]}</span>
              <span className="ml-auto shrink-0 tabular-nums text-slate-900">{value}</span>
              <span className="w-10 shrink-0 text-right text-xs tabular-nums text-slate-400">
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function OwnerBars({
  rows,
}: {
  rows: Array<{
    name: string;
    isUnassigned: boolean;
    total: number;
    byStatus: Record<TicketStatus, number>;
  }>;
}) {
  const max = Math.max(1, ...rows.map((r) => r.total));
  return (
    <div className="flex flex-col gap-3">
      {rows.map((r) => {
        const barWidthPct = (r.total / max) * 100;
        return (
          <div key={r.name}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span
                className={
                  r.isUnassigned
                    ? "italic text-slate-500"
                    : "font-medium capitalize text-slate-800"
                }
              >
                {r.name}
              </span>
              <span className="tabular-nums text-slate-500">{r.total}</span>
            </div>
            <div
              className="flex h-5 overflow-hidden rounded bg-slate-100"
              style={{ width: `${Math.max(barWidthPct, 2)}%` }}
            >
              {STATUS_ORDER.map((s) => {
                const value = r.byStatus[s];
                if (value === 0) return null;
                const pct = (value / Math.max(r.total, 1)) * 100;
                return (
                  <div
                    key={s}
                    title={`${STATUS_LABEL[s]}: ${value}`}
                    style={{ width: `${pct}%`, backgroundColor: STATUS_COLOR[s] }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        {STATUS_ORDER.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: STATUS_COLOR[s] }}
            />
            {STATUS_LABEL[s]}
          </span>
        ))}
      </div>
    </div>
  );
}

export function WeeklyBars({
  weeks,
}: {
  weeks: Array<{ weekStart: string; label: string; count: number }>;
}) {
  const max = Math.max(1, ...weeks.map((w) => w.count));
  const width = 320;
  const height = 160;
  const padding = { top: 16, right: 8, bottom: 24, left: 24 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const barGap = 6;
  const barW = (plotW - barGap * (weeks.length - 1)) / weeks.length;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      aria-label="Tickets créés par semaine"
    >
      {[0, 0.5, 1].map((t) => {
        const y = padding.top + plotH * (1 - t);
        return (
          <g key={t}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="2 3"
            />
            <text
              x={padding.left - 4}
              y={y + 3}
              textAnchor="end"
              className="fill-slate-400 text-[9px]"
            >
              {Math.round(max * t)}
            </text>
          </g>
        );
      })}
      {weeks.map((w, i) => {
        const h = (w.count / max) * plotH;
        const x = padding.left + i * (barW + barGap);
        const y = padding.top + plotH - h;
        return (
          <g key={w.weekStart}>
            <title>{`Semaine du ${w.label} — ${w.count} ticket${w.count > 1 ? "s" : ""}`}</title>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, w.count === 0 ? 0 : 2)}
              rx={2}
              fill="#3b82f6"
            />
            {w.count > 0 && (
              <text
                x={x + barW / 2}
                y={y - 3}
                textAnchor="middle"
                className="fill-slate-600 text-[10px] font-medium"
              >
                {w.count}
              </text>
            )}
            <text
              x={x + barW / 2}
              y={height - 8}
              textAnchor="middle"
              className="fill-slate-500 text-[9px]"
            >
              {w.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

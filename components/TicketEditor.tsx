"use client";

import { useTransition } from "react";
import { updateTicket } from "@/app/tickets/[id]/actions";
import { STATUS_LABEL, STATUS_ORDER } from "@/components/badges";
import type { TicketStatus } from "@/lib/slack/types";

type Props = {
  ticketId: string;
  status: TicketStatus;
  owner: string | null;
  deadline: string | null; // ISO date 'YYYY-MM-DD' or null
  ownerOptions: string[];
};

export function TicketEditor({ ticketId, status, owner, deadline, ownerOptions }: Props) {
  const [pending, startTransition] = useTransition();

  function submitField(name: string, value: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", ticketId);
      fd.set("status", name === "status" ? value : status);
      fd.set("owner", name === "owner" ? value : owner ?? "");
      fd.set("deadline", name === "deadline" ? value : deadline ?? "");
      await updateTicket(fd);
    });
  }

  // If the current owner isn't in the dropdown list (e.g. removed from
  // settings), show it as an extra option so it's not lost visually.
  const optionsWithCurrent =
    owner && !ownerOptions.includes(owner) ? [...ownerOptions, owner] : ownerOptions;

  return (
    <div className="flex flex-col gap-3">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Statut
        </span>
        <select
          value={status}
          disabled={pending}
          onChange={(e) => submitField("status", e.target.value)}
          className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none disabled:opacity-50"
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Owner
        </span>
        <select
          value={owner ?? ""}
          disabled={pending}
          onChange={(e) => submitField("owner", e.target.value)}
          className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm capitalize focus:border-slate-500 focus:outline-none disabled:opacity-50"
        >
          <option value="">— aucun —</option>
          {optionsWithCurrent.map((u) => (
            <option key={u} value={u} className="capitalize">
              {u}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Deadline
        </span>
        <input
          type="date"
          value={deadline ?? ""}
          disabled={pending}
          onChange={(e) => submitField("deadline", e.target.value)}
          className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none disabled:opacity-50"
        />
      </label>
    </div>
  );
}

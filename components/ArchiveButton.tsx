"use client";

import { useTransition } from "react";
import { archiveTicket, unarchiveTicket } from "@/app/tickets/[id]/actions";
import { ArchiveIcon, ArchiveRestoreIcon } from "./icons";

type Variant = "card" | "detail" | "list";

type Props = {
  ticketId: string;
  archived: boolean;
  redirectTo?: string;
  variant?: Variant;
};

export function ArchiveButton({
  ticketId,
  archived,
  redirectTo,
  variant = "detail",
}: Props) {
  const [pending, startTransition] = useTransition();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const fd = new FormData();
    fd.set("id", ticketId);
    if (redirectTo) fd.set("redirect_to", redirectTo);
    startTransition(() => (archived ? unarchiveTicket(fd) : archiveTicket(fd)));
  }

  const Icon = archived ? ArchiveRestoreIcon : ArchiveIcon;
  const label = archived ? "Restaurer" : "Archiver";

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-label={label}
        title={label}
        className="absolute right-2 top-10 hidden h-6 w-6 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm hover:bg-slate-100 hover:text-slate-900 group-hover:flex disabled:opacity-50"
      >
        <Icon className="h-3.5 w-3.5" />
      </button>
    );
  }

  if (variant === "list") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-50"
      >
        <Icon className="h-3.5 w-3.5" />
        {pending ? "…" : label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
    >
      <Icon className="h-4 w-4" />
      {pending ? "…" : label}
    </button>
  );
}

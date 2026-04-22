"use client";

import { useTransition } from "react";
import { deleteTicket } from "@/app/tickets/[id]/actions";

type Props = {
  ticketId: string;
  redirectTo?: string;
  variant?: "card" | "detail";
  ticketTitle?: string;
};

export function DeleteTicketButton({
  ticketId,
  redirectTo = "/",
  variant = "card",
  ticketTitle,
}: Props) {
  const [pending, startTransition] = useTransition();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const label = ticketTitle ? `« ${ticketTitle} »` : "ce ticket";
    if (!confirm(`Supprimer ${label} ?\nCette action est irréversible.`)) return;
    const fd = new FormData();
    fd.set("id", ticketId);
    fd.set("redirect_to", redirectTo);
    startTransition(() => deleteTicket(fd));
  }

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-label="Supprimer le ticket"
        title="Supprimer"
        className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm hover:bg-red-50 hover:text-red-600 group-hover:flex disabled:opacity-50"
      >
        ✕
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="rounded border border-red-200 bg-white px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "Suppression…" : "Supprimer le ticket"}
    </button>
  );
}

"use client";

import { useRef, useTransition } from "react";
import { addComment } from "@/app/tickets/[id]/actions";

export function CommentForm({ ticketId }: { ticketId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await addComment(fd);
      formRef.current?.reset();
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <input type="hidden" name="ticket_id" value={ticketId} />
      <input
        type="text"
        name="author"
        required
        maxLength={60}
        placeholder="Qui commente ?"
        className="mb-2 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      <textarea
        name="body"
        required
        rows={3}
        placeholder="Ton commentaire…"
        className="w-full resize-y rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {pending ? "Envoi…" : "Commenter"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { borrowBook } from "@/lib/api";

export default function BookActions({ bookId, availableCopies }: { bookId: string; availableCopies: number }) {
  const { data: session, isPending } = authClient.useSession();
  const [durationDays, setDurationDays] = useState(7);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  async function borrow() {
    if (!session) {
      router.push(`/login?next=${encodeURIComponent(`/books/${bookId}`)}`);
      return;
    }
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const { borrow: record } = await borrowBook(bookId, durationDays);
      const dueDate = record.dueAt
        ? new Date(record.dueAt).toLocaleDateString("en", { dateStyle: "long" })
        : `${durationDays} days`;
      setSuccess(`Borrowed successfully. Due ${dueDate}.`);
      dialogRef.current?.close();
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Could not borrow this book.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-7 space-y-4">
      <button
        type="button"
        className="btn border-0 bg-[#C87958] text-[#00022E] hover:bg-[#da9578]"
        disabled={isPending || availableCopies < 1}
        onClick={() => {
          if (!session) {
            router.push(`/login?next=${encodeURIComponent(`/books/${bookId}`)}`);
            return;
          }
          setError("");
          dialogRef.current?.showModal();
        }}
      >
        {availableCopies < 1 ? "Currently unavailable" : session ? "Borrow this book" : "Sign in to borrow"}
      </button>
      {success && <p role="status" className="text-sm font-semibold text-green-700">{success}</p>}
      <dialog
        ref={dialogRef}
        className="modal"
        aria-labelledby="borrow-dialog-title"
        onClose={() => setError("")}
      >
        <div className="modal-box max-w-md bg-white text-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.15em] text-[#A85335]">Borrow this book</p>
              <h2 id="borrow-dialog-title" className="mt-2 font-serif text-2xl font-bold">Choose a return date</h2>
            </div>
            <button type="button" className="btn btn-ghost btn-sm btn-circle" aria-label="Close borrow dialog" onClick={() => dialogRef.current?.close()}>
              <X size={18} />
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-600">Select how long you need. We’ll save the due date to your borrow record.</p>
          <label className="mt-6 flex items-center gap-3 text-sm font-semibold">
            <CalendarDays size={18} aria-hidden="true" />
            Borrow period
            <select className="select select-bordered ml-auto bg-white text-slate-900" value={durationDays} onChange={(event) => setDurationDays(Number(event.target.value))}>
              {[3, 5, 7, 10, 14, 30].map((days) => <option key={days} value={days}>{days} days</option>)}
            </select>
          </label>
          {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => dialogRef.current?.close()}>Cancel</button>
            <button type="button" className="btn border-0 bg-[#C87958] text-[#00022E] hover:bg-[#da9578]" disabled={busy} onClick={borrow}>
              {busy ? "Borrowing…" : "Confirm borrow"}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button aria-label="Close borrow dialog">close</button>
        </form>
      </dialog>
    </div>
  );
}

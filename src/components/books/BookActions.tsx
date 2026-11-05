"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { borrowBook, listBorrows } from "@/lib/api";

export default function BookActions({
  bookId,
  availableCopies,
}: {
  bookId: string;
  availableCopies: number;
}) {
  const { data: session, isPending } = authClient.useSession();
  const [durationDays, setDurationDays] = useState(7);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [borrowedBookId, setBorrowedBookId] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  const copiesCount = typeof availableCopies === "number" ? availableCopies : 0;
  const isAvailable = copiesCount > 0;
  const hasActiveBorrow = Boolean(session) && borrowedBookId === bookId;

  // Check if current logged-in user already borrowed this book
  useEffect(() => {
    if (!session) return;

    let active = true;
    listBorrows()
      .then((res) => {
        if (active) {
          const already = res.items.some((borrow) => borrow.bookId === bookId);
          setBorrowedBookId(already ? bookId : "");
        }
      })
      .catch((issue: unknown) => {
        if (active) {
          toast.error(
            issue instanceof Error
              ? `Could not check your borrows: ${issue.message}`
              : "Could not check your current borrows.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [session, bookId]);

  function handleOpenBorrow() {
    if (!session) {
      router.push(`/login?next=${encodeURIComponent(`/books/${bookId}`)}`);
      return;
    }

    if (!isAvailable) {
      toast.error("This book is not available.");
      return;
    }

    if (hasActiveBorrow) {
      toast.error("You cannot borrow the same book two times at the same time.");
      return;
    }

    setError("");
    dialogRef.current?.showModal();
  }

  async function borrow() {
    if (!session) {
      router.push(`/login?next=${encodeURIComponent(`/books/${bookId}`)}`);
      return;
    }

    if (hasActiveBorrow) {
      const msg = "You cannot borrow the same book two times at the same time.";
      setError(msg);
      toast.error(msg);
      dialogRef.current?.close();
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
      const successMessage = `Borrowed successfully. Due ${dueDate}.`;
      setSuccess(successMessage);
      toast.success(successMessage);
      setBorrowedBookId(bookId);
      dialogRef.current?.close();
      router.refresh();
    } catch (issue) {
      const message =
        issue instanceof Error ? issue.message : "Could not borrow this book.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-7 space-y-4">
      {hasActiveBorrow && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800"
        >
          <CheckCircle2 size={16} />
          You currently have this book borrowed.
        </div>
      )}

      <button
        type="button"
        className={`btn border-0 ${
          !isAvailable
            ? "cursor-not-allowed bg-slate-200 text-slate-500 hover:bg-slate-200"
            : "bg-[#C87958] text-[#00022E] hover:bg-[#da9578]"
        }`}
        disabled={isPending || !isAvailable}
        onClick={handleOpenBorrow}
      >
        {!isAvailable
          ? "Not Available"
          : hasActiveBorrow
          ? "Already Borrowed"
          : session
          ? "Borrow this book"
          : "Sign in to borrow"}
      </button>

      {success && (
        <p role="status" className="text-sm font-semibold text-green-700">
          {success}
        </p>
      )}

      <dialog
        ref={dialogRef}
        className="modal"
        aria-labelledby="borrow-dialog-title"
        onClose={() => setError("")}
      >
        <div className="modal-box max-w-md bg-white text-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.15em] text-[#A85335]">
                Borrow this book
              </p>
              <h2
                id="borrow-dialog-title"
                className="mt-2 font-serif text-2xl font-bold"
              >
                Choose a return date
              </h2>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Close borrow dialog"
              onClick={() => dialogRef.current?.close()}
            >
              <X size={18} />
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Select how long you need. We’ll save the due date to your borrow record.
          </p>
          <label className="mt-6 flex items-center gap-3 text-sm font-semibold">
            <CalendarDays size={18} aria-hidden="true" />
            Borrow period
            <select
              className="select select-bordered ml-auto bg-white text-slate-900"
              value={durationDays}
              onChange={(event) => setDurationDays(Number(event.target.value))}
            >
              {[3, 5, 7, 10, 14, 30].map((days) => (
                <option key={days} value={days}>
                  {days} days
                </option>
              ))}
            </select>
          </label>
          {error && (
            <p
              role="alert"
              className="mt-5 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700"
            >
              {error}
            </p>
          )}
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy}
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn border-0 bg-[#C87958] text-[#00022E] hover:bg-[#da9578]"
              disabled={busy || !isAvailable}
              onClick={borrow}
            >
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

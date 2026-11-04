"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { borrowBook } from "@/lib/api";

export default function BookActions({ bookId, availableCopies }: { bookId: string; availableCopies: number }) {
  const { data: session, isPending } = authClient.useSession();
  const [durationDays, setDurationDays] = useState(7);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
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
      await borrowBook(bookId, durationDays);
      setSuccess(`Borrowed successfully. Please return it within ${durationDays} days.`);
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Could not borrow this book.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-7 space-y-4">
      {session && availableCopies > 0 && <label className="flex items-center gap-3 text-sm font-semibold">Borrow period
        <select className="select select-bordered bg-white text-slate-900" value={durationDays} onChange={(event) => setDurationDays(Number(event.target.value))}>
          {[3, 5, 7, 10, 14].map((days) => <option key={days} value={days}>{days} days</option>)}
        </select>
      </label>}
      <button className="btn border-0 bg-[#C87958] text-[#00022E] hover:bg-[#da9578]" disabled={isPending || busy || availableCopies < 1} onClick={borrow}>
        {busy ? "Borrowing…" : availableCopies < 1 ? "Currently unavailable" : session ? "Borrow this book" : "Sign in to borrow"}
      </button>
      {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
      {success && <p role="status" className="text-sm font-semibold text-green-700">{success}</p>}
    </div>
  );
}

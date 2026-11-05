"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import { listBorrows, returnBook } from "@/lib/api";
import type { Borrow } from "@/types/book";

export default function MyBorrowsList() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    listBorrows()
      .then((result) => {
        if (active) setBorrows(result.items);
      })
      .catch((issue: unknown) => {
        const message = issue instanceof Error ? issue.message : "Could not load borrows.";
        if (active) {
          setError(message);
          toast.error(message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  function retryLoad() {
    setError("");
    setLoading(true);
    setReloadKey((key) => key + 1);
  }

  async function returnBorrow(borrow: Borrow) {
    setBusyId(borrow._id);
    try {
      await returnBook(borrow._id);
      setBorrows((current) => current.filter((entry) => entry._id !== borrow._id));
      toast.success(`“${borrow.bookTitle}” has been returned.`);
    } catch (issue) {
      toast.error(issue instanceof Error ? issue.message : "Could not return this book.");
    } finally {
      setBusyId("");
    }
  }

  if (loading) {
    return <p role="status" className="flex items-center gap-3 text-white"><LoaderCircle className="animate-spin" />Loading your borrows…</p>;
  }

  if (error) {
    return <div role="alert" className="rounded-2xl border border-red-200 bg-white p-7 text-red-800">
      <p>Could not load your borrows: {error}</p>
      <button type="button" className="btn btn-sm mt-4" onClick={retryLoad}>Try again</button>
    </div>;
  }

  return borrows.length ? (
    <div className="grid gap-4">
      {borrows.map((borrow) => (
        <article key={borrow._id} className="flex flex-col gap-4 rounded-2xl bg-white p-5 text-slate-900 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold">{borrow.bookTitle}</h2>
            <p className="mt-1 text-sm text-slate-600">Borrowed <time dateTime={borrow.borrowedAt}>{new Date(borrow.borrowedAt).toLocaleDateString()}</time></p>
            {borrow.dueAt && <p className="mt-1 text-sm font-semibold text-slate-700">Return by <time dateTime={borrow.dueAt}>{new Date(borrow.dueAt).toLocaleDateString()}</time></p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="btn btn-sm btn-outline" href={`/books/${encodeURIComponent(borrow.bookId)}`}>Book details</Link>
            <button type="button" className="btn btn-sm border-0 bg-[#C87958] text-[#00022E] hover:bg-[#da9578]" disabled={busyId === borrow._id} onClick={() => void returnBorrow(borrow)}>
              {busyId === borrow._id ? "Returning…" : "Return book"}
            </button>
          </div>
        </article>
      ))}
    </div>
  ) : (
    <div className="rounded-2xl border border-dashed border-[#00022E]/20 bg-white p-8 text-[#514740]">
      <p>No current borrows.</p>
      <Link href="/books" className="btn mt-5 border-0 bg-[#C87958] text-[#00022E]">Browse books</Link>
    </div>
  );
}

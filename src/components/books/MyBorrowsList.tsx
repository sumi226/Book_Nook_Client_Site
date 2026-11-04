"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { listBorrows, returnBook } from "@/lib/api";
import type { Borrow } from "@/types/book";

export default function MyBorrowsList() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  async function refresh() {
    const result = await listBorrows();
    setBorrows(result.items);
  }

  useEffect(() => {
    let active = true;
    listBorrows().then((result) => { if (active) setBorrows(result.items); })
      .catch((issue) => { if (active) setError(issue instanceof Error ? issue.message : "Could not load borrows."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function returnBorrow(borrow: Borrow) {
    setBusyId(borrow._id);
    setError("");
    try {
      await returnBook(borrow._id);
      setBorrows((current) => current.filter((entry) => entry._id !== borrow._id));
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Could not return this book.");
    } finally {
      setBusyId("");
    }
  }

  if (loading) return <p className="flex items-center gap-3"><LoaderCircle className="animate-spin" />Loading your borrows…</p>;
  return <>
    {error && <div role="alert" className="mb-5 rounded-xl bg-red-950/50 p-4 text-red-100"><p>{error}</p><button className="mt-2 underline" onClick={() => { setError(""); setLoading(true); refresh().catch((issue) => setError(issue.message)).finally(() => setLoading(false)); }}>Try again</button></div>}
    {borrows.length ? <div className="grid gap-4">{borrows.map((borrow) => <article key={borrow._id} className="flex flex-col gap-4 rounded-2xl bg-white p-5 text-slate-900 shadow-lg sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="font-serif text-xl font-bold">{borrow.bookTitle}</h2><p className="mt-1 text-sm text-slate-600">Borrowed {new Date(borrow.borrowedAt).toLocaleDateString()}</p>{borrow.dueAt && <p className="mt-1 text-sm font-semibold text-slate-700">Return by {new Date(borrow.dueAt).toLocaleDateString()}</p>}</div>
      <div className="flex gap-2"><Link className="btn btn-sm btn-outline" href={`/books/${encodeURIComponent(borrow.bookId)}`}>Book details</Link><button className="btn btn-sm border-0 bg-[#C87958] text-[#00022E] hover:bg-[#da9578]" disabled={busyId === borrow._id} onClick={() => returnBorrow(borrow)}>{busyId === borrow._id ? "Returning…" : "Return book"}</button></div>
    </article>)}</div> : !error && <div className="rounded-2xl border border-[#00022E]/15 bg-white p-8 text-[#514740]">No current borrows. <Link href="/books" className="font-bold text-[#A85335] underline">Browse books.</Link></div>}
  </>;
}

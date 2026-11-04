"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { deleteBook, listMyBooks } from "@/lib/api";
import BookCard from "@/components/books/BookCard";
import type { Book } from "@/types/book";

export default function MyBooksList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    listMyBooks().then((result) => { if (active) setBooks(result.items); })
      .catch((issue) => { if (active) setError(issue instanceof Error ? issue.message : "Could not load your books."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function removeBook(book: Book) {
    if (!window.confirm(`Remove “${book.title}” from your books?`)) return;
    setError("");
    setNotice("");
    try {
      await deleteBook(book._id);
      setBooks((current) => current.filter((entry) => entry._id !== book._id));
      setNotice("Book removed from your collection.");
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Could not remove this book.");
    }
  }

  if (loading) return <p className="flex items-center gap-3"><LoaderCircle className="animate-spin" />Loading your books…</p>;
  return <>
    {error && <p role="alert" className="mb-5 rounded-xl bg-red-950/50 p-4 text-red-100">{error}</p>}
    {notice && <p role="status" className="mb-5 rounded-xl bg-green-950/50 p-4 text-green-100">{notice}</p>}
    {books.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{books.map((book) => <div key={book._id} className="space-y-3"><BookCard book={book} /><button className="btn btn-sm btn-outline border-[#00022E]/30 text-[#00022E]" onClick={() => removeBook(book)}>Remove book</button></div>)}</div> : !error && <div className="rounded-2xl border border-[#00022E]/15 bg-white p-8 text-[#514740]">You haven’t added a book yet. <Link className="font-bold text-[#A85335] underline" href="/add-book">Add your first book.</Link></div>}
  </>;
}

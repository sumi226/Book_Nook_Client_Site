"use client";

import { useMemo, useState } from "react";
import BookGrid from "@/components/books/BookGrid";
import type { Book } from "@/types/book";

export default function BookSearchGrid({ books }: { books: Book[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return books;
    return books.filter((book) => `${book.title} ${book.author} ${book.category}`.toLowerCase().includes(normalized));
  }, [books, query]);
  return (
    <>
      <label className="mb-7 block max-w-xl">
        <span className="sr-only">Search books by title, author, or category</span>
        <input className="input input-lg w-full border-slate-300 bg-white text-slate-900" placeholder="Search title, author, or category…" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <BookGrid books={filtered} />
    </>
  );
}

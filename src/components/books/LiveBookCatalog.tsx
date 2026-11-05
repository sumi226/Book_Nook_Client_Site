"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import BookGrid from "@/components/books/BookGrid";
import BookSearchGrid from "@/components/books/BookSearchGrid";
import { listBooks } from "@/lib/api";
import type { Book } from "@/types/book";

const PAGE_SIZE = 24;

export function HomeBookCards() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listBooks(1, 6)
      .then(({ items }) => {
        if (active) setBooks(items);
      })
      .catch((issue: unknown) => {
        const message = issue instanceof Error ? issue.message : "The library could not be reached.";
        if (active) {
          setError(message);
          toast.error(`Could not load live books: ${message}`);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p role="status" className="flex items-center gap-3 text-[#514740]"><LoaderCircle className="animate-spin" />Loading live books…</p>;
  }
  if (error) {
    return <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">Could not load live books: {error}</p>;
  }
  return <BookGrid books={books} />;
}

export function AllBooksCatalog({ page }: { page: number }) {
  const [result, setResult] = useState<{
    page: number;
    books: Book[];
    totalPages: number;
    error?: string;
  }>({ page: 0, books: [], totalPages: 0 });

  useEffect(() => {
    let active = true;
    listBooks(page, PAGE_SIZE)
      .then((response) => {
        if (active) {
          setResult({
            page,
            books: response.items,
            totalPages: response.pagination.totalPages,
          });
        }
      })
      .catch((issue: unknown) => {
        const message = issue instanceof Error ? issue.message : "The library could not be reached.";
        if (active) {
          setResult({ page, books: [], totalPages: 0, error: message });
          toast.error(`Could not load live books: ${message}`);
        }
      });

    return () => {
      active = false;
    };
  }, [page]);

  if (result.page !== page) {
    return <p role="status" className="flex items-center gap-3 text-[#514740]"><LoaderCircle className="animate-spin" />Loading live books…</p>;
  }
  if (result.error) {
    return <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">Could not load live books: {result.error}</p>;
  }

  return <>
    <BookSearchGrid books={result.books} />
    {result.totalPages > 1 && <nav aria-label="Book pages" className="mt-8 flex justify-center gap-3">
      {page > 1 && <Link className="btn btn-outline border-[#00022E]/30 text-[#00022E]" href={`/books?page=${page - 1}`}>Previous</Link>}
      <span className="self-center text-sm text-[#514740]">Page {page} of {result.totalPages}</span>
      {page < result.totalPages && <Link className="btn btn-outline border-[#00022E]/30 text-[#00022E]" href={`/books?page=${page + 1}`}>Next</Link>}
    </nav>}
  </>;
}

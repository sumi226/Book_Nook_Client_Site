import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, CalendarDays, UserRound } from "lucide-react";
import BookActions from "@/components/books/BookActions";
import { ApiError, getBook } from "@/lib/api";
import type { Book } from "@/types/book";

export const dynamic = "force-dynamic";

export default async function BookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[\da-f]{24}$/i.test(id)) {
    notFound();
  }
  let book: Book;
  try {
    book = await getBook(id);
  } catch (issue) {
    if (issue instanceof ApiError && issue.status === 404) {
      notFound();
    }
    throw issue;
  }

  const available = typeof book.availableCopies === "number"
    ? book.availableCopies
    : (typeof book.copies === "number" ? book.copies : 0);

  return <article className="mx-auto max-w-5xl">
    <Link href="/books" className="mb-6 inline-flex items-center gap-2 font-semibold text-[#A85335] hover:underline"><ArrowLeft size={17} /> Back to all books</Link>
    <div className="grid overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl md:grid-cols-[.8fr_1.2fr]">
      <div className="relative min-h-80 bg-slate-100 md:min-h-[560px]"><Image src={book.image} alt={`Cover of ${book.title}`} fill unoptimized sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" /></div>
      <div className="p-7 sm:p-10">
        <span className="badge border-0 bg-[#00022E] px-3 py-3 text-white">{book.category}</span>
        <h1 className="mt-5 font-serif text-4xl font-bold sm:text-5xl">{book.title}</h1>
        <p className="mt-3 text-lg text-slate-600">by {book.author}</p>
        <div className="my-6 flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700"><BookOpen size={18} />{available} of {book.totalCopies} copies currently available</div>
        <h2 className="font-bold">About this book</h2>
        <p className="mt-2 whitespace-pre-line leading-7 text-slate-700">{book.description}</p>
        {(book.addedByName || book.addedAt) && <dl className="mt-7 space-y-3 border-t border-slate-200 pt-5 text-sm text-slate-600">
          {book.addedByName && <div className="flex items-center gap-2"><UserRound size={16} aria-hidden="true" /><dt className="font-semibold text-slate-800">Shared by</dt><dd>{book.addedByName}</dd></div>}
          {book.addedAt && <div className="flex items-center gap-2"><CalendarDays size={16} aria-hidden="true" /><dt className="font-semibold text-slate-800">Added</dt><dd><time dateTime={book.addedAt}>{new Date(book.addedAt).toLocaleDateString("en", { dateStyle: "long" })}</time></dd></div>}
        </dl>}
        <BookActions bookId={book._id} availableCopies={available} />
      </div>
    </div>
  </article>;
}

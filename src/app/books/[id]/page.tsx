import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import BookActions from "@/components/books/BookActions";
import { getBook } from "@/lib/api";
import type { Book } from "@/types/book";

export const dynamic = "force-dynamic";

export default async function BookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let book: Book;
  try {
    book = await getBook(id);
  } catch {
    notFound();
  }

  return <article className="mx-auto max-w-5xl">
    <Link href="/books" className="mb-6 inline-flex items-center gap-2 font-semibold text-[#A85335] hover:underline"><ArrowLeft size={17} /> Back to all books</Link>
    <div className="grid overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl md:grid-cols-[.8fr_1.2fr]">
      <div className="relative min-h-80 bg-slate-100 md:min-h-[560px]"><Image src={book.image} alt={`Cover of ${book.title}`} fill unoptimized sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" /></div>
      <div className="p-7 sm:p-10">
        <span className="badge border-0 bg-[#00022E] px-3 py-3 text-white">{book.category}</span>
        <h1 className="mt-5 font-serif text-4xl font-bold sm:text-5xl">{book.title}</h1>
        <p className="mt-3 text-lg text-slate-600">by {book.author}</p>
        <div className="my-6 flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700"><BookOpen size={18} />{book.availableCopies} of {book.totalCopies} copies currently available</div>
        <h2 className="font-bold">About this book</h2>
        <p className="mt-2 whitespace-pre-line leading-7 text-slate-700">{book.description}</p>
        <BookActions bookId={book._id} availableCopies={book.availableCopies} />
      </div>
    </div>
  </article>;
}

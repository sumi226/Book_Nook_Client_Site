import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { Book } from "@/types/book";

export default function BookCard({ book }: { book: Book }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-900 shadow-xl shadow-black/15">
      <Link
        href={`/books/${encodeURIComponent(book._id)}`}
        className="group block"
        aria-label={`View details for ${book.title}`}
      >
        <div className="relative aspect-[2/3] overflow-hidden bg-slate-100">
          {/* External cover URLs are supplied by the existing catalog/API. */}
          <Image
            src={book.image}
            alt={`Cover of ${book.title}`}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <span className="absolute left-3 top-3 rounded-full bg-[#00022E]/90 px-3 py-1 text-xs font-semibold text-white">
            {book.category}
          </span>
        </div>
        <div className="p-5">
          <h3 className="line-clamp-1 font-serif text-xl font-bold">{book.title}</h3>
          <p className="mt-1 text-sm text-slate-600">by {book.author}</p>
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#A85335]">
            View Details <ArrowUpRight aria-hidden="true" size={16} />
          </p>
        </div>
      </Link>
      <p className="flex items-center gap-2 border-t border-slate-200 px-5 py-3 text-xs text-slate-600">
        <BookOpen aria-hidden="true" size={14} />
        {book.availableCopies} of {book.totalCopies} copies available
      </p>
    </article>
  );
}

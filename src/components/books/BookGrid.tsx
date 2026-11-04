import BookCard from "@/components/books/BookCard";
import type { Book } from "@/types/book";

export default function BookGrid({ books }: { books: Book[] }) {
  if (!books.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/30 p-10 text-center text-white/80">
        No books are available yet. Check back soon or add the first title.
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => <BookCard key={book._id} book={book} />)}
    </div>
  );
}

import AuthGuard from "@/components/auth/AuthGuard";
import MyBooksList from "@/components/books/MyBooksList";

export const metadata = { title: "My Books" };

export default function MyBooksPage() {
  return <AuthGuard><section><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-[#A85335]">Your contribution</p><h1 className="mt-2 font-serif text-4xl font-bold">My Books</h1></div><a className="btn border-0 bg-[#C87958] text-[#00022E] hover:bg-[#da9578]" href="/add-book">Add a book</a></div><MyBooksList /></section></AuthGuard>;
}

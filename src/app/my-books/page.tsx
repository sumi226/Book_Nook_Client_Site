import AuthGuard from "@/components/auth/AuthGuard";
import MyBooksList from "@/components/books/MyBooksList";

export const metadata = { title: "My Books" };

export default function MyBooksPage() {
  return <AuthGuard><section><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-[#e2bd98]">Your contribution</p><h1 className="mt-2 font-serif text-4xl font-bold">My Books</h1></div><a className="btn border-0 bg-[#c2956b] text-[#16110d] hover:bg-[#ddb58e]" href="/add-book">Add a book</a></div><MyBooksList /></section></AuthGuard>;
}

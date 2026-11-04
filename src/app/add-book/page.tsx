import AuthGuard from "@/components/auth/AuthGuard";
import AddBookForm from "@/components/books/AddBookForm";

export const metadata = { title: "Add a Book" };

export default function AddBookPage() {
  return <AuthGuard><section className="mx-auto max-w-2xl"><p className="text-sm font-bold uppercase tracking-[.2em] text-[#e2bd98]">Share a story</p><h1 className="mb-7 mt-2 font-serif text-4xl font-bold">Add a Book</h1><AddBookForm /></section></AuthGuard>;
}

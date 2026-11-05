import AuthGuard from "@/components/auth/AuthGuard";
import AddBookForm from "@/components/books/AddBookForm";
import AccountWelcome from "@/components/auth/AccountWelcome";
import { requireAuthenticatedUser } from "@/lib/require-auth";

export const metadata = { title: "Add a Book" };

export default async function AddBookPage() {
  await requireAuthenticatedUser("/add-book");
  return <AuthGuard><section className="mx-auto max-w-2xl"><AccountWelcome /><p className="text-sm font-bold uppercase tracking-[.2em] text-[#A85335]">Share a story</p><h1 className="mb-3 mt-2 font-serif text-4xl font-bold">Add a Book</h1><p className="mb-7 text-slate-600">Add a title to the community shelves for other readers to discover.</p><AddBookForm /></section></AuthGuard>;
}

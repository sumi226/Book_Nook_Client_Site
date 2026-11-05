import AuthGuard from "@/components/auth/AuthGuard";
import MyBorrowsList from "@/components/books/MyBorrowsList";
import AccountWelcome from "@/components/auth/AccountWelcome";
import { requireAuthenticatedUser } from "@/lib/require-auth";

export const metadata = { title: "My Borrows" };

export default async function MyBorrowsPage() {
  await requireAuthenticatedUser("/my-borrows");
  return <AuthGuard><section><AccountWelcome /><p className="text-sm font-bold uppercase tracking-[.2em] text-[#A85335]">Keep track of your reads</p><h1 className="mt-2 font-serif text-4xl font-bold">My Borrows</h1><p className="mb-8 mt-2 text-slate-600">See your current books and return them when you finish reading.</p><MyBorrowsList /></section></AuthGuard>;
}

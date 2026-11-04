import AuthGuard from "@/components/auth/AuthGuard";
import MyBorrowsList from "@/components/books/MyBorrowsList";

export const metadata = { title: "My Borrows" };

export default function MyBorrowsPage() {
  return <AuthGuard><section><p className="text-sm font-bold uppercase tracking-[.2em] text-[#A85335]">Keep track of your reads</p><h1 className="mb-8 mt-2 font-serif text-4xl font-bold">My Borrows</h1><MyBorrowsList /></section></AuthGuard>;
}

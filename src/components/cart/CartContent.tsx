"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LoaderCircle, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCart } from "@/components/cart/CartProvider";
import { authClient } from "@/lib/auth-client";
import { borrowBook, listBorrows } from "@/lib/api";

const BORROW_DURATIONS = [3, 5, 7, 10, 14, 30];

export default function CartContent() {
  const { data: session, isPending } = authClient.useSession();
  const cart = useCart();
  const userId = session?.user.id;
  const [durationDays, setDurationDays] = useState(7);
  const [borrowState, setBorrowState] = useState<{
    userId: string;
    requestKey: number;
    status: "ready" | "error";
    borrowedIds: Set<string>;
    error: string;
  }>({ userId: "", requestKey: -1, status: "error", borrowedIds: new Set(), error: "" });
  const [reloadKey, setReloadKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const isBorrowStateCurrent =
    Boolean(userId) && borrowState.userId === userId && borrowState.requestKey === reloadKey;
  const cartMatchesSession = session
    ? cart.userId === userId
    : cart.userId === null;
  const borrowStatus = !userId
    ? "idle"
    : isBorrowStateCurrent
    ? borrowState.status
    : "loading";
  const borrowedIds = isBorrowStateCurrent ? borrowState.borrowedIds : new Set<string>();

  useEffect(() => {
    if (!userId) return;

    let active = true;
    listBorrows()
      .then(({ items }) => {
        if (active) {
          setBorrowState({
            userId,
            requestKey: reloadKey,
            status: "ready",
            borrowedIds: new Set(items.map((borrow) => borrow.bookId)),
            error: "",
          });
        }
      })
      .catch((issue: unknown) => {
        if (active) {
          const message = issue instanceof Error ? issue.message : "Could not check your borrows.";
          setBorrowState({
            userId,
            requestKey: reloadKey,
            status: "error",
            borrowedIds: new Set(),
            error: message,
          });
          toast.error(`Could not check your current borrows: ${message}`);
        }
      });

    return () => {
      active = false;
    };
  }, [userId, reloadKey]);

  async function borrowCart() {
    if (busy || borrowStatus !== "ready") return;
    setBusy(true);
    setCheckoutError("");

    const completedIds: string[] = [];
    const failures: string[] = [];
    for (const book of cart.items) {
      if (borrowedIds.has(book._id)) {
        failures.push(`“${book.title}” is already borrowed.`);
        continue;
      }
      if (book.availableCopies <= 0) {
        failures.push(`“${book.title}” is unavailable.`);
        continue;
      }

      try {
        await borrowBook(book._id, durationDays);
        completedIds.push(book._id);
      } catch (issue) {
        const message = issue instanceof Error ? issue.message : "Could not borrow this book.";
        failures.push(`“${book.title}”: ${message}`);
      }
    }

    if (completedIds.length) {
      cart.removeItems(completedIds);
      setBorrowState((current) => (
        current.userId === userId && current.requestKey === reloadKey
          ? { ...current, borrowedIds: new Set([...current.borrowedIds, ...completedIds]) }
          : current
      ));
      toast.success(
        completedIds.length === 1
          ? "Book borrowed successfully."
          : `${completedIds.length} books borrowed successfully.`,
      );
    }
    if (failures.length) {
      const failureMessage = failures.join(" ");
      setCheckoutError(failureMessage);
      toast.error(
        completedIds.length
          ? `${failures.length} book(s) could not be borrowed and remain in your cart.`
          : failureMessage,
      );
    }

    setBusy(false);
  }

  if (isPending || !cartMatchesSession || (session && !cart.isReady)) {
    return <p role="status" className="flex items-center gap-3"><LoaderCircle className="animate-spin" />Loading your cart…</p>;
  }

  if (!session) {
    return (
      <div className="rounded-2xl border border-dashed border-[#00022E]/20 bg-white p-8 text-center text-[#514740]">
        <ShoppingCart className="mx-auto text-[#A85335]" size={32} />
        <p className="mt-4">Sign in to view and manage your cart.</p>
        <Link href="/login?next=%2Fcart" className="btn mt-5 border-0 bg-[#C87958] text-[#00022E] hover:bg-[#da9578]">
          Sign in
        </Link>
      </div>
    );
  }

  if (!cart.items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#00022E]/20 bg-white p-8 text-center text-[#514740]">
        <ShoppingCart className="mx-auto text-[#A85335]" size={32} />
        <p className="mt-4">Your cart is empty.</p>
        <Link href="/books" className="btn mt-5 border-0 bg-[#C87958] text-[#00022E] hover:bg-[#da9578]">
          Browse books
        </Link>
      </div>
    );
  }

  const borrowableCount = cart.items.filter(
    (book) => book.availableCopies > 0 && !borrowedIds.has(book._id),
  ).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        {cart.items.map((book) => {
          const isBorrowed = borrowedIds.has(book._id);
          const isUnavailable = book.availableCopies <= 0;
          return (
            <article key={book._id} className="flex gap-4 rounded-2xl bg-white p-4 text-slate-900 shadow-sm sm:items-center">
              <Link href={`/books/${encodeURIComponent(book._id)}`} className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <Image src={book.image} alt={`Cover of ${book.title}`} fill unoptimized sizes="80px" className="object-contain" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/books/${encodeURIComponent(book._id)}`} className="font-serif text-lg font-bold hover:underline">
                  {book.title}
                </Link>
                <p className="mt-1 text-sm text-slate-600">by {book.author}</p>
                <p className={`mt-2 text-sm font-semibold ${isUnavailable || isBorrowed ? "text-red-700" : "text-green-700"}`}>
                  {isBorrowed ? "Already borrowed" : isUnavailable ? "Unavailable" : `${book.availableCopies} available`}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-square text-red-700"
                aria-label={`Remove ${book.title} from cart`}
                disabled={busy}
                onClick={() => {
                  cart.removeItem(book._id);
                  toast.success(`“${book.title}” removed from your cart.`);
                }}
              >
                <Trash2 size={18} />
              </button>
            </article>
          );
        })}
      </div>

      <aside className="h-fit rounded-2xl bg-white p-6 text-slate-900 shadow-sm">
        <h2 className="font-serif text-2xl font-bold">Borrow selected books</h2>
        <p className="mt-2 text-sm text-slate-600">
          Each title can only be borrowed once at a time. Unavailable or already borrowed books will stay in your cart.
        </p>
        {borrowStatus === "loading" && (
          <p role="status" className="mt-4 text-sm text-slate-600">Checking your current borrows…</p>
        )}
        {borrowStatus === "error" && (
          <div role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            <p>Could not verify your current borrows: {borrowState.error}</p>
            <button
              type="button"
              className="btn btn-sm mt-3"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Try again
            </button>
          </div>
        )}
        <label className="mt-5 flex items-center justify-between gap-3 text-sm font-semibold">
          Borrow period
          <select
            className="select select-bordered bg-white text-slate-900"
            value={durationDays}
            onChange={(event) => setDurationDays(Number(event.target.value))}
          >
            {BORROW_DURATIONS.map((days) => <option key={days} value={days}>{days} days</option>)}
          </select>
        </label>
        {checkoutError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{checkoutError}</p>}
        <button
          type="button"
          className="btn mt-5 w-full border-0 bg-[#C87958] text-[#00022E] hover:bg-[#da9578]"
          disabled={busy || borrowStatus !== "ready" || borrowableCount === 0}
          onClick={() => void borrowCart()}
        >
          {busy
            ? "Borrowing…"
            : borrowStatus === "loading"
            ? "Checking borrows…"
            : borrowStatus === "error"
            ? "Retry borrow check above"
            : `Borrow ${borrowableCount} book${borrowableCount === 1 ? "" : "s"}`}
        </button>
        <Link href="/books" className="mt-4 block text-center text-sm font-semibold text-[#A85335] hover:underline">
          Continue browsing
        </Link>
      </aside>
    </div>
  );
}

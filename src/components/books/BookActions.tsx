"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCart } from "@/components/cart/CartProvider";
import { authClient } from "@/lib/auth-client";
import { listBorrows } from "@/lib/api";
import type { Book } from "@/types/book";

export default function BookActions({ book }: { book: Book }) {
  const { data: session, isPending } = authClient.useSession();
  const cart = useCart();
  const userId = session?.user.id;
  const [borrowState, setBorrowState] = useState<{
    userId: string;
    status: "checking" | "clear" | "borrowed" | "error";
  }>({ userId: "", status: "checking" });
  const autoAddHandled = useRef(false);
  const router = useRouter();

  const bookId = book._id;
  const isAvailable = book.availableCopies > 0;
  const isInCart = cart.items.some((item) => item._id === bookId);
  const borrowStatus = userId
    ? (borrowState.userId === userId ? borrowState.status : "checking")
    : "clear";
  const hasActiveBorrow = borrowStatus === "borrowed";

  useEffect(() => {
    if (!userId) return;

    let active = true;
    listBorrows()
      .then(({ items }) => {
        if (active) {
          setBorrowState({
            userId,
            status: items.some((borrow) => borrow.bookId === bookId) ? "borrowed" : "clear",
          });
        }
      })
      .catch((issue: unknown) => {
        if (active) {
          setBorrowState({ userId, status: "error" });
          toast.error(
            issue instanceof Error
              ? `Could not check your borrows: ${issue.message}`
              : "Could not check your current borrows.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [userId, bookId]);

  useEffect(() => {
    if (!session || !cart.isReady || autoAddHandled.current) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("addToCart") !== "1") return;
    autoAddHandled.current = true;
    let destination = `/books/${encodeURIComponent(bookId)}`;

    if (hasActiveBorrow) {
      toast.error("You already have this book borrowed.");
    } else {
      const result = cart.addItem(book);
      if (result === "added") {
        toast.success(`“${book.title}” added to your cart.`);
        destination = "/books";
      } else if (result === "unavailable") toast.error("This book is not available.");
      else if (result === "duplicate") toast("This book is already in your cart.");
      else toast.error("Could not add this book to your cart. Please try again.");
    }

    router.replace(destination, { scroll: false });
  }, [session, cart, borrowStatus, hasActiveBorrow, book, bookId, router]);

  function addToCart() {
    if (!session) {
      const next = `/books/${encodeURIComponent(bookId)}?addToCart=1`;
      toast("Sign in to add this book to your cart.");
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    if (hasActiveBorrow) {
      toast.error("You already have this book borrowed.");
      return;
    }
    const result = cart.addItem(book);
    if (result === "added") {
      toast.success(`“${book.title}” added to your cart.`);
      router.push("/books");
    } else if (result === "unavailable") toast.error("This book is not available.");
    else if (result === "duplicate") toast("This book is already in your cart.");
    else if (result === "loading") toast("Your cart is still loading. Please try again.");
    else toast.error("Please sign in to add this book.");
  }

  const disabled =
    isPending ||
    !isAvailable ||
    isInCart ||
    hasActiveBorrow ||
    (Boolean(session) && !cart.isReady);

  return (
    <div className="mt-7 space-y-4">
      {hasActiveBorrow && (
        <div role="status" className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">
          <CheckCircle2 size={16} />
          You already have this book borrowed.
        </div>
      )}
      {isInCart && (
        <div role="status" className="rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">
          This book is in your cart.
        </div>
      )}
      {borrowStatus === "error" && session && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
          Could not verify your current borrows. The server will check again when you confirm from the cart.
        </p>
      )}
      <button
        type="button"
        className={`btn border-0 ${
          !isAvailable || disabled
            ? "cursor-not-allowed bg-slate-200 text-slate-500 hover:bg-slate-200"
            : "bg-[#C87958] text-[#00022E] hover:bg-[#da9578]"
        }`}
        disabled={disabled}
        onClick={addToCart}
      >
        {!isAvailable
          ? "Unavailable"
          : hasActiveBorrow
          ? "Already Borrowed"
          : isInCart
          ? "In Cart"
          : isPending || (session && !cart.isReady)
          ? "Checking availability…"
          : session
          ? "Add to Cart"
          : "Sign in to borrow"}
      </button>
    </div>
  );
}

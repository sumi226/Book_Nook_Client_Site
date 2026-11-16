"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import type { Book } from "@/types/book";

export type CartBook = Pick<
  Book,
  "_id" | "title" | "author" | "image" | "availableCopies" | "totalCopies"
>;

type CartContextValue = {
  items: CartBook[];
  isReady: boolean;
  isAuthenticated: boolean;
  addItem: (book: Book) => AddItemResult;
  removeItem: (bookId: string) => void;
  removeItems: (bookIds: string[]) => void;
};

type AddItemResult = "added" | "duplicate" | "unavailable" | "loading" | "sign_in";
type CartState = { userId: string | null; items: CartBook[]; ready: boolean };

const CartContext = createContext<CartContextValue | null>(null);

function getStorageKey(userId: string) {
  return `booknook-cart:${encodeURIComponent(userId)}`;
}

function isCartBook(value: unknown): value is CartBook {
  if (!value || typeof value !== "object") return false;
  const book = value as Partial<CartBook>;
  return (
    typeof book._id === "string" &&
    typeof book.title === "string" &&
    typeof book.author === "string" &&
    typeof book.image === "string" &&
    typeof book.availableCopies === "number" &&
    typeof book.totalCopies === "number"
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user.id;
  const [cartState, setCartState] = useState<CartState>({
    userId: null,
    items: [],
    ready: false,
  });

  useEffect(() => {
    if (isPending) return;
    let active = true;

    void Promise.resolve().then(() => {
      if (!active) return;
      if (!userId) {
        setCartState({ userId: null, items: [], ready: true });
        return;
      }

      try {
        const saved = window.localStorage.getItem(getStorageKey(userId));
        const parsed: unknown = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(parsed) || !parsed.every(isCartBook)) {
          throw new Error("Saved cart data is invalid.");
        }
        setCartState({ userId, items: parsed, ready: true });
      } catch (issue) {
        const message = issue instanceof Error ? issue.message : "Could not read the saved cart.";
        setCartState({ userId, items: [], ready: true });
        toast.error(`Could not load your cart: ${message}`);
      }
    });

    return () => {
      active = false;
    };
  }, [isPending, userId]);

  function saveItems(nextItems: CartBook[]) {
    if (!userId || cartState.userId !== userId || !cartState.ready) return;
    setCartState({ userId, items: nextItems, ready: true });

    try {
      window.localStorage.setItem(getStorageKey(userId), JSON.stringify(nextItems));
    } catch (issue) {
      const message = issue instanceof Error ? issue.message : "Could not save the cart.";
      toast.error(`Your cart could not be saved: ${message}`);
    }
  }

  function addItem(book: Book): AddItemResult {
    if (isPending || !userId) return "sign_in";
    if (cartState.userId !== userId || !cartState.ready) return "loading";
    if (book.availableCopies <= 0) return "unavailable";
    if (cartState.items.some((item) => item._id === book._id)) return "duplicate";

    const cartBook: CartBook = {
      _id: book._id,
      title: book.title,
      author: book.author,
      image: book.image,
      availableCopies: book.availableCopies,
      totalCopies: book.totalCopies,
    };
    saveItems([...cartState.items, cartBook]);
    return "added";
  }

  function removeItems(bookIds: string[]) {
    if (!userId || cartState.userId !== userId || !cartState.ready) return;
    const ids = new Set(bookIds);
    saveItems(cartState.items.filter((item) => !ids.has(item._id)));
  }

  function removeItem(bookId: string) {
    removeItems([bookId]);
  }

  const visibleItems = userId && cartState.userId === userId ? cartState.items : [];
  const value: CartContextValue = {
    items: visibleItems,
    isReady: isPending ? false : !userId || (cartState.userId === userId && cartState.ready),
    isAuthenticated: Boolean(userId),
    addItem,
    removeItem,
    removeItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used within a CartProvider.");
  }
  return value;
}

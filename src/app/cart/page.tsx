import type { Metadata } from "next";
import CartContent from "@/components/cart/CartContent";

export const metadata: Metadata = { title: "Add to Cart" };

export default function CartPage() {
  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-[#A85335]">Your selected books</p>
        <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">Add to Cart</h1>
        <p className="mt-3 text-[#514740]">Review your selections and confirm which books you want to borrow.</p>
      </div>
      <CartContent />
    </section>
  );
}

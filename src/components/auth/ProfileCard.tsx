"use client";

import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";

export default function ProfileCard() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  if (!user) return null;
  return (
    <section className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center text-slate-900 shadow-2xl sm:p-12">
      {user.image ? <Image src={user.image} alt="" width={96} height={96} unoptimized className="mx-auto size-24 rounded-full object-cover" /> : <div className="mx-auto grid size-24 place-items-center rounded-full bg-[#00022E] font-serif text-3xl font-bold text-white">{user.name.slice(0, 1).toUpperCase()}</div>}
      <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-[#705035]">Reader profile</p>
      <h1 className="mt-2 font-serif text-3xl font-bold">{user.name}</h1>
      <p className="mt-2 text-slate-600">{user.email}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3"><Link className="btn border-0 bg-[#c2956b] text-[#16110d]" href="/my-books">My Books</Link><Link className="btn btn-outline" href="/my-borrows">My Borrows</Link></div>
    </section>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronDown, LogOut, Menu, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/books", label: "All Books" },
];

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  async function logout() {
    await authClient.signOut();
    router.replace("/");
    router.refresh();
  }

  const user = session?.user;
  const privateLinks = [
    { href: "/add-book", label: "Add Book" },
    { href: "/my-books", label: "My Books" },
    { href: "/my-borrows", label: "My Borrows" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#00022E] text-white shadow-lg">
      <div className="navbar mx-auto min-h-20 max-w-7xl px-4 sm:px-8">
        <div className="navbar-start gap-2">
          <div className="dropdown">
            <button type="button" aria-label="Open navigation menu" className="btn btn-ghost btn-circle text-white lg:hidden">
              <Menu size={22} />
            </button>
            <ul className="menu dropdown-content z-20 mt-3 w-56 rounded-2xl bg-[#00022E] p-3 text-white shadow-xl lg:hidden">
              {publicLinks.map((item) => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}
              {user && privateLinks.map((item) => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}
              {user && <li><Link href="/my-profile">My Profile</Link></li>}
              {!user && !isPending && <><li><Link href="/login">Login</Link></li><li><Link href="/register">Register</Link></li></>}
            </ul>
          </div>
          <Link href="/" className="flex items-center gap-2 rounded-lg font-serif text-2xl font-bold tracking-tight" aria-label="BookNook home">
            <span className="grid size-10 place-items-center rounded-xl bg-[#C87958] text-[#00022E]"><BookOpen size={22} /></span>
            BookNook
          </Link>
        </div>
        <nav className="navbar-center hidden lg:flex" aria-label="Main navigation">
          <ul className="menu menu-horizontal items-center gap-1 px-1 text-sm font-semibold">
            {publicLinks.map((item) => <li key={item.href}><Link href={item.href} className="hover:bg-white/10">{item.label}</Link></li>)}
            {user && privateLinks.map((item) => <li key={item.href}><Link href={item.href} className="hover:bg-white/10">{item.label}</Link></li>)}
          </ul>
        </nav>
        <div className="navbar-end gap-2">
          {!isPending && !user && <>
            <Link href="/login" className="btn btn-ghost btn-sm text-white">Login</Link>
            <Link href="/register" className="btn btn-sm border-0 bg-[#C87958] text-[#00022E] hover:bg-[#da9578]">Register</Link>
          </>}
          {user && <div className="dropdown dropdown-end">
            <button type="button" className="btn btn-ghost gap-2 rounded-full text-white" aria-label="Open account menu">
              {user.image ? <Image src={user.image} alt="" width={32} height={32} unoptimized className="size-8 rounded-full object-cover" /> : <span className="grid size-8 place-items-center rounded-full bg-white/15"><UserRound size={17} /></span>}
              <span className="hidden max-w-32 truncate sm:inline">{user.name}</span><ChevronDown size={16} />
            </button>
            <ul className="menu dropdown-content z-20 mt-3 w-56 rounded-2xl bg-white p-3 text-slate-900 shadow-xl">
              <li className="menu-title px-3">{user.name}</li>
              <li><Link href="/my-profile"><UserRound size={16} />My Profile</Link></li>
              <li><button type="button" onClick={logout}><LogOut size={16} />Logout</button></li>
            </ul>
          </div>}
        </div>
      </div>
    </header>
  );
}

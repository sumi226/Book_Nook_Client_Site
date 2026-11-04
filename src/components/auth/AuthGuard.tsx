"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isPending, pathname, router, session]);

  if (isPending || !session) {
    return <div className="flex min-h-[45vh] items-center justify-center text-[#00022E]"><LoaderCircle className="animate-spin" /> <span className="ml-3">Checking your library pass…</span></div>;
  }
  return children;
}

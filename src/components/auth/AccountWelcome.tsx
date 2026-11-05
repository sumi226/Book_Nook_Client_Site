"use client";

import { authClient } from "@/lib/auth-client";

export default function AccountWelcome() {
  const { data: session } = authClient.useSession();
  if (!session) return null;

  return (
    <div className="mb-7 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-[#00022E]/10 bg-white/80 px-5 py-3 text-sm text-slate-600">
      <span>Signed in as</span>
      <span className="font-semibold text-[#00022E]">{session.user.name}</span>
      <span className="text-slate-400">·</span>
      <span>{session.user.email}</span>
    </div>
  );
}

"use client"

import { useSession } from "next-auth/react";

export function SessionDebug() {
  const { data: session } = useSession();

  return (
    <div className="fixed top-0 left-0 z-50 bg-black text-white p-2 text-xs">
      {session ? (
        <span>Logged in as: {session.user?.email} (Role: {session.user?.role})</span>
      ) : (
        <span>Not logged in</span>
      )}
    </div>
  );
}
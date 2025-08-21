"use client"

import { SessionProvider } from "next-auth/react"
import { SessionDebug } from "./session-debug"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionDebug />
      {children}
    </SessionProvider>
  )
}
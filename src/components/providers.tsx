"use client"

import { SessionProvider } from "next-auth/react"
import { SessionDebug } from "./session-debug"
import { ToastProvider } from "./ui/toast-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <SessionDebug />
        {children}
      </ToastProvider>
    </SessionProvider>
  )
}
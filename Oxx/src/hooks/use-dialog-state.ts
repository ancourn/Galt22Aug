"use client"

import * as React from "react"

export function useDialogState(initialOpen = false) {
  const [open, setOpen] = React.useState(initialOpen)

  const onOpenChange = React.useCallback((newOpen: boolean) => {
    setOpen(newOpen)
  }, [])

  return { open, setOpen, onOpenChange }
}
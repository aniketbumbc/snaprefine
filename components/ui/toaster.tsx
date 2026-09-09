"use client";

import * as React from "react"
import { useEditorStore } from "@/store/useEditorState"
import { Toast } from "@/components/ui/toast"

const AUTO_DISMISS_MS = 5000

export function Toaster() {
  const { toast, clearToast } = useEditorStore()

  React.useEffect(() => {
    if (!toast) return
    const timer = setTimeout(clearToast, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [toast, clearToast])

  if (!toast) return null

  return (
    <Toast
      variant={toast.variant}
      message={toast.message}
      onClose={clearToast}
    />
  )
}

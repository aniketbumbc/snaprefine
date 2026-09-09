"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const toastVariants = cva(
  "pointer-events-auto w-full max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg flex items-start gap-3",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive: "bg-card text-destructive border-destructive/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type ToastProps = React.ComponentProps<"div"> &
  VariantProps<typeof toastVariants> & {
    message: string
    onClose: () => void
  }

function Toast({ className, variant, message, onClose, ...props }: ToastProps) {
  return (
    <div
      role="alert"
      className={cn(
        "fixed top-4 right-4 z-[100]",
        toastVariants({ variant }),
        className
      )}
      {...props}
    >
      <p className="flex-1 leading-relaxed">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export { Toast, toastVariants }

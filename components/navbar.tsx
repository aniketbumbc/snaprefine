"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Download, History, Redo, Undo, Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/useEditorState";

export function Navbar() {
  const { undoImage, redoImage, historyIndex, history, setIsHistoryOpen ,isHistoryOpen, imageUrl} = useEditorStore();

  const handleExport = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;
    link.download = `image_${timestamp}.png`;
    link.click();
  }




  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 shrink-0 z-50">
      {/* Left: Branding */}
      <div className="flex items-center gap-4">
        <Link
          className="flex items-center gap-2 font-bold text-xl hover:opacity-90 transition-opacity"
          href="/"
        >
          <div className="relative h-11 w-11 overflow-hidden rounded-xl flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Coder's Banana Logo"
              fill
              className="object-cover p-1"
              priority
            />
          </div>
          <span className="text-foreground hidden md:block tracking-tight">
            {`Coder's`}
            <span className="text-yellow-500">Cool AI Image Editor</span>
          </span>
        </Link>
      </div>

      {/* Right: Actions Toolbar */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* 1. Undo / Redo Group */}
        <div className="flex items-center bg-muted rounded-md p-1 border border-border">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={undoImage}
            disabled={historyIndex === 0}
          >
            <Undo size={15} />
          </Button>

          <div className="h-4 w-px bg-border mx-1"></div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={redoImage}
            disabled={historyIndex === history.length - 1}
          >
            <Redo size={15} />
          </Button>
        </div>

        {/* Separator 1 */}
        <div className="h-6 w-px bg-border mx-1 md:mx-2"></div>

        {/* 2. File Operations Group */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2.5 md:px-4"
          >
            <Upload size={14} className="md:mr-2" />
            <span className="hidden md:inline">Upload</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            className="h-9 bg-yellow-500 text-zinc-950 hover:bg-yellow-400 font-bold px-2.5 md:px-4 cursor-pointer"
            onClick={handleExport}
            disabled={!imageUrl}
          >
            <span className="hidden md:inline">Export</span>
            <Download size={14} className="md:ml-2"  />
          </Button>
        </div>

        {/* 3. History Toggle & Separator (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-3">
          <div className="h-6 w-px bg-border mx-2"></div>

          <Button
            onClick={() => setIsHistoryOpen()}
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 transition-all duration-200 bg-muted border border-border cursor-pointer",
              isHistoryOpen ? "bg-yellow-500 text-zinc-950" : "text-foreground"
            )}
            title="Open History"
          >
            <History size={18} className={isHistoryOpen ? "text-zinc-950" : "text-foreground"} />
          </Button>
        </div>

        {/* 4. Theme Toggle */}
        <div className="flex items-center gap-3">
          <div className="h-6 w-px bg-border mx-1 md:mx-2"></div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

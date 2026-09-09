import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export const ToolButton = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
}) => (
  <Button
    variant={active ? "secondary" : "outline"}
    size="icon"
    onClick={onClick}
    className={cn(
      "w-full h-12 rounded-xl transition-all duration-200 cursor-pointer",
      active
        ? "bg-yellow-500 text-zinc-950 hover:bg-yellow-400 border-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.4)]"
        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border-border"
    )}
    title={label}
  >
    {icon}
  </Button>
);
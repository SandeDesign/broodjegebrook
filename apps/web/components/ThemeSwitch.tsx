"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@eufraat/ui";

interface ThemeSwitchProps {
  variant?: "pill" | "segment";
  className?: string;
}

export function ThemeSwitch({ variant = "pill", className }: ThemeSwitchProps) {
  const { theme, setTheme, toggle } = useTheme();

  if (variant === "segment") {
    return (
      <div className={cn(
        "inline-flex p-1 rounded-full bg-line/[0.05] border border-line/[0.08]",
        className,
      )}>
        <button
          type="button"
          onClick={() => setTheme("light")}
          aria-label="Lichte modus"
          className={cn(
            "inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-semibold transition-colors",
            theme === "light"
              ? "bg-gold text-ink"
              : "text-cream/50 hover:text-cream/80",
          )}
        >
          <Sun className="h-3.5 w-3.5" /> Licht
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          aria-label="Donkere modus"
          className={cn(
            "inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-semibold transition-colors",
            theme === "dark"
              ? "bg-gold text-ink"
              : "text-cream/50 hover:text-cream/80",
          )}
        >
          <Moon className="h-3.5 w-3.5" /> Donker
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Schakel naar lichte modus" : "Schakel naar donkere modus"}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-line/[0.06] border border-line/[0.1] text-cream/75 hover:text-cream hover:border-gold/40 active:scale-95 transition-all",
        className,
      )}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

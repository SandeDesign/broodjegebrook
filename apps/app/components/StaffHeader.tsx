"use client";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, Bell } from "lucide-react";
import { cn } from "@eufraat/ui";

interface StaffHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  rightAction?: React.ReactNode;
}

export function StaffHeader({ title, subtitle, backHref, rightAction }: StaffHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isRoot = pathname === "/orders";
  const showBack = !isRoot;

  const handleBack = () => {
    if (backHref) router.push(backHref);
    else if (window.history.length > 1) router.back();
    else router.push("/orders");
  };

  return (
    <header
      className="fixed top-0 inset-x-0 z-40 bg-ink/95 backdrop-blur-2xl border-b border-white/[0.06]"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="h-16 px-4 flex items-center gap-3">
        {showBack ? (
          <button
            onClick={handleBack}
            aria-label="Terug"
            className="inline-flex h-10 w-10 -ml-2 items-center justify-center rounded-full text-cream/80 hover:bg-white/[0.05] active:scale-95 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-2" />
        )}
        <div className="flex-1 min-w-0">
          <h1 className={cn(
            "font-semibold tracking-tight text-cream truncate",
            subtitle ? "text-[15px] leading-tight" : "text-[17px]"
          )}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-cream/45 leading-tight truncate">{subtitle}</p>
          )}
        </div>
        {rightAction ?? (
          <button
            aria-label="Meldingen"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-cream/60 hover:bg-white/[0.05] active:scale-95 transition-all"
          >
            <Bell className="h-4.5 w-4.5" />
          </button>
        )}
      </div>
    </header>
  );
}

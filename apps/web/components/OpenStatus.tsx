"use client";
import { useEffect, useState } from "react";
import { getOpenStatus, type ServiceType } from "@/lib/hours";
import { cn } from "@eufraat/ui";

interface OpenStatusProps {
  service: ServiceType;
  className?: string;
  variant?: "pill" | "minimal";
}

export function OpenStatus({ service, className, variant = "pill" }: OpenStatusProps) {
  const [status, setStatus] = useState(() => getOpenStatus(service));

  useEffect(() => {
    setStatus(getOpenStatus(service));
    const id = setInterval(() => setStatus(getOpenStatus(service)), 60_000);
    return () => clearInterval(id);
  }, [service]);

  if (variant === "minimal") {
    return (
      <span className={cn(
        "inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] font-bold",
        status.isOpen ? "text-emerald-400" : "text-red-400",
        className,
      )}>
        <span className={cn(
          "inline-block h-2 w-2 rounded-full",
          status.isOpen ? "bg-emerald-400 pulse-ring" : "bg-red-500",
        )} />
        {status.label}
      </span>
    );
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-2.5 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] font-bold border backdrop-blur-md",
      status.isOpen
        ? "bg-emerald-500/35 text-emerald-100 border-emerald-400/70 shadow-[0_0_18px_rgba(16,185,129,0.35)]"
        : "bg-red-500/35 text-red-100 border-red-400/70 shadow-[0_0_18px_rgba(239,68,68,0.35)]",
      className,
    )}>
      <span className={cn(
        "inline-block h-2 w-2 rounded-full",
        status.isOpen ? "bg-emerald-400 pulse-ring" : "bg-red-500",
      )} />
      {status.label}
    </span>
  );
}

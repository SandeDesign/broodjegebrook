"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useStaffAuth, type StaffRole } from "@/lib/useStaffAuth";
import { StaffHeader } from "@/components/StaffHeader";
import { StaffBottomNav } from "@/components/StaffBottomNav";

interface StaffShellProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  rightAction?: React.ReactNode;
  requireRole?: StaffRole[];
  children: React.ReactNode;
}

export function StaffShell({
  title, subtitle, backHref, rightAction, requireRole, children,
}: StaffShellProps) {
  const router = useRouter();
  const { ready, isStaff, role } = useStaffAuth();

  React.useEffect(() => {
    if (!ready) return;
    if (!isStaff) { router.replace("/login"); return; }
    if (role === "bezorger") { router.replace("/bezorgen"); return; }
    if (requireRole && role && !requireRole.includes(role)) {
      router.replace("/orders");
    }
  }, [ready, isStaff, role, requireRole, router]);

  if (!ready || !isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center text-cream/40">
        Laden…
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <StaffHeader title={title} subtitle={subtitle} backHref={backHref} rightAction={rightAction} />
      <main
        className="pb-24"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 64px)",
        }}
      >
        {children}
      </main>
      <StaffBottomNav />
    </div>
  );
}

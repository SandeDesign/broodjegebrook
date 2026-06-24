"use client";
import * as React from "react";
import Link from "next/link";
import {
  collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useStaffAuth } from "@/lib/useStaffAuth";
import { StaffShell } from "@/components/StaffShell";
import {
  UserPlus, MoreVertical, Trash2, ShieldCheck, Mail, X,
} from "lucide-react";
import { cn } from "@eufraat/ui";

interface Staff {
  uid: string;
  displayName?: string;
  email?: string;
  role: "owner" | "manager" | "kitchen" | "cashier" | "bezorger";
  createdAt?: { seconds: number };
}

const ROLES = [
  { id: "owner",    label: "Owner",    color: "text-amber-300 bg-amber-400/15 border-amber-400/30" },
  { id: "manager",  label: "Manager",  color: "text-blue-300 bg-blue-500/15 border-blue-400/30" },
  { id: "kitchen",  label: "Keuken",   color: "text-orange-300 bg-orange-500/15 border-orange-400/30" },
  { id: "cashier",  label: "Kassa",    color: "text-emerald-300 bg-emerald-500/15 border-emerald-400/30" },
  { id: "bezorger", label: "Bezorger", color: "text-purple-300 bg-purple-500/15 border-purple-400/30" },
] as const;
type RoleId = typeof ROLES[number]["id"];

export default function PersoneelPage() {
  const { user: currentUser } = useStaffAuth();
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionFor, setActionFor] = React.useState<Staff | null>(null);

  React.useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db(), "staff"), orderBy("createdAt", "asc")),
      (snap) => {
        setStaff(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) })));
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, []);

  const updateRole = async (uid: string, newRole: RoleId) => {
    await updateDoc(doc(db(), "staff", uid), { role: newRole });
    setActionFor(null);
  };

  const removeStaff = async (uid: string) => {
    if (!confirm("Weet je zeker dat je deze medewerker wilt verwijderen?")) return;
    await deleteDoc(doc(db(), "staff", uid));
    setActionFor(null);
  };

  // Group by role
  const byRole: Record<string, Staff[]> = {};
  staff.forEach((s) => {
    if (!byRole[s.role]) byRole[s.role] = [];
    byRole[s.role].push(s);
  });

  return (
    <>
      <StaffShell title="Personeel" subtitle={`${staff.length} medewerker${staff.length !== 1 ? "s" : ""}`} requireRole={["owner"]}>

        {/* Add CTA */}
        <section className="px-4 mb-5">
          <Link
            href="/register"
            className="flex items-center gap-3 bg-gold text-ink rounded-2xl p-4 hover:bg-gold-soft active:scale-[0.99] transition-all"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink/15">
              <UserPlus className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-[15px] font-semibold">Nieuwe medewerker</p>
              <p className="text-[12px] opacity-75">Maak een staff-account aan</p>
            </div>
          </Link>
        </section>

        {/* List grouped by role */}
        {loading ? (
          <p className="text-center text-cream/40 py-10 text-[13px]">Laden…</p>
        ) : staff.length === 0 ? (
          <div className="px-4">
            <div className="bg-card/40 border border-dashed border-white/[0.08] rounded-2xl p-8 text-center">
              <p className="text-cream/55 text-[13px]">Nog geen medewerkers.</p>
            </div>
          </div>
        ) : (
          ROLES.map((roleCfg) => {
            const members = byRole[roleCfg.id] ?? [];
            if (members.length === 0) return null;
            return (
              <section key={roleCfg.id} className="px-4 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-cream/45">
                    {roleCfg.label}
                  </h2>
                  <span className="text-[11px] text-cream/35 tabular-nums">{members.length}</span>
                </div>
                <div className="bg-card/40 border border-white/[0.06] rounded-2xl divide-y divide-white/[0.05]">
                  {members.map((s) => (
                    <div key={s.uid} className="px-4 py-3 flex items-center gap-3">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 border border-gold/30 shrink-0">
                        <span className="font-display text-sm font-semibold text-gold">
                          {(s.displayName ?? s.email ?? "?").substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-semibold text-cream truncate">
                            {s.displayName ?? "Medewerker"}
                          </p>
                          {s.uid === currentUser?.uid && (
                            <span className="text-[9px] uppercase tracking-wider text-gold/70 font-bold">JIJ</span>
                          )}
                        </div>
                        <p className="text-[11px] text-cream/45 truncate">{s.email}</p>
                      </div>
                      <button
                        onClick={() => setActionFor(s)}
                        aria-label="Opties"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-cream/40 hover:text-cream hover:bg-white/[0.05]"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </StaffShell>

      {/* Action sheet */}
      {actionFor && (
        <div
          className="fixed inset-0 z-[70] flex flex-col justify-end bg-ink/80 backdrop-blur-md"
          onClick={() => setActionFor(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full rounded-t-3xl bg-ink border-t border-white/[0.08] shadow-2xl"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <span className="h-1 w-10 rounded-full bg-white/15" />
            </div>

            <div className="px-5 pt-3 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-semibold text-cream">{actionFor.displayName}</h3>
                  <p className="text-[12px] text-cream/45">{actionFor.email}</p>
                </div>
                <button onClick={() => setActionFor(null)} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-cream/60">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/50 mb-3 flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                Wijzig rol
              </p>
              <div className="space-y-1.5">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => updateRole(actionFor.uid, r.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-colors",
                      actionFor.role === r.id
                        ? "bg-gold/10 border-gold/30"
                        : "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06]",
                    )}
                  >
                    <span className={cn("text-[14px] font-medium", actionFor.role === r.id ? "text-gold" : "text-cream")}>
                      {r.label}
                    </span>
                    {actionFor.role === r.id && (
                      <span className="text-[10px] text-gold uppercase tracking-wider font-bold">huidig</span>
                    )}
                  </button>
                ))}
              </div>

              {actionFor.uid !== currentUser?.uid && (
                <button
                  onClick={() => removeStaff(actionFor.uid)}
                  className="mt-5 w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/[0.07] border border-red-500/20 text-red-300 hover:bg-red-500/15 transition-colors text-[13px] font-medium"
                >
                  <Trash2 className="h-4 w-4" />
                  Verwijder medewerker
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

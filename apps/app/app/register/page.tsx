"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { StaffShell } from "@/components/StaffShell";
import { CheckCircle2, ArrowRight, User, Mail, Lock, Shield } from "lucide-react";
import { cn } from "@eufraat/ui";

const ROLES = [
  { id: "owner",    label: "Owner",    desc: "Volledige toegang tot alles" },
  { id: "manager",  label: "Manager",  desc: "Orders, menu, openingstijden, klanten" },
  { id: "kitchen",  label: "Keuken",   desc: "Alleen orderscherm + status updates" },
  { id: "cashier",  label: "Kassa",    desc: "Orders + handmatig invoeren" },
  { id: "bezorger", label: "Bezorger", desc: "Bezorg-app met live GPS" },
] as const;

type Role = typeof ROLES[number]["id"];

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [role, setRole] = React.useState<Role>("manager");
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth(), email, password);
      await setDoc(doc(db(), "staff", cred.user.uid), {
        displayName: displayName.trim() || "Medewerker",
        email,
        role,
        createdAt: serverTimestamp(),
      });
      setDone(true);
      setTimeout(() => router.replace("/personeel"), 1800);
    } catch (e: unknown) {
      const msg = (e as { code?: string }).code;
      if (msg === "auth/email-already-in-use") setErr("E-mailadres is al in gebruik.");
      else if (msg === "auth/weak-password") setErr("Wachtwoord moet minimaal 6 tekens zijn.");
      else setErr("Registratie mislukt — probeer opnieuw.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <StaffShell title="Account aangemaakt" requireRole={["owner", "manager"]}>
        <div className="px-4 py-12">
          <div className="bg-card/40 border border-emerald-400/30 rounded-3xl p-8 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 mb-4">
              <CheckCircle2 className="h-7 w-7 text-emerald-300" />
            </div>
            <h2 className="font-display text-2xl italic text-cream mb-2">Account aangemaakt!</h2>
            <p className="text-[13px] text-cream/55">Wordt doorgestuurd naar Personeel…</p>
          </div>
        </div>
      </StaffShell>
    );
  }

  return (
    <StaffShell title="Nieuwe medewerker" subtitle="Maak een staff-account aan" requireRole={["owner", "manager"]}>
      <form onSubmit={submit} className="px-4 space-y-4">

        <Field icon={<User className="h-4 w-4" />} label="Naam" value={displayName} onChange={setDisplayName} placeholder="Voor- en achternaam" required />
        <Field icon={<Mail className="h-4 w-4" />} label="E-mail" type="email" value={email} onChange={setEmail} placeholder="naam@voorbeeld.nl" required />
        <Field icon={<Lock className="h-4 w-4" />} label="Wachtwoord" type="password" value={password} onChange={setPassword} placeholder="Min. 6 tekens" required minLength={6} />

        <div>
          <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/60 mb-2">
            <Shield className="h-3 w-3" />
            Rol
          </label>
          <div className="space-y-2">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-2xl border transition-all active:scale-[0.99]",
                  role === r.id
                    ? "bg-gold/10 border-gold/50"
                    : "bg-white/[0.03] border-white/[0.07] hover:border-white/20",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={cn("text-[14px] font-semibold", role === r.id ? "text-gold" : "text-cream")}>{r.label}</p>
                    <p className="text-[11px] text-cream/50 mt-0.5">{r.desc}</p>
                  </div>
                  <span className={cn(
                    "h-4 w-4 rounded-full border-2 shrink-0 transition-all",
                    role === r.id ? "border-gold bg-gold" : "border-white/25",
                  )} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {err && (
          <p className="text-[12px] text-red-400 bg-red-400/[0.07] border border-red-400/20 rounded-xl px-4 py-3">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full flex items-center justify-between h-13 bg-gold text-ink rounded-2xl px-5 font-semibold text-[14px] hover:bg-gold-soft active:scale-[0.99] transition-all disabled:opacity-50 mt-2"
        >
          {busy ? "Account aanmaken…" : "Account aanmaken"}
          {!busy && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </StaffShell>
  );
}

function Field({ icon, label, value, onChange, type = "text", placeholder, required, minLength }: {
  icon: React.ReactNode;
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; minLength?: number;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/60 mb-2">
        {icon} {label}
      </label>
      <input
        type={type}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-[14px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/60 focus:bg-white/[0.06] transition-colors"
      />
    </div>
  );
}

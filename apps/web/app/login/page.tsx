"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, User, Mail, Lock } from "lucide-react";
import { loginWithEmail, registerWithEmail, useCustomerAuth } from "@/lib/useCustomerAuth";
import { restaurant } from "@/data/restaurant";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useCustomerAuth();
  const [tab, setTab] = React.useState<"login" | "register">("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Redirect if already logged in
  React.useEffect(() => {
    if (!loading && user) router.replace("/account");
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (tab === "login") {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) throw new Error("Vul je naam in.");
        if (password.length < 6) throw new Error("Wachtwoord moet minimaal 6 tekens zijn.");
        await registerWithEmail(email, password, name.trim());
      }
      router.replace("/account");
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? "Er ging iets mis.";
      if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setError("E-mailadres of wachtwoord klopt niet.");
      } else if (msg.includes("email-already-in-use")) {
        setError("Dit e-mailadres is al in gebruik. Probeer in te loggen.");
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center px-5 pt-20 pb-28 lg:pt-0 lg:pb-0">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-card ring-1 ring-gold/30 overflow-hidden mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={restaurant.logo} alt="Eufraat" className="h-10 w-10 object-contain" />
          </span>
          <h1 className="font-display text-3xl font-medium italic text-cream tracking-[-0.02em]">
            {tab === "login" ? "Welkom terug." : "Account aanmaken."}
          </h1>
          <p className="text-[13px] text-cream/55 mt-1.5 text-center">
            {tab === "login"
              ? "Log in om je bestellingen te bekijken."
              : "Maak een account aan en sla je punten op."}
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex rounded-2xl bg-line/[0.04] border border-line/[0.07] p-1 mb-6">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); }}
              className={`flex-1 h-9 rounded-xl text-[13px] font-semibold transition-all ${
                tab === t ? "bg-gold text-ink" : "text-cream/55 hover:text-cream"
              }`}
            >
              {t === "login" ? "Inloggen" : "Registreren"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === "register" && (
            <FormField icon={<User className="h-4 w-4" />} placeholder="Je naam" type="text" value={name} onChange={setName} required />
          )}
          <FormField icon={<Mail className="h-4 w-4" />} placeholder="E-mailadres" type="email" value={email} onChange={setEmail} required />
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/35">
              <Lock className="h-4 w-4" />
            </span>
            <input
              type={showPw ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wachtwoord"
              className="w-full bg-line/[0.04] border border-line/[0.08] rounded-2xl pl-11 pr-11 py-3.5 text-[14px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/60 focus:bg-line/[0.06] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/35 hover:text-cream/70 transition-colors"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <p className="text-[12px] text-red-400 bg-red-400/[0.07] border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-between h-13 bg-gold text-ink rounded-2xl px-5 font-semibold text-[14px] hover:bg-gold-soft active:scale-[0.99] transition-all disabled:opacity-50 mt-2"
          >
            {busy ? "Even geduld…" : tab === "login" ? "Inloggen" : "Account aanmaken"}
            {!busy && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-cream/35">
          Door in te loggen ga je akkoord met onze voorwaarden.
        </p>
      </div>
    </div>
  );
}

function FormField({ icon, placeholder, type, value, onChange, required }: {
  icon: React.ReactNode;
  placeholder: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/35">{icon}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-line/[0.04] border border-line/[0.08] rounded-2xl pl-11 pr-4 py-3.5 text-[14px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/60 focus:bg-line/[0.06] transition-colors"
      />
    </div>
  );
}

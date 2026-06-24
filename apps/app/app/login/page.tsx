"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ArrowRight, Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth(), email, password);
      router.replace("/orders");
    } catch {
      setErr("Inloggen mislukt — controleer je gegevens.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 bg-ink"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-card ring-1 ring-gold/30 overflow-hidden mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <span className="font-bold text-xl text-gold italic">BG</span>
          </span>
          <h1 className="text-2xl font-semibold text-cream tracking-tight">Broodje Gebrook Staff</h1>
          <p className="text-[13px] text-cream/55 mt-1.5">Log in om bestellingen te beheren.</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/35">
              <Mail className="h-4 w-4" />
            </span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mailadres"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-11 pr-4 py-3.5 text-[14px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/60 focus:bg-white/[0.06] transition-colors"
            />
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/35">
              <Lock className="h-4 w-4" />
            </span>
            <input
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wachtwoord"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-11 pr-11 py-3.5 text-[14px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/60 focus:bg-white/[0.06] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/35 hover:text-cream/70"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
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
            {busy ? "Inloggen…" : "Inloggen"}
            {!busy && <ArrowRight className="h-4 w-4" />}
          </button>

          <Link
            href="/register"
            className="block text-center text-[12px] text-cream/50 hover:text-gold transition-colors pt-4"
          >
            Nog geen account? Registreer hier
          </Link>
        </form>
      </div>
    </div>
  );
}

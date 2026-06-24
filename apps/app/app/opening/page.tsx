"use client";
import * as React from "react";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { db, RESTAURANT_ID } from "@/lib/firebase";
import { StaffShell } from "@/components/StaffShell";
import { Pause, Power, Play, Save, Edit3 } from "lucide-react";
import { cn } from "@eufraat/ui";

type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
type Service = "delivery" | "pickup";

interface Window { open: string; close: string }
type DayWindow = Window | null;
type ServiceHours = Record<DayKey, DayWindow>;

const DAY_LABELS: Record<DayKey, string> = {
  monday: "Maandag", tuesday: "Dinsdag", wednesday: "Woensdag",
  thursday: "Donderdag", friday: "Vrijdag", saturday: "Zaterdag", sunday: "Zondag",
};
const DAY_ORDER: DayKey[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const DEFAULT_HOURS: { delivery: ServiceHours; pickup: ServiceHours } = {
  delivery: {
    monday:    { open: "16:00", close: "00:45" },
    tuesday:   null,
    wednesday: { open: "16:00", close: "00:45" },
    thursday:  { open: "16:00", close: "00:45" },
    friday:    { open: "16:00", close: "00:45" },
    saturday:  { open: "16:00", close: "00:45" },
    sunday:    { open: "16:00", close: "00:45" },
  },
  pickup: {
    monday:    { open: "15:30", close: "00:50" },
    tuesday:   null,
    wednesday: { open: "15:30", close: "00:50" },
    thursday:  { open: "15:30", close: "00:50" },
    friday:    { open: "15:30", close: "00:50" },
    saturday:  { open: "15:30", close: "00:50" },
    sunday:    { open: "15:30", close: "00:50" },
  },
};

export default function OpeningPage() {
  const [pauseUntil, setPauseUntil] = React.useState<Date | null>(null);
  const [hours, setHours] = React.useState<{ delivery: ServiceHours; pickup: ServiceHours }>(DEFAULT_HOURS);
  const [busy, setBusy] = React.useState(false);
  const [activeService, setActiveService] = React.useState<Service>("pickup");
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    const ref = doc(db(), "restaurants", RESTAURANT_ID);
    const unsub = onSnapshot(ref, (s) => {
      if (!s.exists()) return;
      const data = s.data() as any;
      if (data?.pauseUntil) {
        const d = data.pauseUntil?.seconds
          ? new Date(data.pauseUntil.seconds * 1000)
          : new Date(data.pauseUntil);
        setPauseUntil(d > new Date() ? d : null);
      } else {
        setPauseUntil(null);
      }
      if (data?.openingHours && !dirty) {
        setHours({
          delivery: { ...DEFAULT_HOURS.delivery, ...(data.openingHours.delivery ?? {}) },
          pickup: { ...DEFAULT_HOURS.pickup, ...(data.openingHours.pickup ?? {}) },
        });
      }
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pause = async (minutes: number | null) => {
    setBusy(true);
    try {
      const until = minutes ? new Date(Date.now() + minutes * 60_000) : null;
      await setDoc(doc(db(), "restaurants", RESTAURANT_ID), { pauseUntil: until }, { merge: true });
    } finally { setBusy(false); }
  };

  const closeToday = async () => {
    setBusy(true);
    try {
      const tomorrow = new Date();
      tomorrow.setHours(6, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      await setDoc(doc(db(), "restaurants", RESTAURANT_ID), { pauseUntil: tomorrow }, { merge: true });
    } finally { setBusy(false); }
  };

  const updateDay = (service: Service, day: DayKey, window: DayWindow) => {
    setHours((prev) => ({
      ...prev,
      [service]: { ...prev[service], [day]: window },
    }));
    setDirty(true);
  };

  const saveHours = async () => {
    setBusy(true);
    try {
      await setDoc(
        doc(db(), "restaurants", RESTAURANT_ID),
        { openingHours: hours },
        { merge: true },
      );
      setDirty(false);
    } finally { setBusy(false); }
  };

  return (
    <StaffShell title="Openingstijden" subtitle="Pauze & uren" requireRole={["owner", "manager"]}>

      {/* Pause card */}
      <section className="px-4 mb-5">
        {pauseUntil ? (
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-3xl p-5">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/20 mb-3">
              <Pause className="h-6 w-6 text-amber-300" />
            </div>
            <h2 className="font-display text-2xl text-amber-100 italic mb-1">Gepauzeerd</h2>
            <p className="text-[13px] text-amber-200/80 mb-5">
              Tot {pauseUntil.toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
            <button
              onClick={() => pause(null)}
              disabled={busy}
              className="w-full h-12 rounded-2xl bg-amber-400 text-ink font-semibold hover:bg-amber-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Play className="h-4 w-4" />
              Hervatten
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-cream/45 mb-3 px-1">Nood-pauze</h2>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[15, 30, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => pause(m)}
                  disabled={busy}
                  className="bg-card/60 hover:bg-amber-500/15 hover:border-amber-400/40 border border-white/[0.07] text-cream rounded-2xl h-14 text-[14px] font-semibold transition-colors active:scale-[0.98] flex flex-col items-center justify-center gap-0.5"
                >
                  <span className="font-display text-lg">{m}</span>
                  <span className="text-[10px] text-cream/55">minuten</span>
                </button>
              ))}
            </div>
            <button
              onClick={closeToday}
              disabled={busy}
              className="w-full bg-card/60 hover:bg-red-500/15 hover:border-red-400/40 border border-white/[0.07] text-cream rounded-2xl h-12 text-[13px] font-medium transition-colors active:scale-[0.98] inline-flex items-center justify-center gap-2"
            >
              <Power className="h-4 w-4" />
              Sluit voor vandaag
            </button>
          </>
        )}
      </section>

      {/* Hours editor */}
      <section className="px-4 mb-5">
        <div className="flex items-baseline justify-between mb-3 px-1">
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-cream/45 flex items-center gap-2">
            <Edit3 className="h-3 w-3" />
            Reguliere tijden
          </h2>
          {dirty && (
            <button
              onClick={saveHours}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold text-ink text-[11px] font-bold hover:bg-gold-soft transition-colors disabled:opacity-50"
            >
              <Save className="h-3 w-3" />
              {busy ? "Opslaan…" : "Opslaan"}
            </button>
          )}
        </div>

        {/* Service tabs */}
        <div className="flex gap-1.5 bg-card/40 border border-white/[0.06] rounded-2xl p-1 mb-3">
          {(["pickup", "delivery"] as Service[]).map((s) => (
            <button
              key={s}
              onClick={() => setActiveService(s)}
              className={cn(
                "flex-1 h-9 rounded-xl text-[12px] font-semibold transition-all",
                activeService === s ? "bg-gold text-ink" : "text-cream/55",
              )}
            >
              {s === "pickup" ? "Afhalen" : "Bezorgen"}
            </button>
          ))}
        </div>

        {/* Day editor list */}
        <div className="bg-card/40 border border-white/[0.06] rounded-2xl divide-y divide-white/[0.05]">
          {DAY_ORDER.map((day) => (
            <DayRow
              key={day}
              day={day}
              window={hours[activeService][day]}
              onChange={(w) => updateDay(activeService, day, w)}
            />
          ))}
        </div>

        <p className="mt-3 text-[10px] text-cream/40 px-1 leading-relaxed">
          Sluittijden na middernacht zijn ondersteund (bijv. 16:00 — 00:45 = bezorging tot kwart voor 1 's nachts).
        </p>
      </section>

    </StaffShell>
  );
}

function DayRow({
  day, window, onChange,
}: {
  day: DayKey;
  window: DayWindow;
  onChange: (w: DayWindow) => void;
}) {
  const isOpen = window !== null;
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <span className="text-[13px] font-medium text-cream w-24 shrink-0">
        {DAY_LABELS[day]}
      </span>

      {isOpen ? (
        <>
          <input
            type="time"
            value={window.open}
            onChange={(e) => onChange({ ...window, open: e.target.value })}
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1.5 text-[13px] text-cream focus:outline-none focus:border-gold/60 w-24"
          />
          <span className="text-cream/30">—</span>
          <input
            type="time"
            value={window.close}
            onChange={(e) => onChange({ ...window, close: e.target.value })}
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1.5 text-[13px] text-cream focus:outline-none focus:border-gold/60 w-24"
          />
          <button
            onClick={() => onChange(null)}
            className="ml-auto text-[10px] uppercase tracking-wider font-bold text-red-300/70 hover:text-red-300"
          >
            Sluit
          </button>
        </>
      ) : (
        <>
          <span className="text-[12px] italic text-cream/35 flex-1">Gesloten</span>
          <button
            onClick={() => onChange({ open: "16:00", close: "23:00" })}
            className="text-[10px] uppercase tracking-wider font-bold text-gold/70 hover:text-gold"
          >
            Open
          </button>
        </>
      )}
    </div>
  );
}

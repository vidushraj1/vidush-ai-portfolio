import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import p from "../data/profile.json";

const SCRIPT = import.meta.env.PUBLIC_APPS_SCRIPT_URL as string | undefined;
const B = import.meta.env.BASE_URL.replace(/\/?$/, "/");
const pad = (n: number) => String(n).padStart(2, "0");
type Step = "pick" | "details" | "done";

export default function BookingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("pick");
  const [slots, setSlots] = useState<string[] | null>(null);
  const [err, setErr] = useState("");
  const [tz, setTz] = useState("UTC");
  const [h12, setH12] = useState(false);
  const [ym, setYm] = useState<[number, number] | null>(null);
  const [day, setDay] = useState("");
  const [chosen, setChosen] = useState("");
  const [busy, setBusy] = useState(false);
  const [meet, setMeet] = useState("");
  const [noPhoto, setNoPhoto] = useState(false);

  useEffect(() => {
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const h = () => setOpen(true);
    window.addEventListener("open-booking", h);
    return () => window.removeEventListener("open-booking", h);
  }, []);

  const load = () => {
    if (!SCRIPT) return;
    setErr("");
    fetch(`${SCRIPT}?action=availability`).then((r) => r.json())
      .then((j) => { if (!j.ok) throw new Error(); setSlots(j.slots); })
      .catch(() => setErr("Couldn't load availability. Please email me instead."));
  };
  const close = () => { setOpen(false); setTimeout(() => { setStep("pick"); setChosen(""); setErr(""); }, 250); };

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", k);
    if (!slots) load();
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", k); };
  }, [open]);

  const key = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
  const byDay = useMemo(() => {
    const m: Record<string, string[]> = {};
    (slots || []).forEach((s) => { const k = key(s); (m[k] = m[k] || []).push(s); });
    return m;
  }, [slots, tz]);
  const days = Object.keys(byDay).sort();

  useEffect(() => { // jump to the first available day
    if (days.length && !day) { setDay(days[0]); const [y, m] = days[0].split("-").map(Number); setYm([y, m - 1]); }
  }, [days.length]);
  useEffect(() => { setDay(""); }, [tz]);

  const time = (iso: string) => new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: h12 ? "numeric" : "2-digit", minute: "2-digit", hour12: h12 }).format(new Date(iso));
  const long = (iso: string) => new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date(iso));

  const zones: string[] = useMemo(() => {
    const all = ((Intl as any).supportedValuesOf?.("timeZone") as string[]) || [];
    return all.includes(tz) ? all : [tz, ...all];
  }, [tz]);

  const cells = useMemo(() => {
    if (!ym) return [];
    const [y, m] = ym;
    const lead = new Date(Date.UTC(y, m, 1)).getUTCDay(), dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    return [...Array(lead).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
  }, [ym]);
  const monthKey = (y: number, m: number) => y * 12 + m;
  const first = days[0]?.split("-").map(Number), last = days[days.length - 1]?.split("-").map(Number);
  const canPrev = ym && first && monthKey(ym[0], ym[1]) > monthKey(first[0], first[1] - 1);
  const canNext = ym && last && monthKey(ym[0], ym[1]) < monthKey(last[0], last[1] - 1);
  const shift = (n: number) => ym && setYm(((d) => [d.getUTCFullYear(), d.getUTCMonth()] as [number, number])(new Date(Date.UTC(ym[0], ym[1] + n, 1))));

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true); setErr("");
    try {
      const r = await fetch(SCRIPT!, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ ...f, type: "book", slot: chosen, tz }) });
      const j = await r.json();
      if (j.ok) { setMeet(j.meet || ""); setStep("done"); setSlots(null); }
      else if (j.error === "slot_taken") { setErr("Sorry, that time was just taken. Please pick another."); setStep("pick"); load(); }
      else if (j.error === "slow_down") setErr("Please wait a minute before booking again.");
      else setErr("Something went wrong. Please check your details or email me.");
    } catch { setErr("Couldn't reach the booking service. Please email me instead."); }
    setBusy(false);
  }

  const sel = "border border-[var(--ln)] bg-[var(--bg)] text-[var(--tx)]";
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Book a meeting">
          <div className="fixed inset-0 bg-black/65 backdrop-blur-sm" onClick={close} />
          <motion.div initial={{ opacity: 0, y: 30, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: .97 }} transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl border md:grid-cols-[250px_1fr] lg:grid-cols-[250px_1fr_230px]" style={{ background: "var(--s)", borderColor: "var(--ln)", boxShadow: "0 40px 120px -30px var(--ac)" }}>
            <button onClick={close} aria-label="Close" className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full border text-lg" style={{ borderColor: "var(--ln)", background: "var(--s2)" }}>✕</button>

            {/* left: who + details */}
            <div className="border-b p-6 md:border-b-0 md:border-r" style={{ borderColor: "var(--ln)" }}>
              <div className="mb-3 size-12 overflow-hidden rounded-full border" style={{ borderColor: "var(--ln)", background: "var(--s2)" }}>
                {noPhoto ? <div className="grid h-full place-items-center font-bold" style={{ color: "var(--ac)" }}>VS</div> : <img src={`${B}profile.jpg`} alt="" className="h-full w-full object-cover" onError={() => setNoPhoto(true)} />}
              </div>
              <p className="text-sm" style={{ color: "var(--mu)" }}>{p.name}</p>
              <h3 className="mt-1 text-2xl font-bold">Meet with Vidush</h3>
              <ul className="mt-4 space-y-2 text-sm" style={{ color: "var(--mu)" }}>
                <li>◷ 30 min</li><li>▣ Google Meet</li>
                <li><label className="sr-only" htmlFor="tz">Time zone</label>
                  <select id="tz" value={tz} onChange={(e) => setTz(e.target.value)} className={`${sel} w-full rounded-lg px-2 py-1.5 text-xs`}>
                    {zones.map((z) => <option key={z}>{z}</option>)}
                  </select></li>
              </ul>
              {step !== "pick" && chosen && <p className="mt-5 rounded-lg border p-3 text-sm" style={{ borderColor: "var(--ln)", background: "var(--s2)" }}>{long(chosen)}<br /><b>{time(chosen)}</b></p>}
            </div>

            {!SCRIPT ? <p className="p-8 md:col-span-2" style={{ color: "var(--mu)" }}>Booking isn't configured yet (PUBLIC_APPS_SCRIPT_URL is missing). Please email {p.email}.</p>
            : step === "done" ? (
              <div className="grid place-items-center p-10 text-center md:col-span-2">
                <div>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="mx-auto mb-4 grid size-16 place-items-center rounded-full text-3xl text-white" style={{ background: "var(--ac)" }}>✓</motion.div>
                  <h3 className="text-2xl font-bold">You're booked</h3>
                  <p className="mt-2" style={{ color: "var(--mu)" }}>{long(chosen)} at {time(chosen)}<br />A Google Calendar invite{meet && " with a Google Meet link"} is on its way to your email.</p>
                  {meet && <a href={meet} target="_blank" rel="noopener" className="btn mt-5">Open Meet link ↗</a>}
                  <button onClick={close} className="btn btn-p ml-2 mt-5">Done</button>
                </div>
              </div>
            ) : step === "details" ? (
              <form onSubmit={submit} className="p-6 md:col-span-2 md:p-10">
                <button type="button" onClick={() => setStep("pick")} className="mb-4 text-sm" style={{ color: "var(--mu)" }}>← Back</button>
                <h3 className="mb-5 text-xl font-semibold">Your details</h3>
                <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                <input name="name" required maxLength={80} placeholder="Your name" className="field" />
                <input name="email" type="email" required placeholder="Your email (the invite goes here)" className="field" />
                <textarea name="notes" rows={4} maxLength={1000} placeholder="What would you like to discuss? (optional)" className="field" />
                {err && <p className="mb-3 text-sm text-red-400">{err}</p>}
                <button className="btn btn-p w-full justify-center" disabled={busy}>{busy ? "Booking…" : "Confirm booking"}</button>
              </form>
            ) : (
              <>
                {/* middle: calendar */}
                <div className="p-6">
                  {!slots && !err && <p className="py-20 text-center" style={{ color: "var(--mu)" }}>Loading availability…</p>}
                  {err && <p className="mb-3 text-sm text-red-400">{err}</p>}
                  {slots && ym && (
                    <>
                      <div className="mb-4 flex items-center justify-between pr-10 lg:pr-0">
                        <h4 className="text-lg font-semibold">{new Date(Date.UTC(ym[0], ym[1], 1)).toLocaleString("en-US", { month: "long", timeZone: "UTC" })} <span style={{ color: "var(--mu)" }}>{ym[0]}</span></h4>
                        <div className="flex gap-1">
                          <button disabled={!canPrev} onClick={() => shift(-1)} aria-label="Previous month" className="btn !px-3 !py-1 disabled:opacity-30">‹</button>
                          <button disabled={!canNext} onClick={() => shift(1)} aria-label="Next month" className="btn !px-3 !py-1 disabled:opacity-30">›</button>
                        </div>
                      </div>
                      <div className="mono mb-2 grid grid-cols-7 gap-1.5 text-center text-xs" style={{ color: "var(--mu)" }}>{["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => <span key={d}>{d}</span>)}</div>
                      <div className="grid grid-cols-7 gap-1.5">
                        {cells.map((d, i) => {
                          if (!d) return <span key={i} />;
                          const k = `${ym[0]}-${pad(ym[1] + 1)}-${pad(d)}`, ok = !!byDay[k], on = day === k;
                          return <button key={i} disabled={!ok} onClick={() => setDay(k)} aria-pressed={on} className="aspect-square rounded-lg text-sm font-semibold transition disabled:cursor-default disabled:font-normal"
                            style={{ background: on ? "var(--ac)" : ok ? "var(--s2)" : "transparent", color: on ? "#fff" : ok ? "var(--tx)" : "var(--mu)", opacity: ok ? 1 : .45 }}>{d}</button>;
                        })}
                      </div>
                    </>
                  )}
                </div>
                {/* right: times */}
                <div className="border-t p-6 md:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0" style={{ borderColor: "var(--ln)" }}>
                  {day && byDay[day] && (
                    <>
                      <div className="mb-3 flex items-center justify-between lg:pr-10">
                        <b>{new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", day: "numeric" }).format(new Date(byDay[day][0]))}</b>
                        <div className="flex overflow-hidden rounded-lg border text-xs" style={{ borderColor: "var(--ln)" }}>
                          {[false, true].map((v) => <button key={String(v)} onClick={() => setH12(v)} className="px-2 py-1" style={{ background: h12 === v ? "var(--s2)" : "transparent" }}>{v ? "12h" : "24h"}</button>)}
                        </div>
                      </div>
                      <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1 lg:max-h-[22rem]">
                        {byDay[day].map((s, i) => (
                          <motion.button key={s} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .02 }} onClick={() => { setChosen(s); setStep("details"); setErr(""); }}
                            className="rounded-lg border py-2.5 font-medium transition hover:border-[var(--ac)] hover:bg-[var(--s2)]" style={{ borderColor: "var(--ln)" }}>{time(s)}</motion.button>
                        ))}
                      </div>
                    </>
                  )}
                  {slots && days.length === 0 && <p style={{ color: "var(--mu)" }}>No free times right now. Please email me.</p>}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
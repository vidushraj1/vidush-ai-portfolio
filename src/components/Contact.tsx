import { useState } from "react";
import Section from "./Section";
import p from "../data/profile.json";

const SCRIPT = import.meta.env.PUBLIC_APPS_SCRIPT_URL as string | undefined;
export const openBooking = () => window.dispatchEvent(new Event("open-booking"));

export default function Contact() {
  const [st, setSt] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = Object.fromEntries(new FormData(form));
    if (!SCRIPT) { location.href = `mailto:${p.email}?subject=${encodeURIComponent(String(d.topic))}&body=${encodeURIComponent(String(d.message))}`; return; }
    setSt("sending");
    try {
      await fetch(SCRIPT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(d) });
      setSt("sent"); form.reset();
    } catch { setSt("error"); }
  }
  return (
    <Section id="contact" kicker="contact" title="Book a call or ask me anything">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card flex flex-col justify-between p-6">
          <div>
            <h3 className="mb-2 text-lg font-semibold">Schedule a meeting</h3>
            <p className="mb-5 text-sm" style={{ color: "var(--mu)" }}>Pick a free slot straight from my Google Calendar. You'll get a calendar invite with a Google Meet link.</p>
            <ul className="mono space-y-2 text-sm" style={{ color: "var(--mu)" }}>
              <li>◷ 30 minutes</li><li>▣ Google Meet</li><li>◍ Times shown in your time zone</li>
            </ul>
          </div>
          <button onClick={openBooking} className="btn btn-p mt-8 justify-center">Pick a time</button>
        </div>
        <form onSubmit={send} className="card p-6">
          <h3 className="mb-4 font-semibold">Message me or ask me about my work</h3>
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <input name="name" required placeholder="Your name" className="field" />
          <input name="email" type="email" required placeholder="Your email" className="field" />
          <select name="topic" className="field"><option>Question about the portfolio</option><option>Job opportunity</option><option>Consulting / project</option><option>Something else</option></select>
          <textarea name="message" required rows={6} placeholder="What would you like to know?" className="field" />
          <button className="btn btn-p w-full justify-center" disabled={st === "sending"}>{st === "sending" ? "Sending…" : "Send message"}</button>
          {st === "sent" && <p className="mt-3 text-sm text-emerald-400">Sent. I'll reply to your email soon.</p>}
          {st === "error" && <p className="mt-3 text-sm text-red-400">Couldn't send. Please email {p.email}.</p>}
        </form>
      </div>
    </Section>
  );
}
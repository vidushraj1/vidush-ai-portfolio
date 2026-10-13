import Section from "./Section";
import p from "../data/profile.json";
export default function About() {
  return (
    <Section id="about" kicker="about" title="Production AI, end to end">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card space-y-4 p-7 text-lg lg:col-span-3" style={{ color: "var(--mu)" }}>
          {p.summary.map((s, i) => <p key={i}>{s}</p>)}
        </div>
        {p.skills.map((g) => (
          <div key={g.group} className="card p-6">
            <h3 className="mb-4 font-semibold">{g.group}</h3>
            <div className="flex flex-wrap gap-2">{g.items.map((s) => <span key={s} className="chip">{s}</span>)}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

import { motion } from "framer-motion";
import Section from "./Section";
import p from "../data/profile.json";
export default function Experience() {
  return (
    <Section id="experience" kicker="experience" title="Where I've built">
      <div className="relative ml-1 space-y-6 border-l pl-5 sm:ml-2 sm:space-y-8 sm:pl-8" style={{ borderColor: "var(--ln)" }}>
        {p.experience.map((e, i) => (
          <motion.article key={e.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * .1 }} className="card relative p-4 sm:p-6">
            <span className="absolute -left-[1.85rem] top-6 size-3 rounded-full border-2 sm:-left-[2.55rem] sm:top-7" style={{ background: "var(--bg)", borderColor: "var(--ac)", boxShadow: "0 0 12px var(--ac)" }} />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold sm:text-xl">{e.role}</h3><span className="mono text-xs" style={{ color: "var(--mu)" }}>{e.period}</span>
            </div>
            <p className="mb-3" style={{ color: "var(--ac2)" }}>{e.company}</p>
            <ul className="list-disc space-y-1.5 pl-5" style={{ color: "var(--mu)" }}>{e.points.map((x, k) => <li key={k}>{x}</li>)}</ul>
          </motion.article>
        ))}
      </div>
      <h3 className="mb-4 mt-10 text-xl font-semibold sm:mt-16 sm:text-2xl">Education</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {p.education.map((d) => (
          <div key={d.id} className="card p-4 sm:p-6">
            <span className="mono text-xs" style={{ color: "var(--mu)" }}>{d.period}</span>
            <h4 className="mt-1 text-lg font-semibold">{d.degree} <span style={{ color: "var(--ac2)" }}>· {d.honours}</span></h4>
            <p style={{ color: "var(--mu)" }}>{d.school}</p><p className="mt-1 text-sm" style={{ color: "var(--mu)" }}>{d.note}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

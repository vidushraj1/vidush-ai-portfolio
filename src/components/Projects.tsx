import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Section from "./Section";
import p from "../data/profile.json";

const B = import.meta.env.BASE_URL.replace(/\/?$/, "/");
const tabs = [["all", "All"], ["ai", "AI & ML"], ["fullstack", "Full-stack"]];
type Project = (typeof p.projects)[number] & { image?: string };

// Shows the project's screenshot if it has one (and the file loads), otherwise a patterned header.
function Cover({ x }: { x: Project }) {
  const [bad, setBad] = useState(false);
  if (x.image && !bad) {
    return <img src={`${B}${x.image}`} alt={`${x.title} screenshot`} loading="lazy" onError={() => setBad(true)} className="aspect-[16/10] w-full border-b object-cover object-top" style={{ borderColor: "var(--ln)" }} />;
  }
  return (
    <div className="mono flex h-24 items-end justify-between border-b p-4 text-xs" style={{ borderColor: "var(--ln)", color: "var(--mu)", background: `repeating-linear-gradient(${x.category === "ai" ? "90deg" : "135deg"},transparent 0 11px,var(--glow) 11px 12px),var(--s2)` }}>
      <span>{x.category === "ai" ? "ai · ml" : "full-stack"}</span><span>#{x.id}</span>
    </div>
  );
}

export default function Projects() {
  const [f, setF] = useState("all");
  const list = (p.projects as Project[]).filter((x) => f === "all" || x.category === f);
  return (
    <Section id="projects" kicker="projects" title="Selected work">
      <div className="mb-6 flex flex-wrap gap-2 sm:mb-8">
        {tabs.map(([k, l]) => <button key={k} onClick={() => setF(k)} aria-pressed={f === k} className="btn !py-1.5 !text-sm" style={f === k ? { background: "var(--tx)", color: "var(--bg)" } : {}}>{l}</button>)}
      </div>
      <motion.div layout className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((x) => (
            <motion.article layout key={x.id} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .96 }} className="card flex flex-col">
              <Cover x={x} />
              <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
                <h3 className="text-lg font-semibold">{x.title}</h3>
                <p className="flex-1 text-sm" style={{ color: "var(--mu)" }}>{x.description}</p>
                <div className="flex flex-wrap gap-1.5">{x.tech.map((t) => <span key={t} className="chip">{t}</span>)}</div>
                <div className="flex gap-2 pt-1">
                  {x.demo && <a href={x.demo} target="_blank" rel="noopener" className="btn btn-p !py-2 !text-sm">Live demo</a>}
                  {x.repo && <a href={x.repo} target="_blank" rel="noopener" className="btn !py-2 !text-sm">Code</a>}
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </Section>
  );
}
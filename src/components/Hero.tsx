import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Portrait from "./Portrait";
import p from "../data/profile.json";

const B = import.meta.env.BASE_URL.replace(/\/?$/, "/"); // always ends with /
function useTyped(words: string[]) {
  const [t, setT] = useState("");
  useEffect(() => {
    let i = 0, j = 0, del = false, id = 0;
    const tick = () => {
      const w = words[i]; j += del ? -1 : 1; setT(w.slice(0, j));
      let d = del ? 28 : 60;
      if (!del && j === w.length) { del = true; d = 1500; } else if (del && j === 0) { del = false; i = (i + 1) % words.length; d = 300; }
      id = window.setTimeout(tick, d);
    };
    tick(); return () => clearTimeout(id);
  }, []);
  return t;
}
export default function Hero() {
  const typed = useTyped(p.roles);
  return (
    <section id="top" className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-14 px-6 py-16 md:grid-cols-[1.3fr_1fr]">
      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <span className="mono mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs" style={{ borderColor: "var(--ln)", color: "var(--mu)" }}>
          <span className="size-2 animate-pulse rounded-full bg-emerald-400" /> Online · Open to any AI roles and Project consultation
        </span>
        <h1 className="text-5xl font-bold tracking-tight md:text-7xl">{p.name}</h1>
        <p className="mono mt-5 h-8 text-lg md:text-xl" style={{ color: "var(--ac2)" }}>&gt; {typed}<span className="animate-pulse">▍</span></p>
        <p className="mt-5 max-w-xl text-lg" style={{ color: "var(--mu)" }}>{p.tagline}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#projects" className="btn btn-p">View projects</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event("open-booking")); }} className="btn">Schedule a meeting</a>
          <a href={`${B}CV.pdf`} target="_blank" rel="noopener" className="btn">Download CV ↓</a>
        </div>
        <div className="mt-10 flex flex-wrap gap-8">
          {p.stats.map(([a, b]) => (<div key={a}><b className="block text-2xl">{a}</b><span className="text-sm" style={{ color: "var(--mu)" }}>{b}</span></div>))}
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }}><Portrait /></motion.div>
    </section>
  );
}
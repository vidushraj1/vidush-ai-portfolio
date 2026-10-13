import { motion } from "framer-motion";
import type { ReactNode } from "react";
export default function Section({ id, kicker, title, children }: { id: string; kicker: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-24">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: .55 }}>
        <p className="mono mb-3 text-xs uppercase tracking-[.25em]" style={{ color: "var(--ac2)" }}>{`// ${kicker}`}</p>
        <h2 className="h2 mb-10">{title}</h2>
        {children}
      </motion.div>
    </section>
  );
}

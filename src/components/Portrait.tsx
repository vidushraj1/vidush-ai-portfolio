import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, useReducedMotion } from "framer-motion";
import p from "../data/profile.json";

const B = import.meta.env.BASE_URL.replace(/\/?$/, "/"); // always ends with /
const badges = [
  { t: "Claude", pos: "left-[2%] -top-10 md:left-[20%] md:-top-14", d: 0.4, z: 60 },
  { t: "AI Foundry", pos: "right-[2%] -top-5 md:right-[10%] md:-top-8", d: 0.8, z: 45 },
  { t: "Gemini", pos: "-left-10 top-4 md:-left-20 md:top-8", d: 0, z: 70 },
  { t: "Copilot", pos: "-right-10 top-16 md:-right-24 md:top-20", d: 1.2, z: 55 },
  { t: "MCP", pos: "-left-10 top-[40%] md:-left-24 md:top-[48%]", d: 1.6, z: 50 },
  { t: "RAG", pos: "-right-10 top-[62%] md:-right-16 md:top-[70%]", d: 2.0, z: 40 },
  { t: "ADK", pos: "left-[5%] -bottom-10 md:-bottom-20", d: 2.4, z: 65 },
  { t: "Vertex AI", pos: "right-[5%] -bottom-4 md:right-[25%] md:-bottom-5", d: 2.8, z: 60 }, 
];
const corners = [
  "-left-3 -top-3 border-l-2 border-t-2 rounded-tl-xl",
  "-right-3 -top-3 border-r-2 border-t-2 rounded-tr-xl",
  "-left-3 -bottom-3 border-l-2 border-b-2 rounded-bl-xl",
  "-right-3 -bottom-3 border-r-2 border-b-2 rounded-br-xl",
];

export default function Portrait() {
  const reduce = useReducedMotion();
  const [noPhoto, setNoPhoto] = useState(false);
  const img = useRef<HTMLImageElement>(null);

  // The <img> can fail before React hydrates, so onError never fires; check once on mount.
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setNoPhoto(true);
  }, []);

  const mx = useMotionValue(0.5), my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 140, damping: 18 }), sy = useSpring(my, { stiffness: 140, damping: 18 });
  const rotateY = useTransform(sx, [0, 1], [-13, 13]);
  const rotateX = useTransform(sy, [0, 1], [11, -11]);
  const gx = useTransform(sx, (v) => v * 100), gy = useTransform(sy, (v) => v * 100);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.24), transparent 55%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width); my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { mx.set(0.5); my.set(0.5); };

  return (
    <div className="mx-auto w-full max-w-[280px] sm:max-w-sm mt-12 md:mt-16" style={{ perspective: 1000 }} onPointerMove={onMove} onPointerLeave={onLeave}>
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
        <motion.div className="relative" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
          <motion.div aria-hidden className="absolute -inset-6 rounded-[2rem] blur-3xl" style={{ background: "var(--ac)", z: -40 }}
            animate={{ opacity: [0.18, 0.38, 0.18], scale: [1, 1.06, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border" style={{ background: "var(--s2)", borderColor: "var(--ln)" }}>
            {noPhoto
              ? <div className="grid h-full place-items-center text-7xl font-bold" style={{ color: "var(--ac)" }}>VS</div>
              : <img ref={img} src={`${B}profile.jpg`} alt={p.name} className="h-full w-full object-cover" onError={() => setNoPhoto(true)} />}
            <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glare }} />
            <div className="mono absolute inset-x-0 bottom-0 flex items-center gap-2 px-4 py-3 text-xs text-white" style={{ background: "linear-gradient(transparent,rgba(0,0,0,.72))" }}>
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />{p.title} · available
            </div>
          </div>
          {corners.map((c, i) => (
            <motion.span key={i} aria-hidden className={`absolute size-8 ${c}`} style={{ borderColor: "var(--ac2)", z: 30 }}
              initial={{ opacity: 0, scale: 1.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.12, type: "spring", stiffness: 260, damping: 18 }} />
          ))}
          {badges.map((b) => (
            <motion.span key={b.t} className={`mono absolute rounded-lg border px-2.5 py-1 text-xs backdrop-blur-md ${b.pos}`}
              style={{ background: "color-mix(in srgb,var(--s) 80%,transparent)", borderColor: "var(--ln)", color: "var(--ac2)", z: b.z }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, y: [0, -7, 0] }}
              transition={{ opacity: { delay: 0.9 + b.d * 0.15 }, scale: { delay: 0.9 + b.d * 0.15, type: "spring" }, y: { duration: 3.5, repeat: Infinity, delay: b.d, ease: "easeInOut" } }}>
              {b.t}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
      <p className="mono mt-16 text-center text-xs" style={{ color: "var(--mu)" }}>{p.location}</p>
    </div>
  );
}
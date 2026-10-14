import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import p from "../data/profile.json";

const links = ["about", "experience", "projects", "contact"];

export default function Nav() {
  const [dark, setDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ["top", ...links].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => { window.removeEventListener("scroll", onScroll); io.disconnect(); };
  }, []);

  const toggleTheme = () => {
    const d = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", d ? "dark" : "light");
    setDark(d);
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{
        borderColor: "var(--ln)",
        background: `color-mix(in srgb,var(--bg) ${scrolled ? 88 : 55}%,transparent)`,
        boxShadow: scrolled ? "0 12px 40px -22px var(--ac)" : "none",
      }}
    >
      <div className={`mx-auto flex max-w-6xl items-center gap-1 px-4 transition-all duration-300 sm:px-6 ${scrolled ? "h-14" : "h-16"}`}>
        <a href="#top" className="mono mr-auto flex items-center gap-2 font-medium">
          <motion.i
            className="size-2.5 rounded-sm"
            style={{ background: "var(--ac)" }}
            animate={{ boxShadow: ["0 0 4px var(--ac)", "0 0 16px var(--ac)", "0 0 4px var(--ac)"] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            whileHover={{ rotate: 90, scale: 1.3 }}
          />
          {p.name.split(" ")[0].toLowerCase()}.ai
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a key={l} href={`#${l}`} className="relative rounded-lg px-3 py-1.5 text-sm capitalize transition-colors" style={{ color: active === l ? "var(--tx)" : "var(--mu)" }}>
              {active === l && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-lg border" style={{ background: "var(--s2)", borderColor: "var(--ln)" }} transition={{ type: "spring", stiffness: 380, damping: 32 }} />
              )}
              <span className="relative">{l}</span>
            </a>
          ))}
        </div>

        <a href="#contact" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event("open-booking")); }} className="btn btn-p ml-2 hidden !py-2 sm:inline-flex">Book a call</a>

        <button onClick={toggleTheme} className="btn ml-1 !px-3 !py-2" aria-label="Toggle dark and light theme">
          <motion.span key={String(dark)} initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="inline-block">
            {dark ? "☀" : "☾"}
          </motion.span>
        </button>

        <button onClick={() => setOpen((o) => !o)} className="btn ml-1 !px-3 !py-2 md:hidden" aria-label="Open menu" aria-expanded={open}>
          <motion.span key={String(open)} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} className="inline-block">{open ? "✕" : "☰"}</motion.span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full border-b backdrop-blur-xl md:hidden"
            style={{ borderColor: "var(--ln)", background: "color-mix(in srgb,var(--bg) 94%,transparent)" }}
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {links.map((l, i) => (
                <motion.a key={l} href={`#${l}`} onClick={() => setOpen(false)} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="rounded-lg px-3 py-2.5 capitalize" style={{ background: active === l ? "var(--s2)" : "transparent" }}>
                  {l}
                </motion.a>
              ))}
              <a href="#contact" onClick={(e) => { e.preventDefault(); setOpen(false); window.dispatchEvent(new Event("open-booking")); }} className="btn btn-p mt-2 justify-center">Book a call</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="absolute bottom-0 left-0 h-[2px] w-full origin-left" style={{ scaleX: progress, background: "linear-gradient(90deg,var(--ac),var(--ac2))", boxShadow: "0 0 12px var(--ac)" }} />
    </motion.nav>
  );
}
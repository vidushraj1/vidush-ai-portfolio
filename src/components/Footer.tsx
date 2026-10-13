import p from "../data/profile.json";
export default function Footer() {
  return (
    <footer className="relative z-10 border-t py-10 text-center text-sm" style={{ borderColor: "var(--ln)", color: "var(--mu)" }}>
      <div className="mb-3 flex justify-center gap-6">
        <a href={p.links.github} target="_blank" rel="noopener">GitHub</a>
        <a href={p.links.linkedin} target="_blank" rel="noopener">LinkedIn</a>
        <a href={`mailto:${p.email}`}>Email</a>
      </div>
      © {new Date().getFullYear()} {p.name}
    </footer>
  );
}

// Usage: ANTHROPIC_API_KEY=... npm run sync-cv   (also runs in CI when public/CV.pdf changes)
// Reads the new CV PDF with Claude and MERGES it into src/data/profile.json:
// existing entries are kept, new ones appended, changed ones rewritten, links/demos preserved.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
const CV = "public/CV.pdf", DATA = "src/data/profile.json", HASH = "src/data/.cv-hash";
const key = process.env.ANTHROPIC_API_KEY;
if (!key) { console.error("Set ANTHROPIC_API_KEY"); process.exit(1); }
const pdf = readFileSync(CV), hash = createHash("sha256").update(pdf).digest("hex");
if (existsSync(HASH) && readFileSync(HASH, "utf8") === hash && !process.argv.includes("--force")) { console.log("CV unchanged."); process.exit(0); }
const current = readFileSync(DATA, "utf8");
const system = `You maintain a portfolio's profile.json from a person's CV.
Return ONLY the full updated JSON object (no prose, no code fences), same schema as the current file.
Rules:
1. KEEP every existing experience, project, education, skill group and skill unless the CV clearly contradicts it.
2. APPEND anything new in the CV (roles, projects, skills, education, certifications as extra skills/education) with a unique kebab-case "id".
3. UPDATE an existing item when the CV has newer facts (dates, bullets); match items by id, title or company.
4. Never delete or blank "demo", "repo", "image" or "links" values; for new projects leave demo "", repo "" and image "".
5. Write meaningfully: concise, factual, achievement-led bullets (max ~5 per role), no fluff, no invented facts or metrics. Group new skills into the closest existing group, or add a group if none fits.
6. Keep experience and education newest first. Update "summary", "tagline" and "stats" only if the CV supports it.`;
const res = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
  body: JSON.stringify({
    model: process.env.CV_MODEL || "claude-sonnet-5-5", max_tokens: 8000, system,
    messages: [{ role: "user", content: [
      { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf.toString("base64") } },
      { type: "text", text: `Current profile.json:\n${current}\n\nMerge the attached CV into it.` }] }],
  }),
});
if (!res.ok) { console.error(await res.text()); process.exit(1); }
const txt = (await res.json()).content.filter((b) => b.type === "text").map((b) => b.text).join("").replace(/^```(?:json)?|```$/gm, "").trim();
const next = JSON.parse(txt);
for (const k of ["name", "experience", "projects", "skills", "education", "links"]) if (!next[k]) throw new Error("Merged profile is missing " + k);
const before = JSON.parse(current);
if (next.projects.length < before.projects.length) throw new Error("Merge dropped projects; aborting.");
// Safety net: never lose links or images, even if the model forgets them.
const prev = Object.fromEntries(before.projects.map((p) => [p.id, p]));
for (const p of next.projects) for (const k of ["demo", "repo", "image"]) if (!p[k] && prev[p.id]?.[k]) p[k] = prev[p.id][k];
next.links = { ...before.links, ...next.links };
writeFileSync(DATA.replace(".json", ".backup.json"), current);
writeFileSync(DATA, JSON.stringify(next, null, 2) + "\n");
writeFileSync(HASH, hash);
console.log("profile.json updated. Review with: git diff src/data/profile.json");

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "content.json"), "utf8"));
const normalize = text => text.replace(/[·–—]/g, "-");
const escape = text => normalize(text).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);
const date = value => value.length === 4 ? value : new Intl.DateTimeFormat("en", {
  day: value.length === 10 ? "numeric" : undefined, month: "short", year: "numeric", timeZone: "UTC"
}).format(new Date(value));
const roles = data.experience.items.map(item => ({
  title: item.role + " | " + item.company,
  dates: (item.startDate ? date(item.startDate) + " - " : "Until ") + date(item.endDate),
  summary: item.summary,
  highlights: item.highlights,
  technologies: "Technologies: " + item.technologies.join(", ")
}));
const credentials = data.credentials.items.map(item => ({
  title: item.name + " - " + item.specialization,
  dates: (item.renewedDate ? "Renewed " + date(item.renewedDate) : "Issued " + date(item.issuedDate)) +
    (item.expirationDate ? "; Valid until " + date(item.expirationDate) : ""),
  url: item.url
}));
const skills = data.skills.items.map(item => item.name).join("; ");
const text = normalize([
  data.hero.name, data.hero.role, data.hero.location + " | " + data.contact.email,
  "", "SUMMARY", data.hero.intro,
  "", "TECHNICAL SKILLS", skills,
  "", "PROFESSIONAL EXPERIENCE",
  ...roles.flatMap(item => ["", item.title, item.dates, item.summary,
    ...item.highlights.map(highlight => "- " + highlight), item.technologies]),
  "", "CERTIFICATIONS",
  ...credentials.flatMap(item => ["", item.title, item.dates, item.url]), ""
].join("\n"));
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escape(data.hero.name)} | CV</title>
<style>
  @page { size: A4; margin: 14mm 15mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #1a1d24; font: 10pt/1.3 Arial, sans-serif; }
  h1, h2, h3, p, ul { margin: 0; }
  h1 { font-size: 24pt; line-height: 1.2; }
  header p { margin-top: 4pt; }
  h2 { margin: 12pt 0 7pt; padding-bottom: 4pt; border-bottom: 1px solid #ccc; color: #b30d00; font-size: 11pt; text-transform: uppercase; break-after: avoid; }
  h3 { font-size: 10.5pt; line-height: 1.35; }
  article { margin-bottom: 6pt; break-inside: avoid; }
  article p, ul { margin-top: 2pt; }
  ul { padding-left: 14pt; }
  .dates, .technologies { font-size: 9pt; }
  a { color: inherit; text-decoration: none; overflow-wrap: anywhere; }
  .verification { font-size: 8pt; }
</style></head><body>
<header><h1>${escape(data.hero.name)}</h1><p>${escape(data.hero.role)}</p>
<p>${escape(data.hero.location)} | <a href="mailto:${escape(data.contact.email)}">${escape(data.contact.email)}</a></p></header>
<main><h2>Summary</h2><p>${escape(data.hero.intro)}</p>
<h2>Technical skills</h2><p>${escape(skills)}</p>
<h2>Professional experience</h2>
${roles.map(item => `<article><h3>${escape(item.title)}</h3><p class="dates">${escape(item.dates)}</p>
<p>${escape(item.summary)}</p>${item.highlights.length ? `<ul>${item.highlights.map(highlight => `<li>${escape(highlight)}</li>`).join("")}</ul>` : ""}
<p class="technologies">${escape(item.technologies)}</p></article>`).join("\n")}
<h2>Certifications</h2>
${credentials.map(item => `<article><h3>${escape(item.title)}</h3><p>${escape(item.dates)}</p>
<p class="verification"><a href="${escape(item.url)}">${escape(item.url)}</a></p></article>`).join("\n")}
</main></body></html>`;

mkdirSync(join(root, "output/pdf"), { recursive: true });
mkdirSync(join(root, "tmp/pdfs"), { recursive: true });
const work = mkdtempSync(join(root, "tmp/pdfs/resume-"));
try {
  const source = join(work, "resume.html");
  const pdf = join(work, "resume.pdf");
  writeFileSync(source, html);
  execFileSync("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless=new", "--no-first-run", "--no-default-browser-check", "--disable-background-networking",
    "--disable-component-update", "--disable-sync", "--no-pdf-header-footer", "--export-tagged-pdf",
    "--user-data-dir=" + join(work, "chrome"), "--print-to-pdf=" + pdf, pathToFileURL(source).href
  ], { timeout: 30000, stdio: "pipe" });
  renameSync(pdf, join(root, "output/pdf/rafael-maldonado-cv.pdf"));
  writeFileSync(join(root, "output/rafael-maldonado-cv.txt"), text);
  console.log("Created PDF and plain-text CV from content.json.");
} finally {
  rmSync(work, { recursive: true, force: true });
}

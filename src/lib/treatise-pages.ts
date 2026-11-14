// /treatise/ is split into several pages (Jes tg 17923: "performance is quite bad on iphone. we're going
// to need to break this into pages"). Cut points were chosen by measured page weight (about 300–450 KB of
// HTML each); see docs/treatise-pages.md. The sky, the glosses and the scenes work the same on every page.

export type TreatisePage = {
  /** Astro rest param: undefined for /treatise/ itself. */
  slug: string | undefined;
  /** Short label for the pager and the page title. */
  label: string;
  /** Does this section belong on this page? `n` is the section's leading number (0 for the Prologue). */
  has: (part: string, n: number, kind: string) => boolean;
};

const p2 = (lo: number, hi: number) => (part: string, n: number, kind: string) =>
  part === "Part II" && kind === "main" && n >= lo && n <= hi;

export const PAGES: TreatisePage[] = [
  { slug: undefined, label: "Prologue", has: (part) => part === "Prologue" },
  { slug: "part-1", label: "Part I", has: (part) => part === "Part I" },
  { slug: "part-2", label: "Part II, §§ 1–12", has: p2(1, 12) },
  { slug: "part-2/13", label: "Part II, §§ 13–25", has: p2(13, 25) },
  { slug: "part-2/26", label: "Part II, §§ 26–37", has: p2(26, 37) },
  {
    slug: "part-2/38",
    label: "Part II, § 38 to the end",
    has: (part, n, kind) => part === "Part II" && (kind !== "main" || n >= 38),
  },
];

export const pageHref = (p: TreatisePage) => (p.slug ? `/treatise/${p.slug}/` : "/treatise/");

export const pageOf = (part: string, section: string, kind: string) => {
  const n = part === "Prologue" ? 0 : parseInt(section, 10);
  const p = PAGES.find((pg) => pg.has(part, n, kind));
  if (!p) throw new Error(`treatise pages: no page for ${part} § ${section} (${kind})`);
  return p;
};

// /treatise/ is split into pages, one proposition each (Jes tg 17923: "performance is quite bad on iphone.
// we're going to need to break this into pages"; tg 17962: "i think I want even smaller pages. like one
// proposition per page"). /treatise/ is the Prologue; each part's first section keeps the part's own URL
// (/treatise/part-1/, /treatise/part-2/), and every other section is /treatise/part-N/<section>/. The URLs of
// the earlier split (/treatise/part-2/13/, /26/, /38/) are the first sections of those pages, so they still
// land where they did. See docs/treatise-pages.md.

export type TreatisePage = {
  /** Astro rest param: undefined for /treatise/ itself. */
  slug: string | undefined;
  /** Short label for the pager and the page title. */
  label: string;
  /** The content entry this page holds. */
  id: string;
};

type Entry = { id: string; data: { part: string; section: string } };

const partSlug: Record<string, string> = { "Part I": "part-1", "Part II": "part-2" };

/** One page per entry, in reading order (entries must already be sorted). */
export const buildPages = (entries: Entry[]): TreatisePage[] => {
  const seen = new Set<string>();
  return entries.map((e, k) => {
    const { part, section } = e.data;
    if (part === "Prologue") return { slug: undefined, label: "Prologue", id: e.id };
    const ps = partSlug[part];
    if (!ps) throw new Error(`treatise pages: unknown part ${part} (${e.id})`);
    if (!/^[0-9]+[a-z]?$/.test(section)) throw new Error(`treatise pages: odd section "${section}" (${e.id})`);
    const first = entries.findIndex((x) => x.data.part === part) === k;
    const slug = first ? ps : `${ps}/${section}`;
    if (seen.has(slug)) throw new Error(`treatise pages: two entries at /treatise/${slug}/`);
    seen.add(slug);
    return { slug, label: `${part}, § ${section}`, id: e.id };
  });
};

export const pageHref = (p: TreatisePage) => (p.slug ? `/treatise/${p.slug}/` : "/treatise/");

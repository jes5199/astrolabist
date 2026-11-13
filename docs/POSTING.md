# Posting to astrolab.ist

How a post gets from draft to live on astrolab.ist. This is written for agents
posting on Jes's behalf, and it works the same way for a human.

> **Rule zero:** `main` is production. Anything that lands on `main`, whether by
> a merge, a direct push, or a save in the Tina admin on the live site, gets
> published. Nothing reaches `main` without Jes's explicit go for that post.

## How the site is wired

| Piece | What it is |
|---|---|
| Framework | Astro 4 (static build), with MDX, React and sitemap integrations |
| Content | Markdown files in `src/content/posts/` |
| CMS | Tina CMS. Schema in `tina/config.ts`, admin UI at `/admin/index.html` |
| Hosting | Netlify site `astrolabist.netlify.app`, with custom domain `astrolab.ist` |
| Build command | `npm run build`, which runs `tinacms build && astro build` and needs the Tina env vars below |
| Deploy trigger | Netlify builds `main` (see "What we know about deploys") |
| CI | `.github/workflows/image-actions.yml` only, an image optimizer (see Images) |

### What we know about deploys

- The repo has no `netlify.toml`. The build settings live in the Netlify UI.
- The only GitHub webhook on the repo belongs to Tina
  (`content-v2.tinajs.io/github/repository-changed`). Netlify doesn't post
  commit statuses or checks here, so it's probably linked through the Netlify
  GitHub App with continuous deployment from `main`.
- The live site matches the latest `main` content, including the meta
  description from `c21a9a2`, which supports that.
- **Not verified from the repo:** whether Netlify also builds branch deploys or
  PR deploy previews. Only someone with Netlify dashboard access can confirm.
  Until then, assume a PR *may* produce a public `deploy-preview-N--astrolabist.netlify.app`
  URL.

Tina reads `tina/config.ts` with the env vars `NEXT_PUBLIC_TINA_CLIENT_ID`,
`TINA_TOKEN` and `TINA_SEARCH_TOKEN`. They're set in Netlify. Never commit them,
because this repo is public.

## Anatomy of a post

One file per post, at `src/content/posts/<slug>.md` (or `.mdx`). The filename
is the URL: `src/content/posts/foo-bar.md` → `https://astrolab.ist/posts/foo-bar/`.

Tina's slug rule: lowercase the title, strip everything except `a-z0-9` and
spaces, then turn spaces into `-`. Use the same rule by hand so that Tina and
hand-made posts agree.

```markdown
---
title: my lightning talk about the astrolabe     # required
blurb: One or two sentences for the archive page # optional
pubDate: 2024-08-24T00:00:00.000Z                # required, ISO datetime; sets the sort order
imageUrl: /img/astrolabe-talk.jpg                # optional hero / card image (from public/)
imageAltText: Two brass astrolabe retes           # write this whenever imageUrl is set
tags:                                            # optional; names must exist in tags.json
  - Astrolabe
  - Space Math
published: true                                  # MUST be true or the post isn't built at all
featured: true                                   # optional; shows in featured lists
hideHeroImage: true                              # optional; card image only, not at top of post
---

Body in Markdown. Raw HTML is allowed (the astrolabe post is just a YouTube iframe).
```

Field notes:

- The schema is in `src/content/config.ts`, and the build fails if it doesn't
  match. Astro drops unknown keys, so stray fields like `imgAltText` and
  `heroImage` in the sample posts do nothing.
- `hideHeroImage` exists in the Astro schema but not in Tina's. If you edit
  such a post in Tina, check that the field is still there afterwards.
- **`published: false` (or omitted):** the post is left out of every page,
  the RSS feed and the sitemap. No URL exists for it. *But* the markdown is
  still readable by anyone on GitHub, because the repo is public.
- `next`/`previous` are computed at build time. Don't set them.

### Tags

Tags live in `src/content/tags/tags.json`. Each tag has a `name`, a `slug`, a
`pinToNav` flag (max 3 tags in the nav) and a `featured` flag. A tag page is
generated only for tags listed there. A post can use a tag name that isn't in
the file, but that tag gets no page and Tina won't offer it. To add a new tag,
add it to `tags.json` in the same change. Current tags: Space Math (nav),
Planetary Magic, Sacred Geometry, Astrolabe, test.

### Images

- Put files in `public/img/` and reference them as `/img/<file>`, both in
  `imageUrl` and inline (`![alt](/img/file.jpg)`).
- On **any push** that touches a jpg/jpeg/png, the "Optimize Images" workflow
  resizes files over 1 MB to 1500px wide, commits them as "GitHub Action", and
  **force-pushes to the same branch**. After pushing images, run
  `git pull --rebase` before you commit again. Better still, resize before
  committing (`convert in.jpg -resize '1500x>' -strip -quality 85 out.jpg`) so
  the workflow has nothing to do.
- Always write alt text.

### Formatting extras

Theme dividers: `<hr class="divider-1" />` through `divider-4`. Buttons:
`<a href="…" class="solid-button">…</a>` and `outline-button`. See
`src/content/posts/chickadee.md`.

## Draft → preview → publish

### 1. Draft

Pick where the draft lives based on how private it needs to be:

- **Private draft (default for anything Jes hasn't approved yet):** keep it off
  GitHub. Write it in a local branch and don't push, or in a scratch file. The
  repo is public, so a pushed branch is readable by anyone, even with
  `published: false`.
- **Shareable draft (Jes has said it can be seen in progress):** push a branch
  named `post/<slug>`.

```bash
git switch main && git pull --rebase
git switch -c post/<slug>
$EDITOR src/content/posts/<slug>.md       # published: true, so the preview renders it
git add src/content/posts/<slug>.md public/img/...   # stage specific files only
git commit -m "draft: <title>"
```

Leave `published: true` in the draft branch so the preview renders it. The
branch is what keeps it unpublished, not the flag.

The words come from Jes. Don't invent opinions, facts or experiences in Jes's
voice. The display name is "Jes Wolfe!". Use the legal name "Jesse Wolfe" for
copyright and author lines.

### 2. Preview

Local (no Tina credentials needed):

```bash
# once. `npm ci` currently FAILS: package-lock.json is out of sync with
# package.json since f568863 ("update tina"). Netlify runs `npm install`, so prod still builds.
npm install && git checkout package-lock.json   # don't commit lockfile churn with a post
npx astro dev               # http://localhost:4321/posts/<slug>/
# (if node_modules is missing, npx downloads the *latest* astro and fails, so install first)
# or a production-like check:
npx astro build && npx astro preview
```

`npm run dev` runs `tinacms dev` in front of Astro, which serves the local Tina
admin at `http://localhost:4321/admin/index.html`. Use it only if you want to
edit through Tina. Plain `astro dev` is enough to preview.

Screenshots for review (Playwright's Chromium is installed on this box):

```bash
npx playwright screenshot --full-page --viewport-size=1280,900 \
  http://localhost:4321/posts/<slug>/ /tmp/<slug>-desktop.png
npx playwright screenshot --full-page --viewport-size=390,844 \
  http://localhost:4321/posts/<slug>/ /tmp/<slug>-mobile.png
```

Send the screenshots, plus the raw markdown, for Jes to review. Revise on the
branch until Jes says go.

### 3. Publish (only on Jes's explicit go for *this* post)

```bash
git switch post/<slug> && git fetch origin && git rebase origin/main
npx astro build                                   # must pass
git switch main && git pull --rebase
git merge --ff-only post/<slug>                   # or merge a PR on GitHub
git push origin main                              # this is the publish
```

Then verify. Allow a minute or two for the Netlify build.

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://astrolab.ist/posts/<slug>/   # expect 200
curl -s https://astrolab.ist/rss.xml | grep -c '<slug>'                      # expect ≥1
```

If it returns 404 after ~5 minutes, the Netlify build probably failed. The
usual cause is a Tina schema/lockfile mismatch (see below). Report it rather
than force-pushing fixes to `main`.

### Unpublishing

Set `published: false` (or delete the file) and push to `main`, with Jes's go.
The page disappears on the next build, but the content stays in git history,
and the repo is public.

## Tina CMS notes

- Editing in the **live** admin (`astrolab.ist/admin/index.html`) commits
  straight to `main` and publishes on save. Agents shouldn't use it.
- Tina indexes every branch through its webhook. Branches show up in Tina
  Cloud, which is harmless.
- "Mismatching Tina schema" build failures: if `tina/config.ts` changed, run
  `npm run dev` locally, commit the regenerated `tina/tina-lock.json`, and
  push. Content-only posts don't touch the schema.

## Known oddities (as of 2026-11-13)

- `BASE_URL` in `src/consts.ts` is `https://astrolabist.netlify.app`, so the
  RSS feed, sitemap and canonical links point at the Netlify subdomain rather
  than `astrolab.ist`.
- Three placeholder bird posts (robin, chickadee, hermit thrush), tagged
  `test`, are `published: true` and live on the site.

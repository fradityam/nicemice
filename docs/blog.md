# Blog

Each article is a Markdown file in `content/blog/`. `npm run build` turns every published
article into a finished HTML page with its own title, description, canonical, link-preview
tags and structured data. The full text is in the HTML, so search engines and WhatsApp don't
need to run JavaScript. The build also adds each article to `sitemap.xml`.

| Address | What it is |
| --- | --- |
| `/blog/<slug>` | an article (`dist/blog/<slug>.html`) |
| `/blog` | the list of published articles, newest first (`dist/blog.html`) |
| `/blog/<slug>/`, `/blog/` | 301 to the address without the slash (worker/index.ts) |
| `/blog/<slug>.html` | 307 to `/blog/<slug>` (Cloudflare's own redirect; this path never reaches the Worker) |
| `/blog/<unknown>` | the site's usual 404 |

The index shows one article large on top: the newest pillar article, or else the newest
article. The rest follow in a grid (3 columns on desktop, 2 on tablets, 1 on phones), newest
first, then the WhatsApp box.

> **Pagination:** there is none yet; every published article is on `/blog`. Add pages
> (e.g. `/blog/halaman/2`) once there are about 12 articles.

While nothing is published, there's no `dist/blog.html`. `/blog` (and `/blog/`) then stay the
app's "Segera Hadir" page, marked noindex, exactly as before.

> **When the first article is published:** add a link to `/blog` in the site's footer
> (`src/components/home/SiteFooter.tsx`). Until then the app doesn't link to the blog.

## Adding an article

1. Put the cover (and any other images) in `public/images/blog/`. Use WebP, at most 1600px
   wide, under 300 KB, with a lowercase-hyphenated name, e.g. `tema-friends-sampul.webp`.
2. Create `content/blog/<slug>.md`. The file name is the address: lowercase letters, digits
   and hyphens (`cara-memilih-tema-undangan.md` → `/blog/cara-memilih-tema-undangan`).
3. Write the frontmatter (below) with `draft: true`, then the body.
4. Run `npm run build`. Fix anything marked `ERROR` (the build stops on it); read the `warn` lines.
5. To publish, set `draft: false` and push to `main`.

`content/blog/contoh-artikel.md` is a placeholder (a draft) that shows every feature.

## Frontmatter

```yaml
---
title: "Cara Memilih Tema Undangan Digital"   # required; the page's H1. <title> is "<title> | Nice Mice"
description: "…"                               # required; 140–160 characters (meta description, link previews)
date: 2026-11-02                               # required; published, YYYY-MM-DD
updated: 2026-12-01                            # optional; shows "Diperbarui …", used as dateModified and the sitemap's lastmod
author: fadil-ratu                             # required; a slug from content/authors.json
cover: /images/blog/tema-friends-sampul.webp   # required; a file in public/images/blog/
coverAlt: "…"                                  # required; describes the cover image
cluster: tema-undangan                         # required; the topic group (needs a label in content/blog.json clusterLabel)
pillar: true                                   # optional; the cluster's main article (at most one per cluster)
summary:                                       # optional; 3–7 short points, shown as "Ringkasan"
  - "…"
related: [slug-lain, slug-ketiga]              # optional; otherwise up to 3 newest from the same cluster
draft: false                                   # required; true = checked, but not published or in the sitemap
faq:                                           # optional; shown as "Pertanyaan Umum" and as FAQPage data
  - q: "…?"
    a: "…"
---
```

Unknown fields stop the build, so a misspelt field name doesn't get silently ignored.

## What the page shows

1. Breadcrumb (Beranda › Blog › title), the cluster's label (`clusterLabel`), and the H1, from `title`
2. Byline: author (linking to their `url`), date, "Diperbarui …" when `updated` is set, reading time
3. Cover (loads first)
4. "Ringkasan", from `summary`, a check before each point
5. The body
6. "Pertanyaan Umum", from `faq`: each question an H3 with its answer
7. A link to the cluster's pillar article (on the cluster's other articles, once the pillar is published)
8. "Artikel Terkait": up to 3, from `related` or else the newest from the same cluster; a small cover beside the title and date
9. About the author
10. Closing WhatsApp box

The structured data is BlogPosting (with the author as a Person and Nice Mice as publisher,
the homepage's Organization), BreadcrumbList, and FAQPage when there's a `faq`. The blog index
has Blog and BreadcrumbList.

## The body

Plain Markdown (no MDX, and raw HTML isn't shown), plus GitHub's tables and task lists.

- Start sections at `##`. The title is the page's only H1. Don't skip levels (`##` → `####`).
- Every image needs alt text: `![What the photo shows](/images/blog/file.webp)`. The build adds
  its width and height and loads it lazily.
- Link to the site's pages with paths: `[demo Friends](/template/friends)`, `[artikel lain](/blog/slug)`.
  Aim for at least 2 per article. Links to other sites get `rel="noopener"`.
- Two extras:

```markdown
:::whatsapp{message="Halo Nice Mice, saya mau tanya soal tema Friends." label="Tanya lewat WhatsApp"}
Text of the WhatsApp box.
:::

::demo{theme="friends"}
```

`:::whatsapp` is a box with a WhatsApp button. `message` and `label` are optional; by default
it uses the usual order message. `::demo` is a card linking to `/template/<theme>`. The theme
must be one with a demo page in `src/content/seo.ts` (`friends`, `lalaland`, `notebook`,
`crazy-little-thing`).

Clicks on any WhatsApp link send `whatsapp_click` to Analytics, the same event as the app
sends: `button` is `blog_inline` for a box in the body, `blog_cta` for the closing one,
`top_bar` for the announcement bar.

## Authors: `content/authors.json`

```json
{
  "authors": [
    {
      "slug": "fadil-ratu",
      "name": "…",
      "role": "…",
      "bio": "…",
      "url": "/tentang-kami",
      "sameAs": ["https://www.instagram.com/…"]
    }
  ]
}
```

`url` is a site path or an `https://` address; `sameAs` lists full addresses of the author's
profiles (it may be empty). They are used for the byline, the author box and the JSON-LD Person.

## The blog index: `content/blog.json`

`title` (the full `<title>`), `description` (140–160 characters), `heading` (the H1), `intro`,
and `clusterLabel`, each cluster's label as shown above an article's title:

```json
"clusterLabel": {
  "sebar-undangan": "Sebar Undangan",
  "tema-undangan": "Tema Undangan"
}
```

The labels aren't links yet. The other values are placeholders; fill them in before the first
article is published.

## Checks

`ERROR` stops the build; `warn` is printed and the build carries on.

| | Rule |
| --- | --- |
| ERROR | A required frontmatter field is missing or invalid, or there's an unknown field |
| ERROR | File name (slug) isn't lowercase letters, digits and hyphens, or two articles share a slug |
| ERROR | More than one `pillar: true` in a cluster |
| ERROR | `author` isn't in `content/authors.json`; a slug in `related` has no article |
| ERROR | The body has an H1 |
| ERROR | An image (cover or in the body) has no alt text, isn't in `public/images/blog/`, or the file is missing |
| ERROR | Unknown `:::`/`::` directive, or `::demo` with a theme that has no demo |
| ERROR | A published article's `cluster` has no label in `content/blog.json` `clusterLabel` (a warning while all its articles are drafts) |
| ERROR | A published article's author has a site-path `url` that isn't a page (`PAGES` in `src/content/seo.ts`, `/blog`, or a published article). While all their articles are drafts, this is only a warning |
| warn | Heading levels skip (`##` → `####`) |
| warn | `"<title> \| Nice Mice"` over 60 characters; description outside 140–160 characters |
| warn | An image file name in `public/images/blog/` isn't lowercase-hyphenated, or the file is over 300 KB |
| warn | Fewer than 2 internal links in the body |
| warn | A link to an article that doesn't exist or is still a draft, or to a path that isn't a page; `related` naming a draft |
| warn | Raw HTML in the body (it isn't shown) |

After every build the script prints, per article, its internal links and links in and out to
other articles (counted in the body only), plus the orphan articles that no other article links to.

## How it's built

`npm run build` runs three steps:

1. `vite build` builds the app. It also builds `src/blog/blog.css` as its own file, which the
   app never loads.
2. `vite build --ssr src/blog/render.tsx --outDir build/blog-ssr` builds the page components
   (`src/blog/`). They reuse the homepage's `SiteHeader` and `SiteFooter`, so the logo URLs
   match the app's.
3. `tsx scripts/blog/build.ts` reads and checks the content (`scripts/blog/schema.ts`,
   `markdown.ts`), renders the pages with `renderToStaticMarkup`, and writes `dist/blog/`,
   `dist/blog.html` and `dist/sitemap.xml`.

Blog pages aren't hydrated: they load the app's main stylesheet (Tailwind and `home.css`, for
the header and footer), `blog.css`, the Google Analytics snippet from `index.html`, and a small
inline script for the page view and `whatsapp_click`. They load none of the app's JavaScript.

## Later: a Git-based CMS (Decap or Sveltia)

The content is already laid out for a Git-based CMS: one Markdown file per article, the
media folder in `public/`, and authors and the index text in JSON files. Below is a draft
config; it isn't active. To use it, put it in `public/admin/config.yml`, add
`public/admin/index.html` loading the CMS, and set up GitHub authentication. Sveltia CMS reads
the same file.

```yaml
backend:
  name: github
  repo: fradityam/nicemice
  branch: main
publish_mode: editorial_workflow   # drafts live in pull requests until approved
media_folder: public/images/blog
public_folder: /images/blog
locale: id
slug:
  encoding: ascii
  clean_accents: true

collections:
  - name: blog
    label: Artikel
    folder: content/blog
    create: true
    extension: md
    format: frontmatter
    slug: "{{slug}}"               # file name = address; lowercase, hyphens
    summary: "{{title}} ({{date}})"
    fields:
      - { name: title, label: Judul, widget: string }
      - { name: description, label: Deskripsi (140–160 karakter), widget: text, pattern: ['^.{140,160}$', 'Harus 140–160 karakter'] }
      - { name: date, label: Tanggal terbit, widget: datetime, format: YYYY-MM-DD, date_format: YYYY-MM-DD, time_format: false }
      - { name: updated, label: Tanggal diperbarui, widget: datetime, format: YYYY-MM-DD, date_format: YYYY-MM-DD, time_format: false, required: false }
      - name: author
        label: Penulis
        widget: relation
        collection: settings
        file: authors
        search_fields: ["authors.*.name"]
        value_field: "authors.*.slug"
        display_fields: ["authors.*.name"]
        default: fadil-ratu
      - { name: cover, label: Gambar sampul, widget: image }
      - { name: coverAlt, label: Alt text sampul, widget: string }
      - { name: cluster, label: Cluster, widget: string }
      - { name: pillar, label: Artikel pilar, widget: boolean, required: false, default: false }
      - { name: summary, label: Ringkasan (3–7 poin), widget: list, field: { name: point, label: Poin, widget: string }, min: 3, max: 7, required: false }
      - { name: related, label: Artikel terkait, widget: relation, collection: blog, search_fields: [title], value_field: "{{slug}}", display_fields: [title], multiple: true, required: false }
      - { name: draft, label: Draft, widget: boolean, default: true }
      - name: faq
        label: Pertanyaan Umum
        widget: list
        required: false
        fields:
          - { name: q, label: Pertanyaan, widget: string }
          - { name: a, label: Jawaban, widget: text }
      - { name: body, label: Isi, widget: markdown }

  - name: settings
    label: Pengaturan
    files:
      - name: authors
        label: Penulis
        file: content/authors.json
        fields:
          - name: authors
            label: Penulis
            widget: list
            fields:
              - { name: slug, label: Slug, widget: string, pattern: ['^[a-z0-9]+(-[a-z0-9]+)*$', 'huruf kecil, angka, tanda hubung'] }
              - { name: name, label: Nama, widget: string }
              - { name: role, label: Peran, widget: string }
              - { name: bio, label: Bio singkat, widget: text }
              - { name: url, label: Halaman penulis, widget: string, default: /tentang-kami }
              - { name: sameAs, label: Profil lain (URL), widget: list, required: false }
      - name: blog
        label: Halaman blog
        file: content/blog.json
        fields:
          - { name: title, label: Judul halaman (<title>), widget: string }
          - { name: description, label: Deskripsi (140–160 karakter), widget: text }
          - { name: heading, label: Judul (H1), widget: string }
          - { name: intro, label: Pembuka, widget: text }
          # Sveltia: { name: clusterLabel, label: Label cluster, widget: keyvalue }
          # Decap has no key-value widget; edit clusterLabel in the JSON file there.
```

The CMS's Markdown editor doesn't know the `:::whatsapp` and `::demo` directives. Write them
as plain text in the body, as above.

# kuang-blog

Personal hub and blog. Next.js App Router + MDX + Supabase + Postmark, deployed on Vercel.

---

## What's Built

| Layer | Details |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Styling | Tailwind CSS, Geist font, monochrome palette |
| Content | MDX with LaTeX (KaTeX) and syntax highlighting (rehype-pretty-code) |
| Database | Supabase PostgreSQL — `subscribers` table |
| Storage | Supabase Storage — `assets` bucket for images |
| Email | Postmark — welcome email on subscribe, batch broadcast on new post |

### File map

```
app/
  page.tsx                  — Index: bio + chronological post list
  blog/[slug]/page.tsx      — Post renderer (max-width 65ch)
  api/subscribe/route.ts    — POST /api/subscribe
  api/broadcast/route.ts    — POST /api/broadcast (Bearer-protected)
components/
  SignalCapture.tsx          — CTA block: "talent" variant (links) or "investor" variant (email form)
lib/
  posts.ts                  — Read + sort MDX files from /content
  mdx.ts                    — compileMDX pipeline (remark-math, rehype-katex, rehype-pretty-code)
  supabase.ts               — Lazy Supabase client (anon + service role)
  assets.ts                 — assetUrl(filename) helper for Supabase Storage URLs
content/
  *.mdx                     — Blog posts (frontmatter: title, date, excerpt, tags)
scripts/
  migrate-substack.js       — Bulk-import Substack CSV → Supabase (no welcome emails)
supabase-schema.sql         — DDL for subscribers table
.env.local.example          — All required environment variables
```

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
POSTMARK_SERVER_TOKEN
POSTMARK_FROM_EMAIL
BROADCAST_SECRET
```

---

## Local Dev

```bash
cp .env.local.example .env.local
# fill in credentials, or leave as placeholders for UI-only preview
node node_modules/next/dist/bin/next dev
```

> `npm run dev` has a Node 24 shim issue — use the direct path above until resolved.

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add all env vars from `.env.local` in Vercel project settings
4. Deploy — Vercel auto-detects Next.js

---

## First-Time Setup Checklist

- [ ] Run `supabase-schema.sql` in the Supabase SQL Editor
- [ ] Create a `assets` storage bucket in Supabase, set visibility to **Public**
- [ ] Add a verified sender domain/email in Postmark
- [ ] Create two Postmark message streams: `outbound` (transactional) and `broadcast`
- [ ] Set `BROADCAST_SECRET` to a random string (used to protect `/api/broadcast`)
- [ ] Fill in social links in `app/page.tsx` (X, LinkedIn, GitHub)

---

## Writing Posts

Create a new file in `/content`:

```
content/my-post-slug.mdx
```

Frontmatter:

```yaml
---
title: "Post Title"
date: "2026-01-01"
excerpt: "One sentence summary."
tags: ["ai", "systems"]
---
```

Use KaTeX for math:

```
$$
E = mc^2
$$
```

Use `<SignalCapture variant="investor" />` or `<SignalCapture variant="talent" />` at the bottom of any post.

Reference images stored in Supabase:

```mdx
import { assetUrl } from "@/lib/assets"
<img src={assetUrl("my-chart.png")} />
```

---

## Migrating Substack Subscribers

```bash
node scripts/migrate-substack.js path/to/substack-export.csv
```

Bulk-upserts into `subscribers` table. Does **not** trigger welcome emails.

---

## API Reference

### `POST /api/subscribe`
```json
{ "email": "user@example.com", "source": "blog" }
```
Inserts into Supabase, sends Postmark welcome email. Idempotent on duplicate email.

### `POST /api/broadcast`
```
Authorization: Bearer <BROADCAST_SECRET>
```
```json
{ "postTitle": "Title", "postUrl": "https://...", "excerpt": "..." }
```
Fetches all subscribers and sends batched Postmark emails. Run this after publishing a new post.

---

## How It Works

### Content pipeline

MDX files in `/content` are the source of truth. `lib/posts.ts` reads them at build time using `gray-matter` to extract frontmatter (title, date, excerpt). The index page calls `getAllPosts()` and renders a sorted list. When you navigate to `/blog/my-slug`, Next.js calls `getPostBySlug("my-slug")`, reads the raw MDX, and passes it through `lib/mdx.ts`.

`lib/mdx.ts` runs the content through `compileMDX` from `next-mdx-remote`, which chains:
- `remark-math` — converts `$...$` and `$$...$$` in the markdown source into math nodes
- `rehype-katex` — renders those math nodes to HTML using KaTeX
- `rehype-pretty-code` — wraps fenced code blocks in syntax-highlighted HTML using the Vesper theme

Custom React components (`<SignalCapture />`) are passed in via the `components` map, so you can drop them anywhere in MDX.

### Subscriber flow

```
User fills out <SignalCapture variant="investor" />
  → POST /api/subscribe { email, source }
    → insert into Supabase subscribers table
    → Postmark sends welcome email
```

`/api/subscribe` uses the **service role key** (bypasses Supabase RLS) so it can write to the table server-side without exposing credentials to the client.

### Broadcast flow

```
You publish a new post
  → curl POST /api/broadcast (with Bearer token)
    → fetch all rows from subscribers
    → chunk into batches of 500
    → Postmark sendEmailBatch per chunk
```

The `BROADCAST_SECRET` env var is the only auth — keep it out of version control.

### Image storage

Upload images to the `assets` bucket in Supabase Storage. Reference them in MDX using the `assetUrl()` helper, which builds the full public CDN URL from your Supabase project URL.

---

## Next Steps

### Supabase

- [ ] **Create a project** at [supabase.com](https://supabase.com) → New Project. Pick a region close to your users. Note the project URL and anon/service-role keys.
- [ ] **Run the schema** — open the Supabase dashboard → SQL Editor → paste and run `supabase-schema.sql`. This creates the `subscribers` table with the required columns and indexes.
- [ ] **Create the storage bucket** — go to Storage → New Bucket → name it `assets` → set visibility to **Public**. No additional policies needed for read access on a public bucket.
- [ ] **Disable RLS for server-side writes** (optional, already handled by service role key) — the subscribe route uses the service role key which bypasses RLS by default. If you ever switch to the anon key, add a policy: `CREATE POLICY "insert_subscribers" ON subscribers FOR INSERT WITH CHECK (true);`
- [ ] **Copy env values** — from Supabase dashboard → Project Settings → API:
  - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `anon` / `public` key
  - `SUPABASE_SERVICE_ROLE_KEY` = `service_role` key (keep secret — never expose client-side)

### Postmark

- [ ] **Create a Postmark account** and add a sender domain under Sender Signatures. Verify the DNS records it gives you.
- [ ] **Create two message streams** in your server:
  - `outbound` — Transactional, used for welcome emails
  - `broadcast` — Broadcasts, used for new post announcements
- [ ] Set `POSTMARK_SERVER_TOKEN` (from Server → API Tokens) and `POSTMARK_FROM_EMAIL` (your verified sender address).

### Vercel

- [ ] **Push to GitHub** and import the repo at [vercel.com/new](https://vercel.com/new). Vercel auto-detects Next.js — no framework config needed.
- [ ] **Add all env vars** under Project Settings → Environment Variables. Add each of the six variables from `.env.local`. Make sure `SUPABASE_SERVICE_ROLE_KEY` and `BROADCAST_SECRET` are set to **Production** only (not Preview/Development unless you have separate Supabase projects).
- [ ] **Set a custom domain** — Project Settings → Domains → Add. Point your DNS `A`/`CNAME` records as instructed. Vercel provisions TLS automatically.
- [ ] **Verify the subscribe flow** after deploy: fill out the form on the live site, check the Supabase `subscribers` table for the new row, and confirm the welcome email arrived.
- [ ] **Test broadcast** by running:
  ```bash
  curl -X POST https://your-domain.com/api/broadcast \
    -H "Authorization: Bearer <BROADCAST_SECRET>" \
    -H "Content-Type: application/json" \
    -d '{"postTitle":"Test","postUrl":"https://your-domain.com","excerpt":"Testing broadcast."}'
  ```

### Content & polish

- [ ] Replace placeholder social links (X, LinkedIn, GitHub) in [app/page.tsx](app/page.tsx)
- [ ] Write your first real post in `/content`
- [ ] Add `og:image` and `twitter:card` meta tags to `app/layout.tsx` for link previews
- [ ] Add a `/about` page or expand the bio section
- [ ] Add Google Analytics or Plausible (one script tag in `layout.tsx`)
- [ ] Automate broadcast: trigger `/api/broadcast` from a GitHub Action on merge to main

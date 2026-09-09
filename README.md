# emerald tabs — The Tablet

Artist site for **emerald tabs**: lo-fi postcards from the Tenderloin. A dark jewel-toned room with a living emerald, the **Shatter Sync** rhythm rite, and a postcard catalog that deep-links every play to ElevenMusic.

Domain: [emeraldtabs.com](https://emeraldtabs.com)

ElevenMusic: [profile](https://elevenmusic.io/artist/6a639b7d6c94d11b17259208) · [artists](https://elevenmusic.io/artists/emerald-tabs-z2I-l1)

GitHub (when you connect a remote): [vicnightengale/emeraldtabs](https://github.com/vicnightengale/emeraldtabs)

## Why there is no in-page stream

ElevenMusic HLS at `media.elevenmusic.io` returns **403** without app auth. The site never tries to play that audio.

- **Full listen** — prominent “Listen on ElevenMusic” links (`https://elevenmusic.io/track/{share_id}`)
- **Crystal + Shatter Sync** — Web Audio BPM clock (optional soft lo-fi kick/click/pad) and a visual pulse
- Covers and the avatar load from `cdn.elevenmusic.io` (CORS `*`)

## Local development

Needs Node 20+.

```bash
npm install
npm run dev
```

App: [http://127.0.0.1:43123](http://127.0.0.1:43123)

```bash
npm run build      # Next.js production build
npm run preview    # OpenNext + Wrangler local Worker
npm run deploy     # OpenNext build + wrangler deploy
npm run catalog    # refresh data/catalog.json from the ElevenMusic API
```

No secrets or backend in v1. Catalog is baked into `data/catalog.json` (unique published tracks: title, bpm, duration, genres, cover, share id, description).

## Cloudflare deploy (Pages / Workers)

This app uses **Next.js App Router** plus [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare). That is the current Cloudflare path for Next.js — it ships as a **Worker** with static assets. In the dashboard this lives under **Workers & Pages**.

### 1. CLI (after `npx wrangler login`)

```bash
npm run deploy
```

That runs `opennextjs-cloudflare build` then `opennextjs-cloudflare deploy` using `wrangler.jsonc` (`name`: `emeraldtabs`).

### 2. Git-connected Cloudflare project

Connect [github.com/vicnightengale/emeraldtabs](https://github.com/vicnightengale/emeraldtabs) (or this Origin repo) in **Workers & Pages → Create → Connect to Git**.

Suggested production settings:

| Field | Value |
| --- | --- |
| Framework preset | Next.js (OpenNext / Workers) if offered, otherwise None |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx wrangler deploy` (Git integration often runs this for you) |
| Root directory | `/` |
| Node version | `20` or `22` |

`wrangler.jsonc` already points at `.open-next/worker.js` and `.open-next/assets`. Do **not** set `output: "export"` unless you intentionally drop OpenNext.

If the UI still talks about **Cloudflare Pages** build output directories: leave the output directory empty and let Wrangler publish the Worker. A pure static `out/` export is the fallback if you ever strip server features; v1 does not need that.

### 3. Custom domain `emeraldtabs.com`

In the Worker / Pages project:

1. **Custom domains → Add** `emeraldtabs.com` and `www.emeraldtabs.com`
2. If DNS is already on Cloudflare, it will attach a CNAME/proxied record
3. If DNS is elsewhere, point the apex (or CNAME flattening) at the Cloudflare target the dashboard shows
4. SSL is automatic once the record is proxied

`metadataBase` is `https://emeraldtabs.com`.

### 4. Adding the GitHub remote later

This project can live on Origin first. When you are ready:

```bash
git remote add github https://github.com/vicnightengale/emeraldtabs.git
git push -u github main
```

Then connect that GitHub repo in the Cloudflare dashboard for preview + production deploys.

## Shatter Sync

Thirty-second BPM challenge. Facets glow on the grid; tap in time for perfect / good / miss, combo, and accuracy. **≥80%** or a **12-hit streak** shatters the tablet, draws a procedural sigil (track + score + UTC date), and offers Web Share, PNG download, and a share URL:

`/?track={share_id}&score=&accuracy=&combo=&sigil=&shatter=1`

Daily challenge = UTC date hash → featured track. **Alchemists** is a `localStorage` leaderboard on this device.

## Stack

- Next.js App Router, TypeScript, Tailwind v4, shadcn/ui
- Canvas 2D living emerald (no Three.js — 60fps-friendly)
- `@opennextjs/cloudflare` + Wrangler

## License

Site code is yours. Recordings and artwork belong to emerald tabs / ElevenMusic.

# emerald tabs

The official artist site for **emerald tabs** — lo-fi from the Tenderloin, built around the *Tenderloin Lemonaide* catalog on [ElevenMusic](https://elevenmusic.io).

Live target: [emeraldtabs.com](https://emeraldtabs.com) on **Cloudflare Pages**.

## What this is

A living emerald tablet. Each track has a BPM-driven pulse. Crack the tablet and you enter **Shatter Sync**, a ~30 second rhythm game on the crystal's six facets. High scores stay in the browser. Daily challenge is UTC. Share a sigil with a score URL.

The site never plays ElevenMusic HLS. Full listen always opens ElevenMusic. The game keeps time with the Web Audio API (or a silent clock if AudioContext is blocked).

## Local development

```bash
npm install
npm run catalog   # optional: refresh data/catalog.json from the public ElevenMusic API
npm run dev       # http://127.0.0.1:43123
```

## Production build (Cloudflare Pages)

```bash
npm run build     # OpenNext + Wrangler worker bundle
npm run preview   # local wrangler preview of the worker
npm run deploy    # wrangler deploy
```

Cloudflare Pages: framework preset **OpenNext**, build command `npm run build`, output `.open-next`.

No secrets. Catalog is static JSON.

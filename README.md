# Russell Rozenbaum — Portfolio

Personal portfolio website with a hand-drawn, retro-device aesthetic. Built with
React + TypeScript + Vite.

The centerpiece is a sketched **retro MP3 player** (a light-blue LCD "playbox")
that plays a curated set of my tracks, alongside a vinyl **album shelf**.

## Sections

- **Overview** — intro + photo
- **Work Experience** — roles + résumé (PDF viewer)
- **Research** — lab work, honors thesis, poster & slides (PDF viewer)
- **Personal Projects** — Sprachy, YouTube, etc.
- **Music** — album shelf + the MP3 playbox
- **Oil Paintings** — gallery

## Develop

```bash
make serve        # or: npm install && npm run dev   → http://localhost:5173
make build        # type-check + production build → dist/
```

## Editable content (no code required)

| What | Drop files in | Edit registry |
|------|---------------|---------------|
| Music tracks | `public/music/` | `src/data/tracks.json` |
| Album covers | `public/albums/` | `src/data/albums.json` |
| Oil paintings | `public/paintings/` | `src/data/paintings.json` |
| Projects | `public/projects/` | `src/data/projects.json` |
| PDFs (résumé, thesis…) | `public/docs/` | `src/data/docs.ts` |
| Work logos | `public/logos/` | `src/data/experience.json` |

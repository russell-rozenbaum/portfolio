# Org logos for Work Experience 🏢

This folder (`public/logos/`) holds the company / school logos shown next to
each Work Experience entry.

## To change or add a logo

1. **Drop the image file here** — e.g. `ford.svg`, `opus-ivs.jpeg`, `umich.png`
   (`.svg`, `.png`, `.webp`, `.jpg` all work; transparent backgrounds look best).
2. **Edit `src/data/experience.json`** — add/point the entry's `logo` field to
   the filename:

   ```json
   {
     "role": "AI Engineer",
     "org": "Ford Motor Company",
     "logo": "ford.svg",
     "location": "Dearborn, MI",
     "dates": "Sep 2025 – Present",
     "bullets": ["…"]
   }
   ```

## Notes

- Logos sit in a 3:2 framed chip and alternate sides: **odd** entries logo-left,
  **even** entries logo-right (see `.xp--logos` in `src/App.css`).
- `logo` is optional — omit it and that entry just shows text, no chip.
- If a file is missing, the chip stays empty (no broken-image icon).

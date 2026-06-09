# Drop your music here 🎵

This folder (`public/music/`) is where your audio files live. Drag and drop them
right in.

## To set up your 8 tracks

1. **Drop the files here** — e.g. `gold-and-silver.mp3`, `april-c.mp3`, …
2. **Edit `src/data/tracks.json`** — that's the one config file you change.
   Each entry looks like:

   ```json
   { "title": "GOLD + SILVER", "label": "TRACK 01", "file": "gold-and-silver.mp3" }
   ```

   - `title` — the big name shown in the playbox
   - `label` — the small line above it (artist, mood, whatever)
   - `file`  — just the filename you dropped in this folder
   - **Reorder** the playlist by moving lines up/down in that file.

That's it — save and the page updates.

## Notes

- `.mp3` is the safest format across browsers. `.m4a`, `.ogg`, `.wav` work too.
- Until real files exist, the playbox still renders — it just can't make sound yet.

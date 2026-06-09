# Drop your album covers here 💿

This folder (`public/albums/`) holds the cover images for the shelf. Drag and drop
your cover art right in.

## To set up the shelf

1. **Drop cover images here** — e.g. `feelings-of-familiarity.jpg`
2. **Edit `src/data/albums.json`** — one entry per album, left-to-right on the shelf:

   ```json
   {
     "title": "Feelings of Familiarity",
     "release": "May 2024",
     "cover": "feelings-of-familiarity.jpg",
     "url": "https://ffm.bio/russellroze"
   }
   ```

   - `title`   — album name (shown in the detail panel + on the spine)
   - `release` — date text, however you write it (e.g. "May 2024")
   - `cover`   — just the filename you dropped in this folder
   - `url`     — where clicking the album goes
   - **Order** = the order entries appear in the file.

## Notes

- Square covers look best (they're cropped to a square). `.jpg`, `.png`, `.webp` all work.
- Until a cover file exists, that album shows a "NO COVER" placeholder — the shelf still works.

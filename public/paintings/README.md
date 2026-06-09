# Drop your oil paintings here 🎨

This folder (`public/paintings/`) holds images of your oil paintings.

## To add a painting

1. **Drop the image file here** — e.g. `sunset-over-the-field.jpg`
2. **Edit `src/data/paintings.json`** — one entry per piece, in display order:

   ```json
   {
     "name": "Sunset Over the Field",
     "date": "2023",
     "location": "Detroit, MI",
     "image": "sunset-over-the-field.jpg"
   }
   ```

   - `name`     — title of the piece
   - `date`     — any text ("2023", "March 2024", …)
   - `location` — **optional**; leave it out if not applicable
   - `image`    — just the filename you dropped in this folder

## Notes

- Square-ish images look best (they're shown in a square frame, cropped to fit).
- `.jpg`, `.png`, `.webp` all work.
- Until an image exists, that piece shows a "NO IMAGE" placeholder — the gallery still works.

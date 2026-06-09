# Drop your travel photos here ✈️

This folder (`public/travel/`) holds images from your travels.

## To add a photo

1. **Drop the image file here** — e.g. `lisbon-rooftops.jpg`
2. **Edit `src/data/travel.json`** — one entry per photo, in display order:

   ```json
   {
     "location": "Lisbon, Portugal",
     "date": "March 2024",
     "image": "lisbon-rooftops.jpg"
   }
   ```

   - `location` — where the photo was taken
   - `date`     — any text ("2024", "March 2024", …)
   - `image`    — just the filename you dropped in this folder

## Layout

- Photos are listed vertically, alternating sides:
  - **odd** rows (1st, 3rd, …): image on the left, location/date on the right
  - **even** rows (2nd, 4th, …): mirrored
- Each photo keeps its own proportions — portrait and landscape both display uncropped.
- `.jpg`, `.png`, `.webp` all work.
- Until an image exists, that entry shows a "NO IMAGE" placeholder — the section still works.
- The two `example-*` entries in `travel.json` are placeholders; replace them with your own.

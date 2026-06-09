# Drop your travel photos here ✈️

This folder (`public/travel/`) holds the photos shown on the Travel
**clothesline** — a sketched string of pinned photos you can drag/click through.

## To add photos

1. **Drop the image files here** — e.g. `lisbon-rooftops.jpg`
2. **Edit `src/data/travel.json`** — photos are organised into **location
   groups**, in display order along the line:

   ```json
   [
     {
       "location": "Domodossola, Italy",
       "date": "February 2026",
       "images": ["DSC01298.jpg", "DSC01313.jpg"]
     },
     {
       "location": "Switzerland",
       "date": "February 2026",
       "images": ["DSC01370.jpg", "DSC01467.jpg"]
     }
   ]
   ```

   - `location` — shown on a little pinned tag with an arrow pointing to that
     group's photos
   - `date`     — any text ("2024", "February 2026", …)
   - `images`   — just the filenames you dropped here, in order

   Add as many groups as you like — each becomes its own tag + run of photos.

## Layout

- Photos hang from a wobbly clothesline, clipped by sketched clothespins.
- The centre photo is sharp; neighbours dim and shrink.
- Click a neighbour, drag/swipe, or use the side chevrons to slide the line.
- Each photo keeps its own proportions — portrait and landscape both uncropped.
- `.jpg`, `.png`, `.webp` all work.
- A missing file shows a small hatched placeholder — the line still works.

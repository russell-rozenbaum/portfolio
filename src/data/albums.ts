import albumConfig from './albums.json'

export type Album = {
  /** Album name shown in the detail panel + on the spine */
  title: string
  /** Release date, written however you like — e.g. "March 2024" */
  release: string
  /** Web path to the cover image (built from the filename in albums.json) */
  cover: string
  /** Where clicking the album sends you */
  url: string
}

/**
 * The shelf is configured in `albums.json` — edit THAT file.
 *
 *   • Add an album    → new { } entry (order = left-to-right on the shelf)
 *   • Cover image     → drop it in public/albums/ and set "cover" to the filename
 *   • Release date    → "release", any text you want (e.g. "March 2024")
 *   • Link            → "url", where clicking the album goes
 *
 * Here we just turn each "cover" filename into a real web path (/albums/<file>).
 */
export const albums: Album[] = albumConfig.map((a) => ({
  title: a.title,
  release: a.release,
  url: a.url,
  cover: `/albums/${a.cover}`,
}))

import paintingsConfig from './paintings.json'

export type ArtPiece = {
  /** Date, written however you like — e.g. "2024" or "March 2024" */
  date: string
  /** Web path to the image (built from the filename in the JSON) */
  image: string
}

/**
 * Oil paintings gallery — configured by `paintings.json` + a drop folder,
 * same pattern as the music tracks and album covers.
 *
 *   Edit `paintings.json`, drop images in  public/paintings/
 *   Each entry: { "date": "...", "image": "<filename>" }
 */
export const paintings: ArtPiece[] = paintingsConfig.map((p) => ({
  date: p.date,
  image: `/paintings/${p.image}`,
}))

import travelConfig from './travel.json'

export type TravelStop = {
  /** Where the photo was taken — e.g. "Lisbon, Portugal" */
  location: string
  /** Date, written however you like — e.g. "2024" or "March 2024" */
  date: string
  /** Web path to the image (built from the filename in the JSON) */
  image: string
}

/**
 * Travel gallery — configured by `travel.json` + a drop folder,
 * same pattern as the oil paintings, music tracks, and album covers.
 *
 *   Edit `travel.json`, drop images in  public/travel/
 *   Each entry: { "location": "...", "date": "...", "image": "<filename>" }
 */
export const travel: TravelStop[] = travelConfig.map((t) => ({
  location: t.location,
  date: t.date,
  image: `/travel/${t.image}`,
}))

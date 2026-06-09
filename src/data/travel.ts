import travelConfig from './travel.json'

/**
 * Travel clothesline — configured by `travel.json` + a drop folder.
 *
 *   Edit `travel.json`, drop images in  public/travel/
 *   Each group: { "location": "...", "date": "...", "images": ["<filename>", …] }
 *
 * Groups are flattened into a single "track" of items hung on the line:
 * a location tag, then that location's photos, then the next tag, etc.
 *
 *   [Domodossola →] [img] [img] [Switzerland →] [img] [img] …
 */
export type TravelPhoto = {
  kind: 'photo'
  /** Web path to the image (built from the filename in the JSON) */
  image: string
  location: string
  date: string
  /** index of the group this photo belongs to */
  group: number
}

export type TravelLoc = {
  kind: 'loc'
  location: string
  date: string
  group: number
}

export type TravelItem = TravelPhoto | TravelLoc

export const travel: TravelItem[] = travelConfig.flatMap((g, gi) => [
  { kind: 'loc', location: g.location, date: g.date, group: gi } as TravelLoc,
  ...g.images.map(
    (img): TravelPhoto => ({
      kind: 'photo',
      image: `/travel/${img}`,
      location: g.location,
      date: g.date,
      group: gi,
    })
  ),
])
